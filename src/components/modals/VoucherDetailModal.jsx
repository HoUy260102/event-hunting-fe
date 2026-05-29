import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateVN } from "../../utils/format";

const VoucherDetailModal = ({ isOpen, onClose, data }) => {
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
    DRAFT: {
      label: "Nháp",
      class: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/40 dark:text-slate-350 dark:border-slate-700",
      dot: "bg-slate-400",
    },
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
    EXPIRED: {
      label: "Hết hạn",
      class: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30",
      dot: "bg-rose-500",
    },
    DELETED: {
      label: "Đã xóa",
      class: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30",
      dot: "bg-red-500",
    },
  };

  const status = data?.status?.toUpperCase() || "ACTIVE";
  const currentStatus = statusConfig[status] || statusConfig.DRAFT;

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "—";
    return val.toLocaleString("vi-VN") + " đ";
  };

  const formatDiscountValue = () => {
    if (!data) return "—";
    const type = data.discountType?.toUpperCase();
    if (type === "PERCENT" || type === "PERCENTAGE") {
      return `${data.discountValue}%`;
    }
    return formatCurrency(data.discountValue);
  };

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
              <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                Chi tiết khuyến mãi
              </h2>
              <p className="text-xs text-slate-400 dark:text-text-secondary-dark font-medium">
                Tra cứu cấu hình và điều kiện áp dụng voucher
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

          {/* Voucher Coupon Ticket Hero Block */}
          <div className="rounded-2xl bg-white dark:bg-surface-dark p-6 border border-slate-100 dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">

              {/* Category Icon Wrapper */}
              <div className="relative">
                <div className="size-20 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex flex-col items-center justify-center text-amber-650 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-900/30">
                  <span className="material-symbols-outlined text-[36px]">percent</span>
                </div>
              </div>

              {/* Identity info */}
              <div className="text-center md:text-left space-y-2 flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                  {data?.name || "Chưa cập nhật"}
                </h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${currentStatus.class}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`}></span>
                    {currentStatus.label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30">
                    Mã: {data?.code || "—"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-text-secondary-dark font-medium pt-1">
                  Thời gian hiệu lực: <span className="font-semibold text-slate-700 dark:text-emerald-400">{formatDateVN(data?.startTime) || "—"}</span> đến <span className="font-semibold text-slate-700 dark:text-emerald-400">{formatDateVN(data?.endTime) || "—"}</span>
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => {
                navigate(`/admin/update-voucher/${data?.id}`);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2b4426] hover:bg-slate-50 dark:hover:bg-[#233b1f] text-slate-700 dark:text-white font-extrabold text-sm transition-all active:scale-95 shadow-sm bg-white dark:bg-[#1c2e18] whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Chỉnh sửa khuyến mãi
            </button>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">

            {/* Left Card: Information fields */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              <h4 className="text-xs font-black text-slate-400 dark:text-text-secondary-dark uppercase tracking-widest pl-1">
                Thông tin voucher
              </h4>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-sm space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* ID with Copy action */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                      Mã khuyến mãi (ID):
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
                        Tên chương trình
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {data?.name || "—"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Mã Coupon Code
                      </span>
                      <p className="text-sm font-bold text-slate-850 dark:text-amber-400 font-mono">
                        {data?.code || "—"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Loại hình giảm giá
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {(data?.discountType?.toUpperCase() === "PERCENT" || data?.discountType?.toUpperCase() === "PERCENTAGE") ? "Giảm theo phần trăm (%)" : "Giảm số tiền trực tiếp (đ)"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Mức giảm giá
                      </span>
                      <p className="text-sm font-extrabold text-emerald-650 dark:text-emerald-450">
                        {formatDiscountValue()}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Đơn hàng tối thiểu
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {formatCurrency(data?.minOrderValue)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Giảm giá tối đa
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {formatCurrency(data?.maxDiscountValue)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Phạm vi áp dụng
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {data?.scope?.toUpperCase() === "SYSTEM" ? "Toàn bộ hệ thống (System)" : "Áp dụng cho suất diễn cụ thể (Organizer)"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Số lượng phát hành
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {(data?.isUnlimited || data?.quantity === null || data?.quantity === undefined) ? "Không giới hạn" : data?.quantity?.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Số lượng đang tạm giữ
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {data?.reservedQuantity?.toLocaleString() || "0"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Số lượng đã sử dụng
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {data?.usedQuantity?.toLocaleString() || "0"}
                      </p>
                    </div>

                    {data?.showId && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                          Mã suất diễn (Show ID)
                        </span>
                        <p className="text-xs font-mono font-semibold text-slate-700 dark:text-text-secondary-dark break-all bg-slate-50 dark:bg-black/10 p-1.5 rounded">
                          {data?.showId}
                        </p>
                      </div>
                    )}
                  </div>
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
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-text-secondary-dark">Ngày tạo khuyến mãi</span>
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
                        <span className="text-[9px] uppercase font-black tracking-wider text-rose-500">Đã xóa khuyến mãi</span>
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

export default VoucherDetailModal;
