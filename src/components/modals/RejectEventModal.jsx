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
      className="fixed inset-0 z-9999 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Container */}
      <div
        className="relative flex w-[85%] max-w-[550px] flex-col rounded-[20px] bg-white px-[40px] pb-[40px] pt-[20px] text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header nút X */}
        <div className="flex justify-end w-full mb-[5px]">
          <button
            className="bg-transparent border-none mr-[-10px] p-0 text-[35px] leading-none text-gray-300 transition-all duration-200 hover:scale-110 hover:text-gray-800"
            onClick={handleClose}
          >
            &times;
          </button>
        </div>

        {/* Nội dung */}
        <h2 className="m-0 text-[1.6rem] font-extrabold text-[#1a1a1a]">
          Từ chối sự kiện
        </h2>
        <p className="mt-[15px] text-[1.05rem] leading-relaxed text-[#555]">
          Vui lòng nhập lý do từ chối để nhà tổ chức có thể chỉnh sửa và gửi
          lại.
        </p>

        {/* Textarea */}
        <div className="mt-[15px] text-left">
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError("");
            }}
            placeholder="Nhập lý do từ chối..."
            rows={4}
            className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-gray-700 outline-none transition-all
              ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              }`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-5 w-full mt-[20px]">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 active:scale-95 shadow-md shadow-red-200 transition-all"
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
