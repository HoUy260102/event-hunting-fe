import React from "react";
import { createPortal } from "react-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
const ConfirmModal = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Container: Cái hộp trắng chính giữa */}
      <div
        className="relative flex w-[85%] max-w-[380px] flex-col rounded-[20px] bg-white px-[30px] pb-[40px] pt-[20px] text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header chứa nút X */}
        <div className="flex justify-end w-full mb-[5px]">
          <button
            className="bg-transparent border-none mr-[-10px] p-0 text-[35px] leading-none text-gray-300 transition-all duration-200 hover:scale-110 hover:text-gray-800"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Nội dung Modal */}
        <h2 className="m-0 text-[1.6rem] font-extrabold text-[#1a1a1a]">
          {title}
        </h2>
        <p className="mt-[15px] text-[1.05rem] leading-relaxed text-[#555]">
          {message}
        </p>

        <div className="flex justify-between gap-5 w-full mt-[15px]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 active:scale-95 shadow-md shadow-red-200 transition-all"
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
