import React from 'react';
import TicketTierStatusBadge from '../common/TicketTierStatusBadge';

const TicketTierRow = ({ tier }) => {
  const formatQuantity = (val) => {
    if (val === null || val === undefined) return "-";
    return val;
  };

  const formatPrice = (val) => {
    if (val === null || val === undefined) return "-";
    return `${val.toLocaleString()} ₫`;
  };

  return (
    <div className="grid grid-cols-24 gap-3 items-center px-4 py-2 hover:bg-slate-100/40 rounded-xl transition-all duration-150 relative">
      {/* Nhánh ngang kết nối tới đường dọc của nhóm cha */}
      <div className="absolute -left-3 top-1/2 w-3 h-px bg-slate-200"></div>

      {/* Tên loại vé (Tier Name) - Sử dụng màu chữ Slate nhẹ để thể hiện cấp con */}
      <div className="col-span-3 min-w-0">
        <p className="text-xs font-bold text-slate-500 truncate uppercase tracking-wider">{tier.name}</p>
      </div>

      {/* Giá vé */}
      <div className="col-span-3 text-xs font-semibold text-slate-400 italic">
        {formatPrice(tier?.unitPrice)}
      </div>

      {/* Tổng số */}
      <div className="col-span-2 text-center text-xs font-extrabold text-slate-400">
        {formatQuantity(tier.totalQuantity)}
      </div>

      {/* Đã bán */}
      <div className="col-span-2 text-center text-xs font-extrabold text-slate-400">
        {formatQuantity(tier.soldQuantity)}
      </div>

      {/* Đã đặt */}
      <div className="col-span-1 text-center text-xs font-extrabold text-slate-400">
        {formatQuantity(tier.reservedQuantity)}
      </div>

      {/* Khả dụng */}
      <div className="col-span-1 text-center text-xs font-extrabold text-slate-400">
        {formatQuantity(tier.availableQuantity)}
      </div>

      {/* Doanh thu gộp */}
      <div className="col-span-3 text-right text-xs font-extrabold text-slate-500">
        {formatPrice(tier?.totalPrice)}
      </div>

      {/* Chiết khấu */}
      <div className="col-span-2 text-right text-xs font-extrabold text-amber-600/80">
        {tier?.discountAmount ? formatPrice(tier.discountAmount) : "-"}
      </div>

      {/* Doanh thu thuần */}
      <div className="col-span-3 text-right text-xs font-extrabold text-indigo-500/80">
        {formatPrice(tier?.finalPrice)}
      </div>

      {/* Trạng thái - Căn giữa hoàn hảo dưới header */}
      <div className="col-span-3 flex items-center justify-center whitespace-nowrap">
        <div className="transform scale-[0.8] origin-left shrink-0 whitespace-nowrap">
          <TicketTierStatusBadge status={tier?.adminStatus} />
        </div>
      </div>

      {/* Thao tác (Edit Button) - Riêng biệt ở col-span-1 */}
      <div className="col-span-1 flex items-center justify-end">
        <button className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors shrink-0">
          <span className="material-symbols-outlined text-base">edit</span>
        </button>
      </div>
    </div>
  );
};

export default TicketTierRow;