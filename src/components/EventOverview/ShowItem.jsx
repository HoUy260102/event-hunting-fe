import React, { useState } from "react";
import TicketTypeGroup from "./TicketTypeGroup";
import ShowStatusBadge from "../common/ShowStatusBadge";
import { formatEventDateToString } from "../../utils/format";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useNavigate } from "react-router-dom";

const colors = ["#6366f1", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444"];

const DonutChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] w-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
            <span className="material-symbols-outlined text-lg">pie_chart</span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
              Tỷ lệ phân bổ loại vé
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Phân tích số lượng vé đã bán ra của từng loại vé trong suất diễn
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-slate-50/20 rounded-2xl border border-dashed border-slate-200">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">pie_chart</span>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Chưa bán được vé nào</p>
          <p className="text-[10px] text-slate-400 mt-1">Biểu đồ tỷ lệ sẽ tự động hiển thị khi phát sinh vé bán thành công.</p>
        </div>
      </div>
    );
  }

  const radius = 35;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius; // ~219.9
  
  let accumulatedPercent = 0;

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] w-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-3.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
          <span className="material-symbols-outlined text-lg">pie_chart</span>
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
            Tỷ lệ phân bổ loại vé
          </h4>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            Phân tích số lượng vé đã bán ra của từng loại vé trong suất diễn này
          </p>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Donut Chart SVG */}
        <div className="lg:col-span-3 flex justify-center py-2">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 filter drop-shadow-[0_4px_8px_rgba(99,102,241,0.08)]">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
               {data.map((item, index) => {
                 const percent = (item.value / total) * 100;
                 const strokeLength = (percent / 100) * circumference;
                 const strokeOffset = -((accumulatedPercent / 100) * circumference);
                 accumulatedPercent += percent;
 
                 if (item.value === 0) return null; // Bỏ qua không vẽ các phân khúc 0% để tránh chấm tròn dư thừa
 
                 return (
                   <circle
                     key={index}
                     cx="50"
                     cy="50"
                     r={radius}
                     fill="transparent"
                     stroke={item.color}
                     strokeWidth={strokeWidth}
                     strokeDasharray={`${strokeLength} ${circumference}`}
                     strokeDashoffset={strokeOffset}
                     className="transition-all duration-300 ease-in-out cursor-pointer hover:stroke-[11px]"
                   />
                 );
               })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Đã bán</span>
              <span className="text-sm font-black text-slate-800 leading-none mt-0.5">{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Legend in responsive grid */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.map((item, index) => {
              const percent = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between p-2.5 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-100/50 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="font-extrabold text-slate-700 truncate text-[11px] uppercase tracking-wider">{item.label}</span>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-1.5 pl-2">
                    <span className="text-xs font-black text-slate-800">{item.value.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 font-extrabold bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ShowItem = ({ show }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const chartData = (show.ticketTypes || []).map((type, idx) => ({
    label: type.name || "N/A",
    value: type.soldQuantity || 0,
    color: colors[idx % colors.length]
  }));

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100/80 rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.015)] mb-4 hover:shadow-[0_12px_35px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
      <div
        className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/50 transition-colors bg-white/40"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
          {/* PHẦN 1: Bên trái - Thời gian (Chiếm 3/12 trên PC) */}
          <div className="lg:col-span-3 flex items-center gap-4">
            {/* Lịch Ngày Tháng Phối Màu Luxury với Gradient Tối */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center border border-slate-800 text-white shrink-0 shadow-md">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                {show.startMonth || "TH"}
              </span>
              <span className="text-xl font-black leading-none mt-0.5">{show.startDay || "00"}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">
                {formatEventDateToString(show?.startTime)} -{" "}
                {formatEventDateToString(show?.endTime)}
              </p>
              <div className="transform scale-95 origin-left">
                <ShowStatusBadge status={show?.status} />
              </div>
            </div>
          </div>

          {/* PHẦN 2: Ở giữa - Thông số & Dropdown (Chiếm 6/12 trên PC) */}
          <div className="lg:col-span-6 flex items-center justify-between bg-slate-50/50 lg:bg-transparent p-4 lg:p-0 rounded-2xl gap-6">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <div className="text-sm">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                  Vé đã bán
                </p>
                <p className="font-extrabold text-slate-700 mt-0.5">
                  {show.soldQuantity?.toLocaleString()} <span className="text-slate-400 font-medium">/ {show.totalQuantity?.toLocaleString()}</span>
                </p>
              </div>
              <div className="text-sm">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                  Doanh thu gộp
                </p>
                <p className="font-extrabold text-indigo-600 mt-0.5">
                  {show?.totalAmount?.toLocaleString()} đ
                </p>
              </div>
              <div className="text-sm">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                  Doanh thu thuần
                </p>
                <p className="font-extrabold text-emerald-600 mt-0.5">
                  {show?.totalFinalAmount?.toLocaleString()} đ
                </p>
              </div>
            </div>

            {/* Nút dropdown */}
            <span
              className={`material-symbols-outlined text-slate-400 cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-all duration-300 ${
                isOpen ? "rotate-180 bg-slate-100/80 text-indigo-600" : ""
              }`}
            >
              expand_more
            </span>
          </div>

          {/* PHẦN 3: Bên phải - Nút Quét QR (Chiếm 3/12 trên PC) */}
          <div className="lg:col-span-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                navigate(`/admin/shows/${show?.id}/tickets`);
              }}
              className="w-full lg:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl text-sm font-extrabold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <QrCodeScannerIcon className="w-4 h-4 text-indigo-500" />
              Quét mã QR
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Container sử dụng Grid Layout tỷ lệ vàng tuyệt đối chống mất chữ tên vé */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.35s ease-in-out",
        }}
      >
        <div className="overflow-hidden">
          <div className="p-6 bg-slate-50/20 border-t border-slate-100 space-y-6">
            {/* Phân bổ loại vé nằm ở phía TRÊN bảng - Đã được thiết kế lại cực kỳ ĐẸP & CHUYÊN NGHIỆP */}
            <DonutChart data={chartData} />

            {/* Bảng chi tiết loại vé nằm ở phía DƯỚI */}
            <div className="overflow-x-auto pb-2 custom-scrollbar">
              <div className="min-w-[1150px] pr-4">
                {/* Header 24 Columns Grid thiết lập kích thước chuẩn chống cắt chữ */}
                <div className="grid grid-cols-24 gap-3 items-center px-4 py-3 bg-slate-100/60 rounded-2xl text-slate-400 text-[10px] uppercase tracking-wider font-extrabold mb-3">
                  <div className="col-span-3">Tên loại vé</div>
                  <div className="col-span-3">Giá vé</div>
                  <div className="col-span-2 text-center">Tổng số</div>
                  <div className="col-span-2 text-center">Đã bán</div>
                  <div className="col-span-1 text-center">Vé đã đặt</div>
                  <div className="col-span-1 text-center">Vé khả dụng</div>
                  <div className="col-span-3 text-right">Doanh thu gộp</div>
                  <div className="col-span-2 text-right">Chiết khấu</div>
                  <div className="col-span-3 text-right">Doanh thu thuần</div>
                  <div className="col-span-3 text-center">Trạng thái</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Rows container */}
                <div className="space-y-3">
                  {show.ticketTypes?.map((type) => (
                    <TicketTypeGroup key={type.id} type={type} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowItem;
