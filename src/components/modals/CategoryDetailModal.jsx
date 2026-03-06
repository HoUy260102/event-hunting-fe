import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryDetailModal = ({ isOpen, onClose, data }) => {
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
            Thông tin chủ đề
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
          <div className="flex flex-col md:flex-row items-center justify-end gap-6 mb-10 pb-10 border-b border-[#eaf3e7]">
            <button
              onClick={() => {
                navigate(`/admin/update-category/${data?.id}`);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-[#111b0d] font-bold text-sm hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Chỉnh sửa chủ đề
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
                  Thông tin chủ đề
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 p-6 rounded-3xl bg-background-light/40 border border-[#eaf3e7]">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Id:
                  </label>
                  <p className="font-semibold text-lg break-all text-[#111b0d]">
                    {data?.id || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Tên chủ đề:
                  </label>
                  <p className="font-semibold text-lg text-[#111b0d]">
                    {data?.name || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Slug
                  </label>
                  <p className="font-semibold text-lg text-[#111b0d]">
                    {data?.slug || "Not updated"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Trạng thái
                  </label>
                  <p className="font-semibold text-lg text-[#111b0d]">
                    {data?.status || "Not updated"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest block">
                    Mô tả
                  </label>
                  <p className="font-semibold text-lg text-[#111b0d]">
                    {data?.description || "Not updated"}
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
                      Id người tạo:
                    </label>
                    <p className="font-semibold text-[#111b0d] text-sm">
                      {data?.createdBy || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest">
                      Ngày tạo:
                    </label>
                    <p className="font-semibold text-[#111b0d] text-sm">
                      {data?.createdAt || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest">
                      Id người chỉnh sửa:
                    </label>
                    <p className="font-semibold text-[#111b0d] text-sm">
                      {data?.updatedBy || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#5e9a4c] tracking-widest">
                      Ngày chỉnh sửa cuối cùng:
                    </label>
                    <p className="font-semibold text-[#111b0d] text-sm">
                      {data?.updatedAt || "N/A"}
                    </p>
                  </div>
                  {data?.deletedAt && (
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
                            {data?.updatedBy || "N/A"}
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
                            {data?.deletedAt || "N/A"}
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

export default CategoryDetailModal;
