import React from "react";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, title, message, onClose, type = "success" }) => {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mb-2">
            <svg
              className="h-9 w-9"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 mb-2">
            <svg
              className="h-9 w-9"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 mb-2">
            <svg
              className="h-9 w-9"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getButtonClass = (type) => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/20 hover:shadow-emerald-500/30";
      case "error":
        return "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/20 hover:shadow-red-500/30";
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/20 hover:shadow-amber-500/30";
      default:
        return "bg-gray-800 hover:bg-gray-900";
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* Container: Hộp thông báo hiện đại tối giản */}
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

        {/* Dynamic Contextual SVG Icon */}
        <div className="mt-2">
          {getIcon(type)}
        </div>

        {/* Nội dung */}
        <p className="mt-4 text-sm md:text-base leading-relaxed text-gray-500 dark:text-gray-400 text-center">
          {message}
        </p>

        {/* Nút Đóng */}
        <div className="mt-6 w-full">
          <button
            onClick={onClose}
            className={`w-full px-5 py-3 text-sm font-bold text-white rounded-xl active:scale-[0.98] shadow-lg transition-all duration-200 ${getButtonClass(type)}`}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
