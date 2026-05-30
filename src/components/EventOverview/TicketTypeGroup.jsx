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
    <>
      <tr className="bg-white group hover:bg-slate-50/30 transition-all duration-200">
        <td
          className="px-4 py-3 rounded-l-xl border-t border-b border-l border-slate-100 cursor-pointer"
          onClick={toggleOpen}
        >
          <div className="flex items-center gap-2">
            {hasSubTiers && (
              <span
                className={`material-symbols-outlined text-sm text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-indigo-500" : ""
                }`}
              >
                keyboard_arrow_down
              </span>
            )}
            <div>
              <p className="font-extrabold text-sm text-slate-800">{type.name}</p>
            </div>
          </div>
        </td>

        <td className="px-4 py-3 border-t border-b border-slate-100 font-semibold text-xs text-slate-400 italic">
          {hasSubTiers ? "Nhiều mức giá" : ""}
        </td>

        <td className="px-4 py-3 border-t border-b border-slate-100 text-sm font-bold text-slate-700">
          {type.totalQuantity}
        </td>

        <td className="px-4 py-3 border-t border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">{type.soldQuantity}</span>
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${(type.soldQuantity / type.totalQuantity) * 100}%`,
                }}
              />
            </div>
          </div>
        </td>

        <td className="px-4 py-3 border-t border-b border-slate-100 text-sm font-bold text-slate-700">
          {type.reservedQuantity}
        </td>

        <td className="px-4 py-3 border-t border-b border-slate-100 text-sm font-bold text-slate-700">
          {type.availableQuantity}
        </td>

        <td className="px-4 py-3 border-t border-b border-slate-100 text-sm font-extrabold text-slate-700">
          {type?.totalPrice?.toLocaleString()} đ
        </td>

        <td className="px-4 py-3 border-t border-b border-slate-100 text-sm font-extrabold text-amber-600">
          {type?.discountAmount ? `${type.discountAmount.toLocaleString()} đ` : "-"}
        </td>

        <td className="px-4 py-3 border-t border-b border-slate-100 text-sm font-extrabold text-indigo-600">
          {type?.finalPrice?.toLocaleString()} đ
        </td>

        <td className="px-4 py-3 border-t border-b border-slate-100">
          <div className="transform scale-90 origin-left">
            <TicketTypeStatusBadge status={type?.adminStatus} />
          </div>
        </td>
       
        <td className="px-4 py-3 rounded-r-xl border-t border-b border-r border-slate-100 text-right">
          <button className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        </td>
      </tr>

      {/* Render tier khi isOpen */}
      {isOpen &&
        type.ticketTiers?.map((tier) => (
          <TicketTierRow key={tier.id} tier={tier} />
        ))}
    </>
  );
};

export default TicketTypeGroup;
