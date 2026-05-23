import React, { useEffect, useState } from "react";
import { formatDateVN } from "../../utils/format";
import axiosClient from "../../api/axiosClient";

const ReservationDetailModal = ({ isOpen, onClose, reservationId }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reservationId) {
      const fetchDetail = async () => {
        try {
          setIsLoading(true);
          const res = await axiosClient.get(`/reservations/${reservationId}/summary`);
          setData(res.data);
        } catch (error) {
          console.error("Error fetching reservation detail:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    } else if (!isOpen) {
      setData(null);
    }
  }, [isOpen, reservationId]);

  if (!isOpen) return null;

  const renderStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Chờ thanh toán", color: "bg-amber-100 text-amber-700 border-amber-200" },
      PAID: { label: "Đã thanh toán", color: "bg-green-100 text-green-700 border-green-200" },
      CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200" },
      EXPIRED: { label: "Hết hạn", color: "bg-gray-100 text-gray-700 border-gray-200" },
    };
    const config = statusMap[status?.toUpperCase()] || statusMap.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Chi tiết đặt chỗ</h2>
            <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Mã đơn: #{reservationId}</p>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-600 hover:shadow-md transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
              <div className="size-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium animate-pulse">Đang tải thông tin chi tiết...</p>
            </div>
          ) : !data ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
              <span className="material-symbols-outlined text-5xl">error</span>
              <p className="text-sm font-medium">Không tìm thấy dữ liệu đơn hàng</p>
            </div>
          ) : (
            <>
              {/* Section 1: Overview Status */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trạng thái đơn hàng</p>
                    <div className="mt-1">{renderStatusBadge(data?.status)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ngày đặt</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{formatDateVN(data?.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section 2: Customer Info */}
                <div className="space-y-4 flex flex-col">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <span className="material-symbols-outlined">person</span>
                    <h3 className="font-bold text-slate-800 tracking-tight">Thông tin khách hàng</h3>
                  </div>
                  <div className="p-5 rounded-2xl border border-slate-100 bg-white space-y-3 shadow-sm flex-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ tên</label>
                      <p className="text-sm font-bold text-slate-700">{data?.customerName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                      <p className="text-sm font-medium text-slate-600">{data?.customerEmail || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</label>
                      <p className="text-sm font-medium text-slate-600">{data?.customerPhone || "Chưa cung cấp"}</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Event Info */}
                <div className="space-y-4 flex flex-col">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <span className="material-symbols-outlined">event</span>
                    <h3 className="font-bold text-slate-800 tracking-tight">Thông tin sự kiện</h3>
                  </div>
                  <div className="p-5 rounded-2xl border border-slate-100 bg-white space-y-3 shadow-sm flex-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên sự kiện</label>
                      <p className="text-sm font-bold text-slate-700 line-clamp-2">{data?.eventName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suất diễn</label>
                      <p className="text-sm font-medium text-slate-600">
                        {formatDateVN(data?.showStartTime)} - {formatDateVN(data?.showEndTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Ticket Items */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="material-symbols-outlined">local_activity</span>
                  <h3 className="font-bold text-slate-800 tracking-tight">Danh sách vé đặt</h3>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Loại vé</th>
                        <th className="px-4 py-4 text-center">SL</th>
                        <th className="px-4 py-4 text-right">Đơn giá</th>
                        <th className="px-4 py-4 text-right">Tổng cộng</th>
                        <th className="px-4 py-4 text-right text-red-500">Giảm giá</th>
                        <th className="px-6 py-4 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data?.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-700">{item.ticketTypeName}</p>
                            {item.ticketTierName && <p className="text-[10px] text-slate-400">{item.ticketTierName}</p>}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-slate-600">{item.quantity}</td>
                          <td className="px-4 py-4 text-right text-slate-500 font-mono text-xs">
                            {item.unitPrice?.toLocaleString("vi-VN")}đ
                          </td>
                          <td className="px-4 py-4 text-right text-slate-500 font-mono text-xs">
                            {item.totalPrice?.toLocaleString("vi-VN")}đ
                          </td>
                          <td className="px-4 py-4 text-right text-red-400 font-mono text-xs">
                            {item.discountAmount > 0 ? `-${item.discountAmount?.toLocaleString("vi-VN")}đ` : "0đ"}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600">
                            {item.finalPrice?.toLocaleString("vi-VN")}đ
                          </td>
                        </tr>
                      ))}
                      {(!data?.items || data.items.length === 0) && (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-slate-400 italic">
                            Không có thông tin chi tiết vé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5: Payment Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="material-symbols-outlined">payments</span>
                  <h3 className="font-bold text-slate-800 tracking-tight">Chi tiết thanh toán</h3>
                </div>
                <div className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-sm overflow-hidden relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex gap-8">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hình thức</label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="px-3 py-1.5 bg-white rounded-lg border border-emerald-100 shadow-sm flex items-center gap-2">
                              <span className="material-symbols-outlined text-emerald-600 text-lg">account_balance_wallet</span>
                              <span className="text-sm font-bold text-slate-700">
                                {data?.paymentMethod === 'VNPAY' ? 'Cổng VNPAY' : data?.paymentMethod === 'MOMO' ? 'Ví MoMo' : data?.paymentMethod || "Chưa xác định"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày thanh toán</label>
                          <p className="text-sm font-bold text-slate-700 mt-1.5">{data?.paidAt ? formatDateVN(data.paidAt) : "—"}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã giao dịch</label>
                        <p className="text-sm font-mono text-emerald-700 mt-1 bg-white/50 px-2 py-1 rounded inline-block border border-emerald-100/50">
                          {data?.transactionId || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Tạm tính:</span>
                        <span className="font-bold text-slate-700">{data?.totalAmount?.toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Giảm giá:</span>
                        <span className="font-bold text-red-500">-{data?.discountAmount?.toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-emerald-100 flex justify-between items-center">
                        <span className="text-base font-bold text-slate-800">Tổng cộng:</span>
                        <span className="text-xl font-black text-emerald-600">{data?.finalAmount?.toLocaleString("vi-VN")}đ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-8 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all">
            Đóng
          </button>
          {data?.status === 'PAID' && (
            <button className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">print</span>
              In hóa đơn
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailModal;
