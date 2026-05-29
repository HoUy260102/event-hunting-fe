import React, { useState } from "react";
import { createPortal } from "react-dom";

const RejectEventModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }
    onConfirm(reason.trim());
    setReason("");
    setError("");
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={handleClose}
    >
      {/* Container: Hộp thoại hiện đại */}
      <div
        className="relative flex w-full max-w-[480px] flex-col rounded-[24px] bg-white p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 transform scale-100 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title & Nút đóng trên cùng một dòng */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100 mb-5 text-left">
          <h2 className="m-0 text-lg md:text-xl font-black text-gray-900 tracking-tight leading-tight">
            Từ chối sự kiện
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 shrink-0 -mt-1"
            onClick={handleClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nội dung mô tả */}
        <p className="text-sm leading-relaxed text-gray-500 text-left mb-4">
          Vui lòng cung cấp lý do từ chối cụ thể để nhà tổ chức có thể nắm bắt thông tin, chỉnh sửa và gửi yêu cầu duyệt lại.
        </p>

        {/* Textarea nhập lý do */}
        <div className="text-left w-full">
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError("");
            }}
            placeholder="Lý do từ chối (ví dụ: Thiếu giấy phép tổ chức, hình ảnh sai quy cách...)"
            rows={4}
            className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-gray-700 outline-none transition-all duration-200
              ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              }`}
          />
          {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* Buttons thao tác */}
        <div className="flex justify-between gap-3 w-full mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-5 py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl active:scale-[0.98] shadow-lg shadow-red-500/20 transition-all duration-200"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RejectEventModal;
