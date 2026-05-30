import React from 'react';
import TicketTierStatusBadge from '../common/TicketTierStatusBadge';

const TicketTierRow = ({ tier }) => (
  <div className="grid grid-cols-24 gap-2 items-center px-4 py-3 bg-slate-50/40 hover:bg-slate-50 border border-slate-100/50 rounded-2xl transition-all duration-150 relative">
    {/* Connector lines to show nesting hierarchical levels */}
    <div className="absolute -left-3 top-1/2 w-3 h-px bg-slate-200"></div>

    {/* Tên loại vé (Tier Name) */}
    <div className="col-span-4 min-w-0">
      <p className="text-xs font-bold text-slate-600 truncate">{tier.name}</p>
    </div>

    {/* Giá vé */}
    <div className="col-span-2 text-xs font-semibold text-slate-500">
      {tier?.unitPrice?.toLocaleString()} ₫
    </div>

    {/* Tổng số */}
    <div className="col-span-2 text-center text-xs font-bold text-slate-600">
      {tier.totalQuantity}
    </div>

    {/* Đã bán */}
    <div className="col-span-3 text-center text-xs font-bold text-slate-600">
      {tier.soldQuantity}
    </div>

    {/* Đã đặt */}
    <div className="col-span-2 text-center text-xs font-bold text-slate-600">
      {tier.reservedQuantity}
    </div>

    {/* Khả dụng */}
    <div className="col-span-2 text-center text-xs font-bold text-slate-600">
      {tier.availableQuantity}
    </div>

    {/* Doanh thu gộp */}
    <div className="col-span-3 text-right text-xs font-extrabold text-slate-600">
      {tier?.totalPrice?.toLocaleString()} ₫
    </div>

    {/* Chiết khấu */}
    <div className="col-span-2 text-right text-xs font-extrabold text-amber-600">
      {tier?.discountAmount ? `${tier.discountAmount.toLocaleString()} ₫` : "-"}
    </div>

    {/* Doanh thu thuần */}
    <div className="col-span-2 text-right text-xs font-extrabold text-indigo-600">
      {tier?.finalPrice?.toLocaleString()} ₫
    </div>

    {/* Trạng thái & Thao tác */}
    <div className="col-span-2 flex items-center justify-between pl-3">
      <div className="transform scale-90 origin-left">
        <TicketTierStatusBadge status={tier?.adminStatus} />
      </div>
      <button className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors shrink-0">
        <span className="material-symbols-outlined text-base">edit</span>
      </button>
    </div>
  </div>
);

export default TicketTierRow;