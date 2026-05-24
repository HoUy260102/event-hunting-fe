import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CategoryDetailModal = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (data?.id) {
      navigator.clipboard.writeText(data.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusConfig = {
    ACTIVE: {
      label: "Hoạt động",
      class: "bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30",
      dot: "bg-emerald-500",
    },
    INACTIVE: {
      label: "Tạm ngưng",
      class: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30",
      dot: "bg-amber-500",
    },
    DELETED: {
      label: "Đã xóa",
      class: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30",
      dot: "bg-red-500",
    },
  };

  const status = data?.status?.toUpperCase() || "ACTIVE";
  const currentStatus = statusConfig[status] || statusConfig.ACTIVE;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft glass backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Premium Card */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1a2d17] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-all transform duration-300 scale-100">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 dark:border-border-dark bg-white dark:bg-surface-dark">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-[22px]">category</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                Chi tiết chủ đề
              </h2>
              <p className="text-xs text-slate-400 dark:text-text-secondary-dark font-medium">
                Quản lý phân loại và chủ đề của các sự kiện
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-[#233b1f] text-slate-400 hover:text-slate-700 dark:text-slate-350 dark:hover:text-white hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-slate-50/30 dark:bg-[#182a15]">
          
          {/* Profile Hero Block */}
          <div className="rounded-2xl bg-white dark:bg-surface-dark p-6 border border-slate-100 dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
              
              {/* Category Icon Wrapper */}
              <div className="relative">
                <div className="size-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-650 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                  <span className="material-symbols-outlined text-[36px]">folder_special</span>
                </div>
              </div>

              {/* Identity info */}
              <div className="text-center md:text-left space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {data?.name || "Chưa cập nhật"}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800/30 dark:text-slate-350 dark:border-slate-700/30">
                    Chủ đề
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-text-secondary-dark font-medium">
                  Slug: <span className="font-mono text-xs text-slate-655 dark:text-emerald-400 bg-slate-100 dark:bg-black/10 px-2 py-0.5 rounded">{data?.slug || "chua-cap-nhat"}</span>
                </p>
                <div className="flex justify-center md:justify-start">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold ${currentStatus.class}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`}></span>
                    {currentStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => {
                navigate(`/admin/update-category/${data?.id}`);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2b4426] hover:bg-slate-50 dark:hover:bg-[#233b1f] text-slate-700 dark:text-white font-extrabold text-sm transition-all active:scale-95 shadow-sm bg-white dark:bg-[#1c2e18] whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Chỉnh sửa chủ đề
            </button>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            
            {/* Left Card: Information fields */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              <h4 className="text-xs font-black text-slate-400 dark:text-text-secondary-dark uppercase tracking-widest pl-1">
                Thông tin chủ đề
              </h4>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-sm space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* ID with Copy action */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                      Mã chủ đề (ID):
                    </span>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-black/10 border border-slate-100 dark:border-border-dark p-2 rounded-xl">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-text-secondary-dark select-all">
                        {data?.id || "—"}
                      </span>
                      <button
                        onClick={handleCopyId}
                        className="size-7 rounded-lg hover:bg-slate-200/50 dark:hover:bg-[#233b1f] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-350 dark:hover:text-white transition-all"
                        title="Copy ID"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {copied ? "done" : "content_copy"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Tên chủ đề
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {data?.name || "—"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Slug (Định danh)
                      </span>
                      <p className="text-sm font-semibold text-slate-850 dark:text-slate-300 font-mono">
                        {data?.slug || "—"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Trạng thái hoạt động
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {data?.status === "ACTIVE" ? "Đang sử dụng" : "Tạm ngưng"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Block */}
                <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-border-dark mt-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                    Mô tả chi tiết chủ đề
                  </span>
                  <p className="text-xs text-slate-500 dark:text-text-secondary-dark leading-relaxed bg-slate-50/50 dark:bg-black/10 p-3.5 rounded-xl border border-slate-50/20 dark:border-transparent">
                    {data?.description || "Chưa cập nhật mô tả chi tiết cho chủ đề này."}
                  </p>
                </div>

              </div>
            </div>

            {/* Right Card: Audit logs / timeline */}
            <div className="lg:col-span-2 flex flex-col space-y-4">
              <h4 className="text-xs font-black text-slate-400 dark:text-text-secondary-dark uppercase tracking-widest pl-1">
                Lịch sử hoạt động
              </h4>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-sm flex-1">
                
                {/* Stepper Vertical Timeline */}
                <div className="relative pl-5 border-l border-slate-100 dark:border-[#2e4c27] space-y-6">
                  
                  {/* Point 1: Create */}
                  <div className="relative">
                    <span className="absolute -left-[25.5px] top-0.5 size-2.5 rounded-full bg-emerald-500 border border-white dark:border-surface-dark ring-4 ring-emerald-500/10"></span>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-text-secondary-dark">Ngày khởi tạo</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {formatDate(data?.createdAt)}
                      </p>
                      {data?.createdBy && (
                        <p className="text-[9px] text-slate-400 dark:text-text-secondary-dark font-medium">
                          Bởi ID: <span className="font-mono">{data?.createdBy}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Point 2: Update */}
                  <div className="relative">
                    <span className="absolute -left-[25.5px] top-0.5 size-2.5 rounded-full bg-sky-500 border border-white dark:border-surface-dark ring-4 ring-sky-500/10"></span>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-text-secondary-dark">Cập nhật lần cuối</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {formatDate(data?.updatedAt || data?.createdAt)}
                      </p>
                      {data?.updatedBy && (
                        <p className="text-[9px] text-slate-400 dark:text-text-secondary-dark font-medium">
                          Bởi ID: <span className="font-mono">{data?.updatedBy}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Point 3: Delete */}
                  {data?.deletedAt && (
                    <div className="relative">
                      <span className="absolute -left-[25.5px] top-0.5 size-2.5 rounded-full bg-rose-500 border border-white dark:border-surface-dark ring-4 ring-rose-500/10"></span>
                      <div className="space-y-0.5 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/50 dark:border-rose-950/30 p-2.5 rounded-lg">
                        <span className="text-[9px] uppercase font-black tracking-wider text-rose-500">Đã xóa chủ đề</span>
                        <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                          {formatDate(data?.deletedAt)}
                        </p>
                        <p className="text-[9px] text-rose-450 dark:text-rose-400 font-medium">
                          Bởi ID: <span className="font-mono">{data?.deletedBy || "N/A"}</span>
                        </p>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="p-6 px-8 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-border-dark flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#233b1f] dark:hover:bg-[#2b4426] text-white font-extrabold text-xs transition-all active:scale-95 whitespace-nowrap"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
};

export default CategoryDetailModal;
