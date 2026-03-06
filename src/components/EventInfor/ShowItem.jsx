import { useState } from "react";
import TicketTypeItem from "./TicketTypeItem";
const ShowStatusButton = ({ status, onBuy }) => {
  const baseClass = "px-6 py-2 font-bold rounded-lg text-sm transition-all";
  switch (status) {
    case "ON_SALE":
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onBuy) onBuy();
          }}
          className={`${baseClass} bg-[#2DC275] text-black hover:bg-[#22A05E] shadow-lg active:scale-95`}
        >
          Mua vé ngay
        </button>
      );

    case "SOLD_OUT":
      return (
        <div
          className={`${baseClass} bg-gray-600 text-white cursor-default text-center`}
        >
          Hết vé
        </div>
      );

    case "UPCOMING":
      return (
        <div
          className={`${baseClass} bg-blue-600 text-white cursor-default text-center`}
        >
          Sắp diễn ra
        </div>
      );

    case "HAPPENING":
      return (
        <div
          className={`${baseClass} bg-orange-500 text-white cursor-default text-center animate-pulse`}
        >
          Đang diễn ra
        </div>
      );

    case "FINISHED":
      return (
        <div
          className={`${baseClass} bg-gray-800 text-gray-400 cursor-default text-center`}
        >
          Đã kết thúc
        </div>
      );

    case "CANCELLED":
      return (
        <div
          className={`${baseClass} bg-red-700 text-white cursor-default text-center opacity-70`}
        >
          Đã hủy
        </div>
      );

    default:
      return null;
  }
};

const ShowItem = ({ show, formatShowTime }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden bg-[#1E1E21] mb-4">
      {/* Header của Show */}
      <div
        className="w-full flex items-center justify-between p-4 bg-[#2D2D32] cursor-pointer hover:bg-[#36363B] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#2DC275] font-bold">
            {formatShowTime(show?.startTime, show?.endTime)}
          </span>
          <span className="text-gray-500 text-xs">{isOpen ? "▲" : "▼"}</span>
        </div>
        <ShowStatusButton
          status={show?.showTimeStatus}
        />
      </div>

      {/* Danh sách Ticket Types xổ xuống */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[1000px] opacity-100 p-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-3">
          {show?.ticketTypes?.map((ticketType) => (
            <TicketTypeItem key={ticketType.id} ticketType={ticketType} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default ShowItem;
