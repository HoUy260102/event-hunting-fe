import React, { useState, useEffect } from "react";
import TimeFilterBar from "../../components/common/TimeFilterBar";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import { useHeader } from "../../hooks/useHeader";

function TopEventItem({ event, idx }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="group border border-slate-100/80 rounded-xl overflow-hidden bg-white/30 hover:bg-white/60 transition-all duration-200 shadow-sm">
      {/* Hàng Header sự kiện */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
            idx === 0 ? "bg-amber-100 text-amber-700" :
            idx === 1 ? "bg-slate-200 text-slate-700" :
            idx === 2 ? "bg-orange-100 text-orange-700" :
            "bg-slate-100 text-slate-500"
          }`}>
            {idx + 1}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-indigo-600 transition-colors duration-150">
              {event.name}
            </h4>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
              <span className="material-symbols-rounded text-[12px]">schedule</span>
              {event.topShows?.length || 0} suất diễn được tổ chức (Click để xem chi tiết)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 pr-2 ml-4">
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Vé đã bán</span>
            <span className="text-sm font-bold text-slate-700">{event.ticketsSold?.toLocaleString()} vé</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Doanh thu</span>
            <span className="text-sm font-extrabold text-indigo-600">{event.revenue?.toLocaleString("vi-VN")} đ</span>
          </div>
          <div className="text-slate-400">
            <span className={`material-symbols-rounded transition-transform duration-200 block text-lg ${isOpen ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Chi tiết suất diễn (Shows) khi mở rộng */}
      {isOpen && (
        <div className="bg-slate-50/50 border-t border-slate-100/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold px-2 pb-1.5 border-b border-slate-100/80">
            <span>Suất diễn (Show)</span>
            <div className="flex gap-8">
              <span className="w-16 text-right">Số vé bán</span>
              <span className="w-24 text-right">Doanh thu</span>
            </div>
          </div>
          {event.topShows && event.topShows.length > 0 ? (
            event.topShows.map((show, sIdx) => (
              <div
                key={show.showId}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white transition-colors duration-150 text-xs text-slate-600"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${sIdx === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {sIdx + 1}
                  </span>
                  <span className="font-semibold text-slate-700">{show.startTime}</span>
                  {sIdx === 0 && (
                    <span className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-emerald-500/10 scale-90">
                      Bán chạy nhất
                    </span>
                  )}
                </div>
                <div className="flex gap-8 font-semibold">
                  <span className="w-16 text-right text-slate-700">{show.ticketsSold?.toLocaleString()} vé</span>
                  <span className="w-24 text-right text-slate-800 font-bold">{show.revenue?.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-400 py-3">Chưa phát sinh lượt mua vé cho suất diễn nào</div>
          )}
        </div>
      )}
    </div>
  );
}

function DashboardOverview() {
  const { setTitle } = useHeader();
  useEffect(() => {
    setTitle("Dashboard");
  }, []);

  const [dates, setDates] = useState({
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
  });
  const [groupType, setGroupType] = useState("MONTH");
  const [overviewData, setOverviewData] = useState({
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalBookings: 0,
    totalEventsCreated: 0,
    topEvents: [],
    ticketTierDistribution: [],
  });
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChartMetric, setActiveChartMetric] = useState("revenue"); // "revenue" | "tickets"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const overviewRes = await axiosClient.get("/analytics/overview", {
          params: {
            startDate: dates.startDate,
            endDate: dates.endDate,
          },
        });
        if (overviewRes?.status === 200 && overviewRes?.data) {
          setOverviewData(overviewRes.data);
        }

        const chartRes = await axiosClient.get("/analytics/chart", {
          params: {
            startDate: dates.startDate,
            endDate: dates.endDate,
            type: groupType,
          },
        });
        if (chartRes?.status === 200 && chartRes?.data) {
          setChartData(chartRes.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thống kê:", err);
        toast.error("Không thể tải dữ liệu thống kê. Vui lòng thử lại!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dates, groupType]);

  const handleTimeChange = ({ startDate, endDate, mode }) => {
    setDates({ startDate, endDate });
    // Tự động định hướng groupType tối ưu dựa theo chế độ chọn
    if (mode === "month") {
      setGroupType("DAY");
    } else if (mode === "year") {
      setGroupType("MONTH");
    } else {
      const days = (new Date(endDate) - new Date(startDate)) / (24 * 60 * 60 * 1000);
      if (days > 30) {
        setGroupType("MONTH");
      } else {
        setGroupType("DAY");
      }
    }
  };

  // Tính toán tọa độ vẽ biểu đồ SVG tự động
  const renderSVGChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-80 text-gray-400">
          <span className="material-symbols-rounded text-5xl mb-2">trending_flat</span>
          <p>Không có dữ liệu trong khoảng thời gian này</p>
        </div>
      );
    }

    const svgWidth = 800;
    const svgHeight = 300;
    const padding = { top: 30, right: 30, bottom: 40, left: 60 };

    const values = chartData.map((d) =>
      activeChartMetric === "revenue" ? d.revenue : d.ticketsSold
    );
    const maxValue = Math.max(...values, 1);

    const xStride = chartData.length > 1 ? (svgWidth - padding.left - padding.right) / (chartData.length - 1) : 0;

    const points = chartData.map((d, index) => {
      const x = padding.left + index * xStride;
      const val = activeChartMetric === "revenue" ? d.revenue : d.ticketsSold;
      const y = svgHeight - padding.bottom - (val / maxValue) * (svgHeight - padding.top - padding.bottom);
      return { x, y, label: d.label, revenue: d.revenue, tickets: d.ticketsSold };
    });

    // Đường Path chính
    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    // Gradient Path đổ bóng nền bên dưới
    const areaD = pathD
      ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding.bottom} L ${points[0].x} ${svgHeight - padding.bottom} Z`
      : "";

    return (
      <div className="relative w-full bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          {/* Cột 1: Tiêu đề xu hướng */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-500">trending_up</span>
            <span className="font-bold text-gray-800 text-sm whitespace-nowrap">Xu hướng thống kê</span>
          </div>

          {/* Cột 2: Các nút chuyển đổi (Doanh thu / Số vé) */}
          <div className="justify-self-start sm:justify-self-end md:justify-self-center">
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-inner">
              <button
                onClick={() => setActiveChartMetric("revenue")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${activeChartMetric === "revenue"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                Doanh thu (đ)
              </button>
              <button
                onClick={() => setActiveChartMetric("tickets")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${activeChartMetric === "tickets"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                Số vé bán ra
              </button>
            </div>
          </div>

          {/* Cột 3: Gợi ý rê chuột */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 justify-self-start md:justify-self-end flex items-center gap-1.5 text-[11px] text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            <span className="material-symbols-rounded text-[14px]">info</span>
            <span className="whitespace-nowrap">Rê chuột vào các điểm để xem chi tiết</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Các đường lưới dọc & nhãn trục X */}
            {points.map((p, i) => {
              // Chỉ hiện nhãn nhảy bậc để tránh đè chữ nếu mảng quá dài
              const showLabel = chartData.length <= 15 || i % Math.ceil(chartData.length / 10) === 0;
              return (
                <g key={i}>
                  {showLabel && (
                    <line
                      x1={p.x}
                      y1={padding.top}
                      x2={p.x}
                      y2={svgHeight - padding.bottom}
                      stroke="#f1f5f9"
                      strokeWidth="1.5"
                    />
                  )}
                  {showLabel && (
                    <text
                      x={p.x}
                      y={svgHeight - 15}
                      textAnchor="middle"
                      className="text-[10px] fill-gray-400 font-medium"
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Trục Y lưới ngang */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding.top + ratio * (svgHeight - padding.top - padding.bottom);
              const gridVal = maxValue - ratio * maxValue;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-gray-400 font-medium"
                  >
                    {activeChartMetric === "revenue"
                      ? `${Math.round(gridVal / 1000).toLocaleString()}k`
                      : Math.round(gridVal).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Vẽ mảng Gradient bên dưới đường Line */}
            {areaD && <path d={areaD} fill="url(#chartGlow)" />}

            {/* Vẽ đường Path chính */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Các điểm tròn tương tác */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.index === i ? 6 : 4}
                fill={hoveredPoint?.index === i ? "#ffffff" : "#4f46e5"}
                stroke="#4f46e5"
                strokeWidth={hoveredPoint?.index === i ? 4 : 2}
                style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                onMouseEnter={() => setHoveredPoint({ ...p, index: i })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>
        </div>

        {/* Tooltip Glassmorphism khi Hover */}
        {hoveredPoint && (
          <div
            className="absolute z-10 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-gray-100 shadow-xl text-xs pointer-events-none transition-all duration-150"
            style={{
              left: `${Math.min(hoveredPoint.x * 0.9, svgWidth - 160)}px`,
              top: `${Math.max(hoveredPoint.y - 70, 10)}px`,
              minWidth: "150px",
            }}
          >
            <div className="font-semibold text-gray-700 mb-1 border-b border-gray-100 pb-1">
              Thời gian: {hoveredPoint.label}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Doanh thu:</span>
                <span className="font-semibold text-indigo-600">
                  {hoveredPoint.revenue.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Số vé bán:</span>
                <span className="font-semibold text-emerald-600">
                  {hoveredPoint.tickets.toLocaleString()} vé
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Khối Tiêu Đề */}
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Thống kê & Báo cáo</h2>
        <p className="text-xs text-gray-500 mt-1">
          Theo dõi tổng quan doanh thu, vé bán ra và tần suất đặt chỗ theo thời gian thực.
        </p>
      </div>

      {/* Khối Bộ Lọc Thời Gian */}
      <div className="flex bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-sm items-center">
        <TimeFilterBar onFilterChange={handleTimeChange} />
      </div>

      {/* Khối Chọn Group Type Thủ Công */}
      <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Gom nhóm biểu đồ:
        </span>
        <div className="flex gap-1 bg-gray-200/50 p-1 rounded-lg">
          {["DAY", "WEEK", "MONTH", "YEAR"].map((t) => (
            <button
              key={t}
              onClick={() => setGroupType(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${groupType === t
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
                }`}
            >
              {t === "DAY" ? "Theo Ngày" : t === "WEEK" ? "Theo Tuần" : t === "MONTH" ? "Theo Tháng" : "Theo Năm"}
            </button>
          ))}
        </div>
      </div>

      {/* Các Thẻ Số Liệu KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 p-4 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-9xl">payments</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Tổng doanh thu
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
                {overviewData.totalRevenue?.toLocaleString("vi-VN")} đ
              </h2>
            )}
            <p className="text-[10px] text-indigo-200">Giao dịch thanh toán thành công</p>
          </div>
        </div>

        {/* Lượt đặt vé */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 p-4 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-9xl">confirmation_number</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Số lượt đặt vé
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
                {overviewData.totalBookings?.toLocaleString()}
              </h2>
            )}
            <p className="text-[10px] text-blue-200">Đơn hàng hoàn tất thanh toán</p>
          </div>
        </div>

        {/* Vé đã bán */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 p-4 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-9xl">sell</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Vé đã bán ra
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-rounded">sell</span>
            </div>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="h-8 w-24 bg-white/20 animate-pulse rounded-md"></div>
            ) : (
              <h2 className="text-2xl font-bold tracking-tight">
                {overviewData.totalTicketsSold?.toLocaleString()} vé
              </h2>
            )}
            <p className="text-[10px] text-emerald-200">Phân phối qua các suất chiếu</p>
          </div>
        </div>

        {/* Sự kiện đã tạo */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 p-4 translate-x-3 -translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-9xl">event_available</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              Sự kiện đã tạo
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-rounded">event_available</span>
            </div>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="h-8 w-24 bg-white/20 animate-pulse rounded-md"></div>
            ) : (
              <h2 className="text-2xl font-bold tracking-tight">
                {overviewData.totalEventsCreated?.toLocaleString()}
              </h2>
            )}
            <p className="text-[10px] text-amber-200">Được lập kế hoạch & công bố</p>
          </div>
        </div>
      </div>

      {/* Khối Biểu Đồ Thống Kê */}
      <div className="bg-white/40 backdrop-blur-md rounded-3xl p-1 border border-white/25">
        {isLoading ? (
          <div className="w-full h-80 bg-white/70 rounded-2xl flex flex-col items-center justify-center gap-4 border border-white/40">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-400 font-medium">Đang tổng hợp dữ liệu thống kê...</span>
          </div>
        ) : (
          renderSVGChart()
        )}
      </div>

      {/* Bảng xếp hạng Top 5 Sự kiện & Suất diễn bán chạy nhất */}
      <div className="w-full bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-500">military_tech</span>
            <span className="font-bold text-gray-800 text-base">Top 5 Sự kiện nổi bật nhất</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Xếp hạng theo Doanh thu
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4 py-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        ) : !overviewData.topEvents || overviewData.topEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <span className="material-symbols-rounded text-4xl mb-2">event_busy</span>
            <p className="text-sm font-medium">Chưa có dữ liệu sự kiện nổi bật</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overviewData.topEvents.map((event, idx) => (
              <TopEventItem key={event.id} event={event} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardOverview;
