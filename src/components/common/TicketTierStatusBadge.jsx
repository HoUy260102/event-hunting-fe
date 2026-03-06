import React from 'react';

// Mapping Status từ Backend sang UI (Tailwind classes)
const STATUS_CONFIG = {
  ACTIVE: { 
    label: "Đang hoạt động", 
    styles: "bg-green-100 text-green-700 border-green-200" 
  },
  ON_SALE: { 
    label: "Đang mở bán", 
    styles: "bg-blue-100 text-blue-700 border-blue-200" 
  },
  COMING_SOON: { 
    label: "Sắp mở bán", 
    styles: "bg-cyan-100 text-cyan-700 border-cyan-200" 
  },
  SUSPENDED: { 
    label: "Ngưng bán", 
    styles: "bg-amber-100 text-amber-700 border-amber-200" 
  },
  SOLD_OUT: { 
    label: "Hết vé", 
    styles: "bg-red-100 text-red-700 border-red-200" 
  },
  EXPIRED: { 
    label: "Hết hạn", 
    styles: "bg-gray-200 text-gray-700 border-gray-300" 
  },
  INACTIVE: { 
    label: "Ngưng hoạt động", 
    styles: "bg-slate-100 text-slate-500 border-slate-200" 
  },
  DELETED: { 
    label: "Đã xóa", 
    styles: "bg-white text-red-500 border-red-500 border-dashed" 
  },
};

const TicketTierStatusBadge = ({ status }) => {
  // Lấy cấu hình, nếu không có thì dùng default xám
  const config = STATUS_CONFIG[status] || { 
    label: status, 
    styles: "bg-gray-100 text-gray-400 border-gray-200" 
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
      ${config.styles}
    `}>
      {config.label}
    </span>
  );
};

export default TicketTierStatusBadge;