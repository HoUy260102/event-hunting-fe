import React from "react";
import { createPortal } from "react-dom";

const RejectionReasonModal = ({ isOpen, onClose, reason }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative flex w-[85%] max-w-[520px] flex-col rounded-[20px] bg-white px-[40px] pb-[40px] pt-[20px] text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header nút X */}
        <div className="flex justify-end w-full mb-[5px]">
          <button
            className="bg-transparent border-none mr-[-10px] p-0 text-[35px] leading-none text-gray-300 transition-all duration-200 hover:scale-110 hover:text-gray-800"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-[10px]">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
        </div>

        {/* Tiêu đề */}
        <h2 className="m-0 text-[1.6rem] font-extrabold text-[#1a1a1a]">
          Lý do từ chối
        </h2>
        <p className="mt-[10px] text-[1.05rem] leading-relaxed text-[#555]">
          Sự kiện của bạn đã bị từ chối vì lý do sau:
        </p>

        {/* Lý do */}
        <div className="mt-[15px] rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-left">
          <p className="text-sm leading-relaxed text-red-700 whitespace-pre-wrap">
            {reason || "Không có lý do được cung cấp."}
          </p>
        </div>

        {/* Button */}
        <div className="w-full mt-[20px]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
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