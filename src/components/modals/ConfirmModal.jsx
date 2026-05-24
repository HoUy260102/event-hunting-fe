import React from "react";
import { createPortal } from "react-dom";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    const lowerTitle = (title || "").toLowerCase();
    if (
      lowerTitle.includes("đăng xuất") ||
      lowerTitle.includes("thoát") ||
      lowerTitle.includes("xóa") ||
      lowerTitle.includes("hủy")
    ) {
      return "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/20 hover:shadow-red-500/30";
    }
    return "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/20 hover:shadow-emerald-500/30";
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* Container: Hộp xác nhận hiện đại tối giản */}
      <div
        className="relative flex w-full max-w-[380px] flex-col rounded-[24px] bg-white dark:bg-[#1E1E21] p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-white/5 transform scale-100 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title & Close Icon on the same line */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100 dark:border-white/5 mb-6 text-left">
          <h2 className="m-0 text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 shrink-0 -mt-1"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nội dung */}
        <p className="mt-2 text-sm md:text-base leading-relaxed text-gray-500 dark:text-gray-400 text-center">
          {message}
        </p>

        {/* Nút thao tác */}
        <div className="flex justify-between gap-3 w-full mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className={`flex-1 px-5 py-3 text-sm font-bold text-white rounded-xl active:scale-[0.98] shadow-lg transition-all duration-200 ${getConfirmButtonClass()}`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
