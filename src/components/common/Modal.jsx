import React from "react";
import { createPortal } from "react-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
const Modal = ({ isOpen, title, message, onClose, type = "success" }) => {
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "#4caf50" }} />
        );
      case "error":
        return <HighlightOffIcon sx={{ fontSize: 80, color: "#f44336" }} />;
      case "warning":
        return (
          <ReportProblemOutlinedIcon sx={{ fontSize: 80, color: "#ff9800" }} />
        );
      default:
        return null;
    }
  };
  if (!isOpen) return null;

  return createPortal(
    // Overlay: phủ toàn màn hình, làm mờ nền
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Container: Cái hộp trắng chính giữa */}
      <div
        className="relative flex w-[85%] max-w-[380px] flex-col rounded-[20px] bg-white px-[30px] pb-[40px] pt-[20px] text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header chứa nút X */}
        <div className="pb-3 border-b border-b-gray-200 flex justify-between items-center w-full mb-[5px]">
          <h3 className="text-[1.2rem] font-bold text-[#1a1a1a]">
            {title}
          </h3>
          <button
            className="leading-[0.7] flex justify-center bg-transparent border-none mr-[-10px] p-0 text-[35px] text-gray-300 transition-all duration-200 hover:scale-110 hover:text-gray-800"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="flex justify-center mb-4 scale-110 animate-bounce-short mt-[15px]">
          {getIcon(type)}
        </div>
        <p className="mt-[15px] text-[0.95rem] leading-relaxed text-[#555]">
          {message}
        </p>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
