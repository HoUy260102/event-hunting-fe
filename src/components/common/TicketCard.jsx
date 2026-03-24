import React from "react";
import { formatDateVN, separateDateTime } from "../../utils/format";
import { useNavigate } from "react-router-dom";

const TicketCard = ({ ticket, isFinished }) => {
  const navigate = useNavigate();
  const { year, month, day } = separateDateTime(ticket?.showStartTime);
  return (
    <>
      <div className="w-full relative flex flex-col md:flex-row bg-[#131313] rounded-2xl overflow-visible border border-[#474848]/10 ticket-notches shadow-2xl group">
        {/* Date Sidebar (Left 25%) */}
        <div className="w-full md:w-1/4 flex flex-col items-center justify-center p-8 py-5">
          <div className="flex flex-col items-center text-center">
            <span className="font-headline text-4xl md:text-5xl font-black text-[#e7e5e5] tracking-tighter mb-1">
              {day}
            </span>
            <span className="font-headline text-lg font-bold text-[#acabab] uppercase tracking-[0.2em] mb-1">
              {month}
            </span>
            <span className="font-headline text-sm font-medium text-[#acabab]/60">
              {year}
            </span>
          </div>
        </div>

        {/* Perforation Divider (Visual only) */}
        <div className="hidden md:block ticket-divider"></div>

        {/* Main Content (Right 75%) */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between">
          <div>
            {/* Status Chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#1DB954] text-[#000000]">
                {isFinished ? "Đã kết thúc" : "Sắp diễn ra"}
              </span>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-[#474848] text-[#acabab] bg-[#131313]">
                Vé điện tử
              </span>
            </div>

            {/* Title */}
            <h3 className="font-headline text-xl md:text-2xl font-extrabold text-[#e7e5e5] leading-tight mb-5">
              {ticket?.eventName}
            </h3>

            {/* Details Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[#acabab] mt-0.5"
                  data-icon="confirmation_number"
                >
                  confirmation_number
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#e7e5e5]">
                    Mã đơn đặt hàng: {ticket?.reservationId}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[#acabab] mt-0.5"
                  data-icon="schedule"
                >
                  schedule
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#e7e5e5]">
                    {formatDateVN(ticket?.showStartTime)} -{" "}
                    {formatDateVN(ticket?.showEndTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[#acabab] mt-0.5"
                  data-icon="location_on"
                >
                  location_on
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#e7e5e5] leading-relaxed">
                    {ticket?.eventLocation}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-5 pt-3 border-t border-[#474848]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {navigate(`/my-tickets/${ticket?.id}`)}}
              className="text-[#acabab] hover:text-[#1DB954] transition-colors flex items-center gap-2 text-sm font-bold tracking-wide"
            >
              <span
                className="material-symbols-outlined text-xl"
                data-icon="info"
              >
                info
              </span>
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketCard;
