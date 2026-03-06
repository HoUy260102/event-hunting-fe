import React from "react";
import { useNavigate } from "react-router-dom";

const UserDetailModal = ({ isOpen, onClose, userData }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#142210]/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-[#eaf3e7] overflow-hidden flex flex-col max-h-[90vh]">
        {/* --- MODAL HEADER --- */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-[#eaf3e7]">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#5e9a4c]">
            Thông tin người dùng
          </h2>
          <button
            onClick={onClose}
            className="size-10 flex items-center justify-center rounded-xl bg-background-light text-[#5e9a4c] hover:scale-120 transition-all"
          >
            <span className="material-symbols-outlined font-bold">close</span>
          </button>
        </div>

        {/* --- MODAL BODY --- */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {/* 1. Phần Avatar, Tên, Email & Nút Edit */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-10 border-b border-[#eaf3e7]">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div
                  className="size-28 rounded-full border-4 border-primary bg-cover bg-center shadow-lg"
                  style={{
                    backgroundImage: `url(${userData?.avatar?.url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(userData?.name || "U") + "&background=dbdbdb&color=ffffff"})`,
                  }}
                ></div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#111b0d]">
                  {userData?.name || "N/A"}
                </h2>
                <p className="text-[#5e9a4c] font-medium text-lg">
                  {userData?.email || "No email provided"}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    {userData?.role?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                navigate(`/admin/update-user/${userData?.id}`);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-[#111b0d] font-bold text-sm hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. Phần Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  person
                </span>
                <h3 className="text-lg font-bold text-[#111b0d]">
                  Thông tin cá nhân
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 p-6 rounded-3xl bg-background-light/40 border border-[#eaf3e7]">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Id:
                  </label>
                  <p className="font-semibold text-lg break-all text-[#111b0d]">
                    {userData?.id || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Họ và tên:
                  </label>
                  <p className="font-semibold text-lg text-[#111b0d]">
                    {userData?.name || "—"}
                  </p>
                </div>
                {/* <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Last Name
                  </label>
                  <p className="font-semibold text-lg text-[#111b0d]">
                    {userData?.lastName || "—"}
                  </p>
                </div> */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Số điện thoại
                  </label>
                  <p className="font-semibold text-lg text-[#111b0d]">
                    {userData?.phone || "Not updated"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Ngày sinh
                  </label>
                  <p className="font-semibold text-lg text-[#111b0d]">
                    {userData?.dob || "Not updated"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Địa chỉ
                  </label>
                  <p className="font-semibold text-lg text-[#111b0d]">
                    {userData?.address || "Not updated"}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1 pt-2">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Bio
                  </label>
                  <p className="text-sm text-[#5e9a4c] leading-relaxed italic">
                    {userData?.bio || "No biography available for this user."}
                  </p>
                </div>
              </div>
            </div>

            {/* Audit */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  history
                </span>
                <h3 className="text-lg font-bold text-[#111b0d]">
                  Audit Trail
                </h3>
              </div>

              <div className="p-6 rounded-3xl bg-background-light/40 border border-[#eaf3e7] space-y-6">
                <div className="pt-6 border-[#eaf3e7] space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest">
                      Ngày xác thực tài khoản:
                    </label>
                    <p className="font-semibold text-[#111b0d] text-sm">
                      {userData?.verifiedAt || "Chưa xác thực tài khoản."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest">
                      Id người tạo:
                    </label>
                    <p className="font-semibold text-[#111b0d] text-sm">
                      {userData?.createdBy || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest">
                      Ngày tạo:
                    </label>
                    <p className="font-semibold text-[#111b0d] text-sm">
                      {userData?.createdAt || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest">
                      Id người chỉnh sửa:
                    </label>
                    <p className="font-semibold text-[#111b0d] text-sm">
                      {userData?.updatedBy || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest">
                      Ngày chỉnh sửa cuối cùng:
                    </label>
                    <p className="font-semibold text-[#111b0d] text-sm">
                      {userData?.updatedAt || "N/A"}
                    </p>
                  </div>
                  {userData?.deletedAt && (
                    <>
                      <div className="space-y-1 pt-2 border-t border-red-100">
                        <label className="text-[10px] uppercase font-bold text-red-400 tracking-widest block">
                          Id người xóa
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-red-500">
                            person_remove
                          </span>
                          <p className="font-mono text-xs font-bold text-red-600">
                            {userData?.updatedBy || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-red-100">
                        <label className="text-[10px] uppercase font-bold text-red-400 tracking-widest block">
                          Ngày xóa
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-red-500">
                            delete_forever
                          </span>
                          <p className="font-semibold text-[#111b0d] text-sm">
                            {userData?.deletedAt || "N/A"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MODAL FOOTER --- */}
        <div className="p-6 px-8 bg-background-light/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-10 py-2.5 rounded-full bg-[#111b0d] text-white font-bold text-sm hover:opacity-90 transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
