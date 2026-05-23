import React from "react";

function InfoTicketTypeModal({ isOpen, onClose, data, show }) {
  if (!isOpen || !data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusMap = {
    ACTIVE: { label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    INACTIVE: { label: "Tạm ẩn", color: "text-slate-400 bg-slate-50 border-slate-100" },
    SUSPENDED: { label: "Đã dừng", color: "text-amber-600 bg-amber-50 border-amber-100" },
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Chi tiết loại vé: {data.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-all">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng số lượng</p>
              <p className="text-xl font-bold text-slate-900">{data.totalQuantity}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Đã bán</p>
              <p className="text-xl font-bold text-emerald-700">{data.soldQuantity || 0}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Hình thức</p>
              <p className="text-sm font-bold text-blue-700">
                {data.seatingType === "SEATED" ? "Vé ngồi có số ghế" : "Vé đứng / tự do"}
              </p>
            </div>
          </div>

          {/* Sơ đồ ghế nếu có */}
          {data.seatMapSvg && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">event_seat</span>
                Sơ đồ vị trí ghế chi tiết
              </h4>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-10 overflow-hidden min-h-[400px] shadow-sm">
                <div
                  className="w-full max-w-3xl preview-svg-container"
                  dangerouslySetInnerHTML={{ __html: data.seatMapSvg }}
                />
              </div>
            </div>
          )}

          {/* Danh sách các đợt mở bán (Tiers) */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">schedule</span>
              Các giai đoạn mở bán (Tiers)
            </h4>

            <div className="space-y-4">
              {data.ticketTiers?.map((tier, index) => (
                <div key={tier.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </div>
                      <span className="font-bold text-slate-800">{tier.name}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusMap[tier.status]?.color || "text-slate-500"}`}>
                      {statusMap[tier.status]?.label || tier.status}
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Giá vé</p>
                      <p className="text-sm font-bold text-emerald-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tier.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Số lượng giới hạn / Đã bán</p>
                      <p className="text-sm font-bold text-slate-700">{tier.limitQuantity} / {tier.soldQuantity || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bắt đầu bán</p>
                      <p className="text-[11px] font-medium text-slate-600">{formatDate(tier.saleStartTime)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Kết thúc bán</p>
                      <p className="text-[11px] font-medium text-slate-600">{formatDate(tier.saleEndTime)}</p>
                    </div>
                  </div>
                  {tier.description && (
                    <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả</p>
                      <p className="text-xs text-slate-600 italic">{tier.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all"
          >
            Đóng
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}

export default InfoTicketTypeModal;
