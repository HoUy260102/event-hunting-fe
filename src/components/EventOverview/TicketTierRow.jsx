import React from 'react';
import TicketTierStatusBadge from '../common/TicketTierStatusBadge';

const TicketTierRow = ({ tier }) => (
  <tr className="bg-slate-50/40 hover:bg-slate-50/70 transition-colors">
    <td className="px-4 py-2.5 rounded-l-xl border-l border-t border-b border-slate-100">
      <div className="flex items-center gap-2 pl-6 relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200"></div>
        <div className="absolute left-3 top-1/2 w-2 h-px bg-slate-200"></div>
        <p className="text-xs font-bold text-slate-600">{tier.name}</p>
      </div>
    </td>
    <td className="px-4 py-2.5 border-t border-b border-slate-100 text-xs font-semibold text-slate-500">{tier?.unitPrice?.toLocaleString()} ₫</td>
    <td className="px-4 py-2.5 border-t border-b border-slate-100 text-xs font-bold text-slate-600">{tier.totalQuantity}</td>
    <td className="px-4 py-2.5 border-t border-b border-slate-100 text-xs font-bold text-slate-600">{tier.soldQuantity}</td>
    <td className="px-4 py-2.5 border-t border-b border-slate-100 text-xs font-bold text-slate-600">{tier.reservedQuantity}</td>
    <td className="px-4 py-2.5 border-t border-b border-slate-100 text-xs font-bold text-slate-600">{tier.availableQuantity}</td>
    <td className="px-4 py-2.5 border-t border-b border-slate-100 text-xs font-extrabold text-slate-600">{tier?.totalPrice?.toLocaleString()} ₫</td>
    <td className="px-4 py-2.5 border-t border-b border-slate-100 text-xs font-extrabold text-amber-600">{tier?.discountAmount ? `${tier.discountAmount.toLocaleString()} ₫` : "-"}</td>
    <td className="px-4 py-2.5 border-t border-b border-slate-100 text-xs font-extrabold text-indigo-600">{tier?.finalPrice?.toLocaleString()} ₫</td>
    <td className="px-4 py-2.5 border-t border-b border-slate-100">
      <div className="transform scale-90 origin-left">
        <TicketTierStatusBadge status={tier?.adminStatus} />
      </div>
    </td>
    <td className="px-4 py-2.5 rounded-r-xl border-r border-t border-b border-slate-100 text-right">
      <button className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors">
        <span className="material-symbols-outlined text-base">edit</span>
      </button>
    </td>
  </tr>
);

export default TicketTierRow;