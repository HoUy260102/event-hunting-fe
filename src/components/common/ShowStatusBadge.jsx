import React from 'react';

const SHOW_STATUS_MAP = {
  DRAFT: {
    label: "Bản nháp",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  ACTIVE: {
    label: "Hoạt động",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  POSTPONED: {
    label: "Tạm hoãn",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

const ShowStatusBadge = ({ status }) => {
  const config = SHOW_STATUS_MAP[status] || SHOW_STATUS_MAP.DRAFT;

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 
      rounded-full border text-xs font-medium 
      whitespace-nowrap transition-all duration-300
      ${config.color}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
};

export default ShowStatusBadge;