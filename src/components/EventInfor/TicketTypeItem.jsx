import { useState } from "react";
import TicketTypeStatusBadge from "../common/TicketTypeStatusBadge";

const TicketTypeItem = ({ ticketType }) => {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div className="bg-[#2D2D32] rounded-xl overflow-hidden hover:bg-[#36363B] transition-colors border border-white/5">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setShowDesc(!showDesc)}
      >
        <div className="flex flex-col">
          <span className="font-bold text-sm">
            {ticketType?.name} ({ticketType?.seatingType})
          </span>
          <span className="text-[10px] text-gray-400">
            {showDesc ? "Thu gọn mô tả ▲" : "Xem mô tả vé ▼"}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="block text-[#2DC275] font-extrabold text-base">
            {ticketType?.tierPrice?.toLocaleString("vi-VN")} đ
          </span>
          {/* Status Badge */}
          <TicketTypeStatusBadge status={ticketType?.status}></TicketTypeStatusBadge>
        </div>
      </div>

      {/* Phần Description xổ xuống */}
      <div 
        className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
          showDesc ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-2 border-t border-white/5 text-xs text-gray-400 italic">
          {ticketType?.tierDescription || "Không có mô tả chi tiết cho loại vé này."}
        </div>
      </div>
    </div>
  );
};
export default TicketTypeItem;