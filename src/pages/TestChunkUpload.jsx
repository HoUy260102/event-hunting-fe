import React, { useState, useRef } from "react";
import axios from "axios";
import axiosClient from "../api/axiosClient";
import { 
  FiUploadCloud, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiFile, 
  FiPlay, 
  FiCornerDownRight, 
  FiTrash2, 
  FiExternalLink 
} from "react-icons/fi";

export default function TestChunkUpload() {
  const [file, setFile] = useState(null);
  const [chunkSizeMB, setChunkSizeMB] = useState(6); // Cloudinary yêu cầu tối thiểu 5MB-6MB/chunk
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [logs, setLogs] = useState([]);
  const [uploadedResult, setUploadedResult] = useState(null);
  const [backendSignInfo, setBackendSignInfo] = useState(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const addLog = (msg, type = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, msg, type }]);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setProgress(0);
      setUploadedResult(null);
      setLogs([]);
      setBackendSignInfo(null);
      const calculatedChunks = Math.ceil(selected.size / (chunkSizeMB * 1024 * 1024));
      setTotalChunks(calculatedChunks);
      addLog(`Đã chọn file: ${selected.name} (${(selected.size / (1024 * 1024)).toFixed(2)} MB)`);
      addLog(`Dự kiến chia thành ${calculatedChunks} chunks (mỗi chunk ~${chunkSizeMB} MB)`);
    }
  };

  const startUpload = async () => {
    if (!file) {
      alert("Vui lòng chọn 1 file trước!");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadedResult(null);
    setLogs([]);
    abortControllerRef.current = new AbortController();

    try {
      // BƯỚC 1: Gọi API Backend để lấy Upload Signature
      addLog("🚀 BƯỚC 1: Đang gọi Backend Spring Boot API '/files/generate-signature'...", "info");
      
      const res = await axiosClient.get("/files/generate-signature");
      const signData = res?.data || res;
      
      if (!signData || !signData.signature) {
        throw new Error("Backend không trả về chữ ký signature hợp lệ!");
      }

      setBackendSignInfo(signData);
      addLog(`✅ Lấy chữ ký thành công! Cloud: ${signData.cloud_name}, Folder: ${signData.folder}`, "success");
      addLog(`Signature: ${signData.signature.substring(0, 16)}...`, "info");

      // BƯỚC 2: Chuẩn bị chia Chunks
      const CHUNK_SIZE = chunkSizeMB * 1024 * 1024;
      const totalSize = file.size;
      const totalCount = Math.ceil(totalSize / CHUNK_SIZE);
      setTotalChunks(totalCount);

      // Unique ID duy nhất cho toàn bộ quá trình upload của file này
      const uniqueUploadId = crypto.randomUUID();
      const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`;

      addLog(`📦 BƯỚC 2: Bắt đầu truyền ${totalCount} chunks trực tiếp lên Cloudinary...`, "info");

      let start = 0;
      let chunkIndex = 0;
      let finalData = null;

      while (start < totalSize) {
        const end = Math.min(start + CHUNK_SIZE, totalSize);
        const chunkBlob = file.slice(start, end);
        chunkIndex++;
        setCurrentChunk(chunkIndex);

        // Tạo FormData cho từng chunk
        const formData = new FormData();
        formData.append("file", chunkBlob);
        formData.append("api_key", signData.api_key);
        formData.append("timestamp", signData.timestamp);
        formData.append("signature", signData.signature);
        formData.append("folder", signData.folder);

        const contentRange = `bytes ${start}-${end - 1}/${totalSize}`;
        addLog(`Đang gửi Chunk ${chunkIndex}/${totalCount} [${contentRange}]...`, "info");

        // Gọi trực tiếp Cloudinary REST endpoint
        const chunkRes = await axios.post(uploadUrl, formData, {
          signal: abortControllerRef.current.signal,
          headers: {
            "Content-Type": "multipart/form-data",
            "X-Unique-Upload-Id": uniqueUploadId,
            "Content-Range": contentRange,
          },
          onUploadProgress: (progressEvent) => {
            const currentUploaded = start + progressEvent.loaded;
            const percentCompleted = Math.min(Math.round((currentUploaded / totalSize) * 100), 100);
            setProgress(percentCompleted);
          },
        });

        addLog(`✅ Chunk ${chunkIndex}/${totalCount} tải lên thành công (HTTP ${chunkRes.status})`, "success");

        // Khi gửi chunk cuối cùng, Cloudinary sẽ ghép xong và trả về metadata asset
        if (chunkRes.data && chunkRes.data.secure_url) {
          finalData = chunkRes.data;
          addLog("🎉 TOÀN BỘ CÁC CHUNK ĐÃ GHÉP THÀNH CÔNG TRÊN CLOUDINARY!", "success");
        }

        start = end;
      }

      setUploadedResult(finalData);
      setProgress(100);
      addLog("Hoàn tất quy trình upload!", "success");

    } catch (error) {
      if (axios.isCancel(error)) {
        addLog("⛔ Bạn đã hủy tiến trình upload.", "warning");
      } else {
        const errDetail = error.response?.data?.error?.message || error.message;
        addLog(`❌ Lỗi upload: ${errDetail}`, "error");
        console.error("Chunk upload error:", error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsUploading(false);
  };

  const resetForm = () => {
    cancelUpload();
    setFile(null);
    setProgress(0);
    setLogs([]);
    setUploadedResult(null);
    setBackendSignInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center">
      {/* Header */}
      <div className="max-w-4xl w-full mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold mb-3">
          🚀 Testing Lab: Cloudinary Direct Chunked Upload
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Thử Nghiệm Upload Theo Chunk & Signature
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Trang test độc lập: Xin chữ ký <span className="text-amber-400 font-mono">/files/generate-signature</span> từ Spring Boot, 
          tự động cắt nhỏ file thành từng phần (Chunk) và gửi trực tiếp lên CDN Cloudinary mà không tốn RAM server Backend.
        </p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Cột trái: Bộ điều khiển Upload */}
        <div className="md:col-span-5 flex flex-col gap-5">
          {/* Box chọn file */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <FiFile className="text-indigo-400" /> Chọn File Kiểm Thử
            </h2>

            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                file 
                  ? "border-emerald-500/50 bg-emerald-500/5" 
                  : "border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileChange}
              />
              <FiUploadCloud className="w-12 h-12 text-slate-500 mx-auto mb-2" />
              {file ? (
                <div>
                  <p className="text-sm font-medium text-emerald-400 truncate max-w-xs mx-auto">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || "unknown"}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-300 font-medium">Bấm để chọn file lớn (Ảnh, Video, ZIP...)</p>
                  <p className="text-xs text-slate-500 mt-1">Hỗ trợ file từ vài MB đến hàng trăm MB</p>
                </div>
              )}
            </div>

            {/* Cấu hình kích thước Chunk */}
            <div className="mt-5">
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Kích thước mỗi Chunk (Cloudinary khuyến nghị &gt;= 5MB):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[6, 10, 20].map((size) => (
                  <button
                    key={size}
                    type="button"
                    disabled={isUploading}
                    onClick={() => {
                      setChunkSizeMB(size);
                      if (file) {
                        setTotalChunks(Math.ceil(file.size / (size * 1024 * 1024)));
                      }
                    }}
                    className={`py-2 px-3 text-xs rounded-lg font-medium border transition-all ${
                      chunkSizeMB === size
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {size} MB / chunk
                  </button>
                ))}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={startUpload}
                disabled={!file || isUploading}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <FiPlay /> {isUploading ? "Đang truyền tải..." : "Bắt Đầu Upload"}
              </button>

              {isUploading ? (
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Hủy
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={!file}
                  className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition-all"
                  title="Xóa form"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>

          {/* Thông tin Signature từ Backend */}
          {backendSignInfo && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                <FiCheckCircle /> Backend Signature Payload:
              </div>
              <div className="space-y-1 text-slate-400">
                <p><span className="text-slate-200">Cloud Name:</span> {backendSignInfo.cloud_name}</p>
                <p><span className="text-slate-200">Target Folder:</span> {backendSignInfo.folder}</p>
                <p><span className="text-slate-200">Timestamp:</span> {backendSignInfo.timestamp}</p>
                <p><span className="text-slate-200">API Key:</span> {backendSignInfo.api_key}</p>
                <p className="truncate"><span className="text-slate-200">Signature:</span> {backendSignInfo.signature}</p>
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: Tiến độ, Nhật ký và Kết quả */}
        <div className="md:col-span-7 flex flex-col gap-5">
          {/* Thanh Tiến Độ Upload */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Tiến Trình Truyền Tải (Chunking Progress)
              </span>
              <span className="text-sm font-bold text-indigo-400 font-mono">
                {progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Chi tiết Chunk */}
            <div className="mt-3 flex justify-between items-center text-xs text-slate-400">
              <span>
                {isUploading || progress > 0
                  ? `Đang xử lý chunk: ${currentChunk} / ${totalChunks}`
                  : "Chờ bắt đầu..."}
              </span>
              <span>
                {file ? `Dung lượng: ${(file.size / (1024 * 1024)).toFixed(2)} MB` : ""}
              </span>
            </div>
          </div>

          {/* Console Nhật Ký Realtime (Logs) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Console Logs (Realtime Activity)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {logs.length} dòng
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-56 space-y-1.5 font-mono text-xs pr-2">
              {logs.length === 0 ? (
                <p className="text-slate-600 italic">Nhật ký quá trình gửi từng chunk sẽ hiển thị tại đây...</p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 leading-relaxed ${
                      log.type === "success"
                        ? "text-emerald-400"
                        : log.type === "error"
                        ? "text-rose-400 font-semibold"
                        : log.type === "warning"
                        ? "text-amber-400"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="text-slate-600 shrink-0">[{log.time}]</span>
                    <span>{log.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Khối hiển thị kết quả tải lên thành công */}
          {uploadedResult && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                <FiCheckCircle className="text-lg" />
                Upload Thành Công! Dữ liệu từ Cloudinary:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Thông tin kỹ thuật */}
                <div className="text-xs space-y-1.5 font-mono text-slate-300">
                  <p><span className="text-slate-500">Public ID:</span> {uploadedResult.public_id}</p>
                  <p><span className="text-slate-500">Format:</span> {uploadedResult.format}</p>
                  <p><span className="text-slate-500">Kích thước:</span> {(uploadedResult.bytes / (1024 * 1024)).toFixed(2)} MB</p>
                  <p><span className="text-slate-500">Resource:</span> {uploadedResult.resource_type}</p>
                  <div className="pt-2">
                    <a
                      href={uploadedResult.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
                    >
                      Mở File Trên CDN <FiExternalLink />
                    </a>
                  </div>
                </div>

                {/* Preview Thumbnail nếu là hình ảnh hoặc video */}
                <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-40">
                  {uploadedResult.resource_type === "video" ? (
                    <video
                      src={uploadedResult.secure_url}
                      controls
                      className="max-h-36 w-full object-contain"
                    />
                  ) : (
                    <img
                      src={uploadedResult.secure_url}
                      alt="Uploaded preview"
                      className="max-h-36 w-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
