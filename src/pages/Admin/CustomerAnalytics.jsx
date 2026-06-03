import React, { useState, useEffect } from "react";
import TimeFilterBar from "../../components/common/TimeFilterBar";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { useHeader } from "../../hooks/useHeader";

function CustomerAnalytics() {
  const { setTitle } = useHeader();
  
  useEffect(() => {
    setTitle("Thống kê Khách hàng Thân thiết");
  }, []);

  const [dates, setDates] = useState({
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
  });
  
  const [customers, setCustomers] = useState([]);
  const [totalUniqueCustomers, setTotalUniqueCustomers] = useState(0);
  const [retentionRate, setRetentionRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customer stats from backend API
  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsLoading(true);
      try {
        const res = await axiosClient.get("/analytics/customers", {
          params: {
            startDate: dates.startDate,
            endDate: dates.endDate,
            limit: 10,
          },
        });
        if (res?.status === 200 && res?.data) {
          setCustomers(res.data.customers || []);
          setTotalUniqueCustomers(res.data.totalUniqueCustomers || 0);
          setRetentionRate(res.data.retentionRate || 0);
        }
      } catch (err) {
        console.error("Lỗi khi tải thống kê khách hàng:", err);
        toast.error("Không thể tải dữ liệu thống kê khách hàng.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [dates]);

  const handleTimeChange = ({ startDate, endDate }) => {
    setDates({ startDate, endDate });
  };

  // Tính toán số liệu tổng hợp cho phần KPI ở đầu trang
  const totalAccumulatedSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalTicketsBought = customers.reduce((sum, c) => sum + c.totalTickets, 0);

  // Hạng 1 chi tiêu nhiều nhất sẽ dùng làm mốc 100% cho thanh progress bar
  const maxSpent = customers.length > 0 ? customers[0].totalSpent : 1;

  // Lấy chữ cái đầu làm Avatar dự phòng
  const getInitials = (name) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Khối Tiêu Đề Premium */}
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Báo cáo Khách hàng Thân thiết</h2>
        <p className="text-xs text-gray-500 mt-1">
          Theo dõi tổng chi tiêu, số lượng đơn hàng và số vé đã mua của những khách hàng thân thiết đóng góp nhiều nhất.
        </p>
      </div>

      {/* Bộ Lọc Thời Gian Đồng Bộ */}
      <div className="flex bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-sm items-center">
        <TimeFilterBar onFilterChange={handleTimeChange} />
      </div>

      {/* Grid thẻ KPI số liệu tổng quát của Top Customers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Số khách hàng trong danh sách */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 p-4 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-9xl">group</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Tổng số khách hàng
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-rounded">group</span>
            </div>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="h-8 w-24 bg-white/20 animate-pulse rounded-md"></div>
            ) : (
              <h2 className="text-2xl font-bold tracking-tight">
                {totalUniqueCustomers} khách hàng
              </h2>
            )}
            <p className="text-[10px] text-indigo-200">Đã đặt mua vé thành công</p>
          </div>
        </div>

        {/* Tổng doanh thu tích lũy từ nhóm này */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 p-4 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-9xl">payments</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Doanh thu tích lũy
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-rounded">payments</span>
            </div>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="h-8 w-36 bg-white/20 animate-pulse rounded-md"></div>
            ) : (
              <h2 className="text-2xl font-bold tracking-tight">
                {totalAccumulatedSpent.toLocaleString("vi-VN")} đ
              </h2>
            )}
            <p className="text-[10px] text-emerald-200">Tổng doanh thu nhận về từ Top 10</p>
          </div>
        </div>

        {/* Tổng số vé tiêu thụ */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 p-4 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-9xl">confirmation_number</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Số vé tiêu thụ
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-rounded">confirmation_number</span>
            </div>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="h-8 w-24 bg-white/20 animate-pulse rounded-md"></div>
            ) : (
              <h2 className="text-2xl font-bold tracking-tight">
                {totalTicketsBought.toLocaleString()} vé
              </h2>
            )}
            <p className="text-[10px] text-blue-200">Đã bán cho nhóm khách hàng này</p>
          </div>
        </div>

        {/* Tỷ lệ khách hàng quay lại */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 p-4 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-9xl">autorenew</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              Tỷ lệ quay lại
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-rounded">autorenew</span>
            </div>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="h-8 w-24 bg-white/20 animate-pulse rounded-md"></div>
            ) : (
              <h2 className="text-2xl font-bold tracking-tight">
                {retentionRate} %
              </h2>
            )}
            <p className="text-[10px] text-amber-200">Khách hàng mua từ 2 lần trở lên</p>
          </div>
        </div>
      </div>

      {/* Bảng vinh danh Top Customers */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-500">military_tech</span>
            <span className="font-bold text-gray-800 text-base">Bảng vinh danh Khách hàng mua nhiều nhất</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Xếp hạng theo tổng giá trị mua vé
          </span>
        </div>

        {isLoading ? (
          /* Khung skeleton loader khi dữ liệu đang tải */
          <div className="space-y-4 py-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-16 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          /* Trạng thái không có dữ liệu */
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="material-symbols-rounded text-5xl mb-3">person_search</span>
            <p className="text-sm font-medium">Chưa phát sinh dữ liệu khách hàng trong khoảng thời gian này</p>
          </div>
        ) : (
          /* Table chính hiển thị danh sách khách hàng */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100/80 pb-3">
                  <th className="py-3.5 px-4 text-center w-20">Thứ hạng</th>
                  <th className="py-3.5 px-4 min-w-[250px]">Khách hàng</th>
                  <th className="py-3.5 px-4 text-center w-32">Số đơn hàng</th>
                  <th className="py-3.5 px-4 text-center w-32">Số vé đã mua</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {customers.map((c, idx) => {
                  const contributionPercent = Math.min(100, Math.round((c.totalSpent / maxSpent) * 100));

                  return (
                    <tr
                      key={c.userId}
                      className="group hover:bg-slate-50/40 transition-colors duration-150 text-slate-600 text-sm font-medium"
                    >
                      {/* Cột Thứ hạng với badge xịn */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {idx === 0 ? (
                            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-xs shadow-sm border border-amber-200">
                              🥇
                            </span>
                          ) : idx === 1 ? (
                            <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-xs shadow-sm border border-slate-300">
                              🥈
                            </span>
                          ) : idx === 2 ? (
                            <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-extrabold text-xs shadow-sm border border-orange-200">
                              🥉
                            </span>
                          ) : (
                            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột thông tin User */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {c.avatarUrl ? (
                            <img
                              src={c.avatarUrl}
                              alt={c.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                              {getInitials(c.name)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors duration-150">
                              {c.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                              {c.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Số đơn hàng */}
                      <td className="py-4 px-4 text-center">
                        <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                          {c.totalBookings} đơn
                        </span>
                      </td>

                      {/* Số vé đã bán */}
                      <td className="py-4 px-4 text-center">
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                          {c.totalTickets} vé
                        </span>
                      </td>

                      {/* Tổng chi tiêu + Progress bar đóng góp */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 max-w-[200px]">
                          <div className="flex justify-between items-baseline">
                            <span className="font-extrabold text-slate-800">
                              {c.totalSpent.toLocaleString("vi-VN")} đ
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {contributionPercent}%
                            </span>
                          </div>
                          {/* Thanh tiến trình gradient thể hiện tỷ lệ chi tiêu */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${contributionPercent}%` }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerAnalytics;
