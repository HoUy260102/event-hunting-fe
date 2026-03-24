import React, { useState } from "react";

const TicketQuantityCard = ({ ticketType, onUpdateCart, quan = 0 }) => {
  const [quantity, setQuantity] = useState(quan);
  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 0 ? prev - 1 : 0));
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between group hover:border-green-500/50 transition-all gap-4">
      <div className="flex items-center gap-5 w-full md:w-auto">
        <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center text-green-600 group-hover:bg-lime-50 transition-colors shrink-0">
          <span className="material-symbols-outlined text-3xl">
            confirmation_number
          </span>
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-800">
            {ticketType?.name}({ticketType?.seatingType})
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-green-600 font-extrabold text-xl">
              {ticketType?.tierPrice?.toLocaleString()}đ
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 bg-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
              {ticketType?.tierName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
        <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
          <button
            type="button"
            onClick={decrement}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white hover:shadow-sm text-slate-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
          </button>

          <div className="w-10 text-center font-bold text-slate-800">
            {quantity}
          </div>

          <button
            type="button"
            onClick={increment}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white hover:shadow-sm text-slate-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onUpdateCart(ticketType, quantity);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-md shadow-lime-200 flex items-center gap-2 whitespace-nowrap"
        >
          <span>Chọn vé</span>
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};

export default TicketQuantityCard;
