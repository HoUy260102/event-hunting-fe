import React from "react";
import { createPortal } from "react-dom";

const RejectionReasonModal = ({ isOpen, onClose, reason }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* Container: Hộp thoại hiện đại */}
      <div
        className="relative flex w-full max-w-[480px] flex-col rounded-[24px] bg-white p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 transform scale-100 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title & Nút đóng trên cùng một dòng */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100 mb-5 text-left">
          <h2 className="m-0 text-lg md:text-xl font-black text-gray-900 tracking-tight leading-tight">
            Lý do từ chối
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 shrink-0 -mt-1"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Icon & Mô tả */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 mb-3">
            <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-sm leading-relaxed text-gray-500 text-center">
            Sự kiện của bạn đã bị từ chối phê duyệt với lý do chi tiết dưới đây:
          </p>
        </div>

        {/* Khung chứa lý do */}
        <div className="rounded-xl bg-rose-50/50 border border-rose-100/80 px-4 py-3.5 text-left mb-6">
          <p className="text-sm leading-relaxed text-rose-700 font-semibold whitespace-pre-wrap">
            {reason || "Không có lý do chi tiết được cung cấp."}
          </p>
        </div>

        {/* Nút đóng */}
        <div className="w-full">
          <button
            onClick={onClose}
            className="w-full px-5 py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RejectionReasonModal;