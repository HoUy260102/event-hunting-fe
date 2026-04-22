import React from "react";

const ReservationSummaryInfo = ({ reservationInfo }) => {
  if (!reservationInfo) return null;

  const noScrollbarStyles = `
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full flex flex-col">
      <style>{noScrollbarStyles}</style>

      {/* 1. Header & ID đơn hàng */}
      <div className="p-6 bg-slate-900 text-white">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold uppercase tracking-tight">
            Tóm tắt đơn hàng
          </h3>
          <span className="bg-green-500 text-[10px] px-2 py-1 rounded-full font-bold">
            ĐANG GIỮ CHỖ
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
          Mã số: {reservationInfo?.id}
        </p>
      </div>

      <div className="p-6 space-y-6 flex-grow">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-3 text-slate-800">
            <span className="material-symbols-outlined text-sm">person</span>
            <span className="text-xs font-bold uppercase tracking-wider">
              Thông tin người mua
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[11px] text-gray-500">Họ tên:</span>
              <span className="text-[11px] font-semibold text-gray-800">
                {reservationInfo?.customerName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-gray-500">Email:</span>
              <span className="text-[11px] font-semibold text-gray-800">
                {reservationInfo?.customerEmail}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-gray-500">Số điện thoại:</span>
              <span className="text-[11px] font-semibold text-gray-800">
                {reservationInfo?.customerPhone || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Danh sách vé - Map từ reservationInfo.items */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 mb-1">
            <span className="material-symbols-outlined text-sm">
              confirmation_number
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              Chi tiết vé
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
            {reservationInfo?.items?.map((item, idx) => (
              <div
                key={item.id || idx}
                className="pb-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">
                      {item.ticketTypeName}
                    </h4>
                    <p className="text-[10px] text-green-600 font-bold uppercase">
                      {item.ticketTierName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {item.finalPrice?.toLocaleString() ??
                        item.totalPrice?.toLocaleString()}
                      đ
                    </div>

                    {item.finalPrice != null &&
                      item.finalPrice !== item.totalPrice && (
                        <div className="text-[10px] text-gray-400 line-through">
                          {item.totalPrice?.toLocaleString()}đ
                        </div>
                      )}
                  </div>
                </div>

                {/* Kiểm tra seatId trực tiếp trên từng item */}
                {item.seatId ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold">
                      Ghế: {item.seatDisplayName || item.seatCode}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                    <span className="text-[10px] text-gray-500 font-semibold">
                      Vé đứng (Standing)
                    </span>
                    <span className="text-[10px] font-bold text-gray-700">
                      x{item.quantity}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Tổng kết tiền & Hết hạn */}
        <div className="pt-4 border-t-2 border-dashed border-gray-100 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Tạm tính:</span>
            <span className="font-bold text-gray-800">
              {reservationInfo?.totalAmount?.toLocaleString()}đ
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Giảm giá:</span>
            <span className="font-bold text-gray-800">
              {reservationInfo?.discountAmount?.toLocaleString() || 0}đ
            </span>
          </div>

          <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center border border-green-100">
            <div>
              <span className="text-xs font-bold text-green-800 uppercase block">
                Tổng cộng
              </span>
            </div>
            <span className="text-2xl font-black text-green-700 tracking-tighter">
              {reservationInfo?.finalAmount?.toLocaleString()}đ
            </span>
          </div>

          {/* Hiển thị giờ hết hạn */}
          {reservationInfo?.expiresAt && (
            <div className="flex items-center justify-center gap-2 py-2 bg-amber-50 rounded-lg border border-amber-100">
              <span className="material-symbols-outlined text-amber-600 text-sm">
                timer
              </span>
              <span className="text-[11px] text-amber-800 font-bold uppercase">
                Hết hạn lúc:{" "}
                {new Date(reservationInfo.expiresAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationSummaryInfo;
