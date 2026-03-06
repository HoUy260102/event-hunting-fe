import React from 'react';
import TicketTierStatusBadge from '../common/TicketTierStatusBadge';
const TicketTierRow = ({ tier }) => (
  <tr className="bg-gray-50/50">
    <td className="px-4 py-2 border-l border-gray-200">
      <div className="flex items-center gap-2 pl-6 relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200"></div>
        <div className="absolute left-3 top-1/2 w-2 h-px bg-gray-200"></div>
        <p className="text-xs font-semibold text-gray-700">{tier.name}</p>
      </div>
    </td>
    <td className="px-4 py-2 text-xs font-medium">{tier.price.toLocaleString()} ₫</td>
    <td className="px-4 py-2 text-xs">{tier.totalQuantity}</td>
    <td className="px-4 py-2 text-xs font-bold">{tier.soldQuantity}</td>
    <td className="px-4 py-2">
      <TicketTierStatusBadge status={tier?.adminStatus}></TicketTierStatusBadge>
    </td>
    <td className="px-4 py-2">
      <TicketTierStatusBadge status={tier?.businessStatus}></TicketTierStatusBadge>
    </td>
    <td className="px-4 py-2 border-r border-gray-200 text-right">
      <button className="p-1 text-gray-400 hover:text-green-500"><span className="material-symbols-outlined text-base">edit</span></button>
    </td>
  </tr>
);

export default TicketTierRow;