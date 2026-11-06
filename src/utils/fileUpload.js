import axios from "axios";
import axiosClient from "../api/axiosClient";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB (Cloudinary Free limit cho ảnh)
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB (Cloudinary Free limit cho video)
const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB (Cloudinary khuyến nghị tối thiểu >= 5MB/chunk)
const MAX_RETRIES = 3; // Số lần thử lại tối đa cho mỗi chunk nếu gặp sự cố mạng

/**
 * Đọc 4KB đầu tiên của file thành chuỗi Base64 để Backend kiểm tra Magic Bytes
 */
export const readHeaderAsBase64 = (file, byteLength = 4096) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result;
        const base64 = typeof result === "string" ? result.split(",")[1] : "";
        resolve(base64);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file.slice(0, byteLength));
  });
};

/**
 * Helper thực hiện gửi request với cơ chế Retry tự động (Exponential Backoff)
 * Khi gặp sự cố mất mạng tạm thời hoặc lỗi 5xx/429 từ Cloudinary, sẽ tự động thử lại chunk đó.
 *
 * @param {Function} requestFn - Hàm trả về Promise của axios request
 * @param {number} maxRetries - Số lần thử lại tối đa (mặc định 3 lần)
 * @param {number} initialDelay - Thời gian chờ ban đầu (ms)
 */
async function uploadWithRetry(requestFn, maxRetries = MAX_RETRIES, initialDelay = 1000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      attempt++;

      const status = error.response?.status;
      // Nếu là lỗi client cố định (400 Bad Request, 401, 403, 404), không retry vì sẽ luôn thất bại
      const isClientError = status && status >= 400 && status < 500 && status !== 429;
      if (isClientError || attempt >= maxRetries) {
        throw error;
      }

      // Thời gian chờ tăng dần theo cấp số nhân: 1s, 2s, 4s...
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.warn(
        `[UPLOAD-RETRY] Gửi chunk thất bại (lần ${attempt}/${maxRetries}), đang thử lại sau ${delay}ms... Lý do:`,
        error.message || error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Upload file trực tiếp lên Cloudinary (Hybrid: Single Upload cho file nhỏ & Chunked Upload có Retry cho file lớn)
 * - Kiểm tra dung lượng (Image <= 10MB, Video <= 100MB)
 * - Gửi 4KB đầu cho Backend kiểm tra Magic Bytes & nhận Chữ ký Signature + FileID (PENDING)
 * - Nếu file <= 6MB: gửi 1 request duy nhất (kèm Retry)
 * - Nếu file > 6MB: tự động cắt thành các chunk 6MB truyền tuần tự (từng chunk có cơ chế Retry độc lập)
 * - Cập nhật secure_url về Backend
 *
 * @param {File} file - File được chọn từ input
 * @param {"IMAGE" | "VIDEO"} type - Loại file
 * @param {string} folder - Enum thư mục (vd: EVENT_BANNER, EVENT_POSTER, USER_AVATAR, ...)
 * @param {Function|null} onProgress - Callback tiến độ upload (0 - 100)
 * @returns {Promise<{ id: string, url: string }>}
 */
export async function uploadDirect(file, type = "IMAGE", folder, onProgress = null) {
  if (!file) {
    throw new Error("Vui lòng chọn file.");
  }

  // 1. Kiểm tra kích thước file
  const maxSize = type === "VIDEO" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  const maxLabel = type === "VIDEO" ? "100MB" : "10MB";
  if (file.size > maxSize) {
    throw new Error(`Dung lượng file vượt quá giới hạn cho phép (Tối đa ${maxLabel}).`);
  }

  // 2. Đọc 4KB đầu tiên thành Base64
  const headerBytes = await readHeaderAsBase64(file);

  // 3. Gọi Backend xác thực Magic Bytes & lấy chữ ký Cloudinary + File record (PENDING)
  const signRes = await axiosClient.post("/files/generate-signature", {
    fileName: file.name,
    fileType: type,
    folder: folder,
    fileSize: file.size,
    headerBytes: headerBytes,
  });

  const signData = signRes?.data || signRes;
  if (!signData || !signData.signature) {
    throw new Error(signRes?.message || "Không thể tạo chữ ký upload từ máy chủ.");
  }

  const resourceType = signData.resourceType || (type === "VIDEO" ? "video" : "image");
  const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/${resourceType}/upload`;

  let secureUrl = null;

  // 4. KIỂM TRA CHIA CHUNK:
  // Nếu file <= 6MB: Đẩy thẳng 1 lần (có Retry)
  // Nếu file > 6MB: Tự động chia thành từng chunk 6MB (từng chunk có Retry riêng)
  if (file.size <= CHUNK_SIZE) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", signData.timestamp);
    formData.append("signature", signData.signature);
    formData.append("public_id", signData.publicId);
    formData.append("folder", signData.folder);

    if (signData.allowedFormats) {
      formData.append("allowed_formats", signData.allowedFormats);
    }

    const cldRes = await uploadWithRetry(() =>
      axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      })
    );

    secureUrl = cldRes?.data?.secure_url;
  } else {
    // CHIA CHUNKS CHO FILE LỚN (> 6MB)
    const totalSize = file.size;
    const uniqueUploadId = "chunk_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    let start = 0;

    while (start < totalSize) {
      const end = Math.min(start + CHUNK_SIZE, totalSize);
      const chunkBlob = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunkBlob);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", signData.timestamp);
      formData.append("signature", signData.signature);
      formData.append("public_id", signData.publicId);
      formData.append("folder", signData.folder);

      if (signData.allowedFormats) {
        formData.append("allowed_formats", signData.allowedFormats);
      }

      const contentRange = `bytes ${start}-${end - 1}/${totalSize}`;

      // Từng chunk được bọc trong uploadWithRetry
      // Nếu chunk thứ 5 bị rớt mạng, hệ thống thử lại đúng chunk 5 mà không phải tải lại từ đầu
      const chunkRes = await uploadWithRetry(() =>
        axios.post(uploadUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-Unique-Upload-Id": uniqueUploadId,
            "Content-Range": contentRange,
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && totalSize) {
              const currentUploaded = start + progressEvent.loaded;
              const percent = Math.min(Math.round((currentUploaded / totalSize) * 100), 100);
              onProgress(percent);
            }
          },
        })
      );

      // Ở chunk cuối cùng, Cloudinary sẽ ghép xong và trả về metadata asset chứa secure_url
      if (chunkRes?.data?.secure_url) {
        secureUrl = chunkRes.data.secure_url;
      }

      start = end;
    }
  }

  if (!secureUrl) {
    throw new Error("Tải file lên Cloudinary không thành công.");
  }

  // 5. Cập nhật secure_url chính xác vào Database
  try {
    await axiosClient.post("/files/complete", {
      fileId: signData.fileId,
      url: secureUrl,
    });
  } catch (completeErr) {
    console.warn("Không thể đồng bộ URL hoàn tất lên BE:", completeErr);
  }

  return {
    id: signData.fileId,
    url: secureUrl,
  };
}
