import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDetailModal = ({ isOpen, onClose, userData }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUid = () => {
    if (userData?.id) {
      navigator.clipboard.writeText(userData.id);
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
    BLOCKED: {
      label: "Bị khóa",
      class: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30",
      dot: "bg-rose-500",
    },
    DELETED: {
      label: "Đã xóa",
      class: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30",
      dot: "bg-red-500",
    },
    UNVERIFIED: {
      label: "Chưa xác thực",
      class: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-900/30",
      dot: "bg-sky-500",
    },
  };

  const status = userData?.status?.toUpperCase() || "UNVERIFIED";
  const currentStatus = statusConfig[status] || statusConfig.UNVERIFIED;

  const roleLabels = {
    ADMIN: {
      name: "Quản trị viên",
      class: "bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-900/20",
      icon: "shield_person"
    },
    ORGANIZER: {
      name: "Nhà tổ chức",
      class: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/20",
      icon: "groups"
    },
    USER: {
      name: "Khách hàng",
      class: "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800/30 dark:text-slate-350 dark:border-slate-700/30",
      icon: "person"
    }
  };

  const currentRole = roleLabels[userData?.role?.name?.toUpperCase()] || {
    name: userData?.role?.name || "Khách hàng",
    class: "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800/30 dark:text-slate-350 dark:border-slate-700/30",
    icon: "person"
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

  const formatDob = (dobStr) => {
    if (!dobStr) return "Chưa cập nhật";
    try {
      const date = new Date(dobStr);
      if (isNaN(date.getTime())) return dobStr;
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dobStr;
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
              <span className="material-symbols-outlined text-[22px]">contact_page</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                Chi tiết tài khoản
              </h2>
              <p className="text-xs text-slate-400 dark:text-text-secondary-dark font-medium">
                Quản lý và tra cứu thông tin định danh thành viên
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
              
              {/* Avatar */}
              <div className="relative">
                <div className="size-20 rounded-full border border-slate-100 dark:border-border-dark p-1 bg-white dark:bg-[#1c2e18]">
                  <img
                    className="w-full h-full rounded-full object-cover"
                    src={userData?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || "U")}&background=f0fdf4&color=15803d&bold=true&size=128`}
                    alt={userData?.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || "U")}&background=f0fdf4&color=15803d&bold=true&size=128`;
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 size-6 bg-slate-100 dark:bg-border-dark border border-white dark:border-surface-dark rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-[13px] font-bold">{currentRole.icon}</span>
                </div>
              </div>

              {/* Identity info */}
              <div className="text-center md:text-left space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {userData?.name || "Chưa cập nhật"}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase ${currentRole.class}`}>
                    {currentRole.name}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-text-secondary-dark font-medium">
                  {userData?.email || "Chưa có email"}
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
                navigate(`/admin/update-user/${userData?.id}`);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2b4426] hover:bg-slate-50 dark:hover:bg-[#233b1f] text-slate-700 dark:text-white font-extrabold text-sm transition-all active:scale-95 shadow-sm bg-white dark:bg-[#1c2e18] whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Chỉnh sửa tài khoản
            </button>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            
            {/* Left Card: Information fields */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              <h4 className="text-xs font-black text-slate-400 dark:text-text-secondary-dark uppercase tracking-widest pl-1">
                Thông tin tài khoản
              </h4>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-sm space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* ID with Copy action */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                      Mã người dùng (UID):
                    </span>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-black/10 border border-slate-100 dark:border-border-dark p-2 rounded-xl">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-text-secondary-dark select-all">
                        {userData?.id || "—"}
                      </span>
                      <button
                        onClick={handleCopyUid}
                        className="size-7 rounded-lg hover:bg-slate-200/50 dark:hover:bg-[#233b1f] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-350 dark:hover:text-white transition-all"
                        title="Copy UID"
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
                        Họ và tên
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {userData?.name || "—"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Số điện thoại
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {userData?.phone || "Chưa cập nhật"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Ngày sinh
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {formatDob(userData?.dob)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                        Địa chỉ
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {userData?.address || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio Block */}
                <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-border-dark mt-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-secondary-dark tracking-wider block">
                    Tiểu sử (Bio)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-text-secondary-dark leading-relaxed italic bg-slate-50/50 dark:bg-black/10 p-3.5 rounded-xl border border-slate-50/20 dark:border-transparent">
                    {userData?.bio || "Không có nội dung giới thiệu tiểu sử."}
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
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-text-secondary-dark">Ngày đăng ký</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {formatDate(userData?.createdAt)}
                      </p>
                      {userData?.createdBy && (
                        <p className="text-[9px] text-slate-400 dark:text-text-secondary-dark font-medium">
                          Bởi ID: <span className="font-mono">{userData?.createdBy}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Point 2: Verification */}
                  <div className="relative">
                    <span className={`absolute -left-[25.5px] top-0.5 size-2.5 rounded-full border border-white dark:border-surface-dark ring-4 ${userData?.verifiedAt ? "bg-emerald-500 ring-emerald-500/10" : "bg-slate-200 dark:bg-slate-700 ring-transparent"}`}></span>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-text-secondary-dark">Xác thực</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {userData?.verifiedAt ? formatDate(userData?.verifiedAt) : "Chưa xác thực"}
                      </p>
                    </div>
                  </div>

                  {/* Point 3: Update */}
                  <div className="relative">
                    <span className="absolute -left-[25.5px] top-0.5 size-2.5 rounded-full bg-sky-500 border border-white dark:border-surface-dark ring-4 ring-sky-500/10"></span>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-text-secondary-dark">Cập nhật lần cuối</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {formatDate(userData?.updatedAt || userData?.createdAt)}
                      </p>
                      {userData?.updatedBy && (
                        <p className="text-[9px] text-slate-400 dark:text-text-secondary-dark font-medium">
                          Bởi ID: <span className="font-mono">{userData?.updatedBy}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Point 4: Delete */}
                  {userData?.deletedAt && (
                    <div className="relative">
                      <span className="absolute -left-[25.5px] top-0.5 size-2.5 rounded-full bg-rose-500 border border-white dark:border-surface-dark ring-4 ring-rose-500/10"></span>
                      <div className="space-y-0.5 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/50 dark:border-rose-950/30 p-2.5 rounded-lg">
                        <span className="text-[9px] uppercase font-black tracking-wider text-rose-500">Đã xóa tài khoản</span>
                        <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                          {formatDate(userData?.deletedAt)}
                        </p>
                        <p className="text-[9px] text-rose-450 dark:text-rose-400 font-medium">
                          Bởi ID: <span className="font-mono">{userData?.deletedBy || "N/A"}</span>
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

export default UserDetailModal;
