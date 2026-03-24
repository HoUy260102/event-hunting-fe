import { useState } from "react";
import TicketTypeItem from "./TicketTypeItem";
import { formatShowTime } from "../../utils/format";
import ShowStatusButton from "./ShowStatusButton";
const ShowItem = ({ show, handleBuy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onBuy = () => {
    handleBuy(show);
  };
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
        <ShowStatusButton status={show?.status} onBuy={onBuy} />
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
