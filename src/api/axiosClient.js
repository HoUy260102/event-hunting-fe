import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Kiểm tra xem JWT accessToken đã hết hạn chưa (hoặc sắp hết hạn trong 30s tới)
 */
const BUFFER_TIME_MS = 30 * 1000; // 30 giây phòng hờ độ trễ mạng

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    // Nếu token đã hết hạn hoặc chỉ còn <= 30s nữa hết hạn thì chủ động làm mới
    return Date.now() >= exp * 1000 - BUFFER_TIME_MS;
  } catch {
    return true;
  }
};

let refreshTokenPromise = null;

/**
 * Hàm gọi API refresh-token tập trung, chia sẻ promise giữa các request song song
 */
const refreshAuthToken = async () => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  const refreshToken = localStorage.getItem("refreshToken");
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }

  if (!refreshToken) {
    localStorage.removeItem("accessToken");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(new Error("Không tìm thấy refreshToken."));
  }

  refreshTokenPromise = (async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        { refreshToken },
        {
          headers: {
            "X-Device-Id": deviceId,
          },
        }
      );
      const newAccessToken = res.data?.data?.accessToken;
      const newRefreshToken = res.data?.data?.refreshToken;
      if (!newAccessToken || !newRefreshToken) {
        throw new Error("Không nhận được cặp token mới từ máy chủ.");
      }
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      return newAccessToken;
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw err;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

// Request Interceptor: Chủ động kiểm tra hạn token trước khi gửi request
axiosClient.interceptors.request.use(
  async (config) => {
    // Thêm Device ID
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }
    config.headers["X-Device-Id"] = deviceId;

    // Không can thiệp nếu là request login hoặc chính request refresh
    const isAuthRoute =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/refresh-token");

    if (isAuthRoute) {
      return config;
    }

    let accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // Nếu có accessToken nhưng đã hết hạn -> Chủ động refresh TRƯỚC KHI request bay đi
    if (accessToken && isTokenExpired(accessToken)) {
      if (refreshToken) {
        try {
          accessToken = await refreshAuthToken();
        } catch (error) {
          return Promise.reject(error);
        }
      } else {
        localStorage.removeItem("accessToken");
        accessToken = null;
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(new Error("Phiên đăng nhập đã hết hạn."));
      }
    }

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý dự phòng (fallback) nếu vẫn gặp 401
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorData = error.response?.data;
    const errorResponse = errorData || {
      status: error.response?.status || 500,
      message: error.message || "Lỗi kết nối server!",
      data: null,
    };

    if (
      error.response?.status === 401 &&
      (errorData?.code === "TOKEN_EXPIRED" ||
        errorData?.message?.includes("hết hạn") ||
        errorData?.message?.includes("expired")) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAuthToken();
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      window.location.href = "/forbidden";
      return Promise.reject(errorResponse);
    }

    const isInvalidAuthToken =
      errorData?.code === "TOKEN_INVALID" || errorData?.code === "TOKEN_EXPIRED";
    if (error.response?.status === 401 || isInvalidAuthToken) {
      if (window.location.pathname !== "/login") {
        const deviceId = localStorage.getItem("deviceId");
        localStorage.clear();
        if (deviceId) localStorage.setItem("deviceId", deviceId);
        window.location.href = "/login";
        return Promise.reject(errorResponse);
      }
    }

    return Promise.reject(errorResponse);
  }
);

export default axiosClient;
