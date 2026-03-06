import React from 'react';

const STATUS_CONFIG = {
  DRAFT: {
    label: "Nháp",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  PUBLISHED: {
    label: "Đã công khai",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  REJECTED: {
    label: "Bị từ chối",
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

const EventStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 
      rounded-full border text-xs font-medium 
      transition-colors duration-200
      ${config.color}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
};

export default EventStatusBadge;