import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Add Device ID
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }
    config.headers["X-Device-Id"] = deviceId;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

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
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");
      const deviceId = localStorage.getItem("deviceId");
      try {
        const res = await axios.post(
          "http://localhost:8080/api/v1/auth/refresh-token",
          { refreshToken },
          {
            headers: {
              "X-Device-Id": deviceId,
            },
          }
        );
        const newAccessToken = res.data?.data?.accessToken;
        if (!newAccessToken) {
          throw new Error("Không nhận được token mới từ máy chủ.");
        }
        localStorage.setItem("accessToken", newAccessToken);
        axiosClient.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      window.location.href = "/forbidden";
      return Promise.reject(errorResponse);
    }

    if (error.response?.status === 401) {
      if (window.location.pathname !== "/login") {
        // Clear auth data but keep deviceId
        const deviceId = localStorage.getItem("deviceId");
        localStorage.clear();
        if (deviceId) localStorage.setItem("deviceId", deviceId);
        window.location.href = "/login";
        return Promise.reject(errorResponse);
      }
    }

    return Promise.reject(errorResponse);
  },
);

export default axiosClient;
