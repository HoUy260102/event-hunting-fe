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
      <tr className="bg-white group">
        <td
          className="px-4 py-3 rounded-tl-lg border-t border-l border-gray-200 cursor-pointer"
          onClick={toggleOpen}
        >
          <div className="flex items-center gap-2">
            {hasSubTiers && (
              <span
                className={`material-symbols-outlined text-sm text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                keyboard_arrow_down
              </span>
            )}

            <div>
              <p className="font-bold text-sm text-gray-800">{type.name}</p>
              {/* <p className="text-[10px] text-gray-500">{type.description}</p> */}
            </div>
          </div>
        </td>

        <td className="px-4 py-3 border-t border-gray-200 font-semibold text-sm text-gray-400 italic">
          {hasSubTiers ? "Nhiều mức giá" : ""}
        </td>

        <td className="px-4 py-3 border-t border-gray-200 text-sm font-bold">
          {type.totalQuantity}
        </td>

        <td className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{type.soldQuantity}</span>
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${(type.soldQuantity / type.totalQuantity) * 100}%`,
                }}
              />
            </div>
          </div>
        </td>

        <td className="px-4 py-3 border-t border-gray-200 text-sm font-bold">
          {type.reservedQuantity}
        </td>

        <td className="px-4 py-3 border-t border-gray-200 text-sm font-bold">
          {type.availableQuantity}
        </td>

        <td className="px-4 py-3 border-t border-gray-200 text-sm font-bold">
          {type?.totalPrice?.toLocaleString()}
        </td>

        <td className="px-4 py-3 border-t border-gray-200 text-sm font-bold">
          {type?.discountAmount?.toLocaleString()}
        </td>

        <td className="px-4 py-3 border-t border-gray-200 text-sm font-bold">
          {type?.finalPrice?.toLocaleString()}
        </td>

        <td className="px-4 py-3 border-t border-gray-200">
          <TicketTypeStatusBadge
            status={type?.adminStatus}
          ></TicketTypeStatusBadge>
        </td>
       
        <td className="px-4 py-3 rounded-tr-lg border-t border-r border-gray-200 text-right">
          <button className="p-1.5 text-gray-400 hover:text-green-500">
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
