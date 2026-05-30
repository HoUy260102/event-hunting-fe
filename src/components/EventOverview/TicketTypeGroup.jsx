import React, { useState } from "react";
import TicketTierRow from "./TicketTierRow";
import TicketTypeStatusBadge from "../common/TicketTypeStatusBadge";

const TicketTypeGroup = ({ type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubTiers = type.ticketTiers && type.ticketTiers.length > 0;

  const toggleOpen = () => {
    if (hasSubTiers) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="space-y-2">
      <div 
        onClick={toggleOpen}
        className="grid grid-cols-24 gap-2 items-center px-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200 cursor-pointer group"
      >
        {/* Tên loại vé */}
        <div className="col-span-4 flex items-center gap-1.5 min-w-0">
          {hasSubTiers && (
            <span
              className={`material-symbols-outlined text-sm text-slate-400 transition-transform duration-200 shrink-0 ${
                isOpen ? "rotate-180 text-indigo-500 font-bold" : ""
              }`}
            >
              keyboard_arrow_down
            </span>
          )}
          <p className="font-extrabold text-sm text-slate-800 truncate">{type.name}</p>
        </div>

        {/* Giá vé */}
        <div className="col-span-2 text-xs font-bold text-slate-400 italic">
          {hasSubTiers ? "Nhiều mức giá" : `${type.price?.toLocaleString()} đ`}
        </div>

        {/* Tổng số */}
        <div className="col-span-2 text-center text-sm font-extrabold text-slate-700">
          {type.totalQuantity}
        </div>

        {/* Đã bán */}
        <div className="col-span-3 flex items-center justify-center gap-3">
          <span className="text-sm font-extrabold text-slate-700 w-8 text-right shrink-0">{type.soldQuantity}</span>
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${Math.min((type.soldQuantity / (type.totalQuantity || 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Vé đã đặt */}
        <div className="col-span-2 text-center text-sm font-extrabold text-slate-700">
          {type.reservedQuantity}
        </div>

        {/* Vé khả dụng */}
        <div className="col-span-2 text-center text-sm font-extrabold text-slate-700">
          {type.availableQuantity}
        </div>

        {/* Doanh thu gộp */}
        <div className="col-span-3 text-right text-sm font-extrabold text-slate-700">
          {type?.totalPrice?.toLocaleString()} đ
        </div>

        {/* Chiết khấu */}
        <div className="col-span-2 text-right text-sm font-extrabold text-amber-600">
          {type?.discountAmount ? `${type.discountAmount.toLocaleString()} đ` : "-"}
        </div>

        {/* Doanh thu thuần */}
        <div className="col-span-2 text-right text-sm font-extrabold text-indigo-600">
          {type?.finalPrice?.toLocaleString()} đ
        </div>

        {/* Trạng thái & Thao tác */}
        <div className="col-span-2 flex items-center justify-between pl-3" onClick={(e) => e.stopPropagation()}>
          <div className="transform scale-90 origin-left">
            <TicketTypeStatusBadge status={type?.adminStatus} />
          </div>
          <button className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors shrink-0">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        </div>
      </div>

      {/* Render sub-tiers */}
      {isOpen && (
        <div className="space-y-2 pl-6 relative transition-all duration-300">
          <div className="absolute left-3 top-0 bottom-3 w-px bg-slate-200"></div>
          {type.ticketTiers?.map((tier) => (
            <TicketTierRow key={tier.id} tier={tier} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketTypeGroup;
