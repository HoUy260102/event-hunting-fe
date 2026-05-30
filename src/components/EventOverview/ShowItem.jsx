import React, { useState } from "react";
import TicketTypeGroup from "./TicketTypeGroup";
import ShowStatusBadge from "../common/ShowStatusBadge";
import { formatEventDateToString } from "../../utils/format";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useNavigate } from "react-router-dom";

const ShowItem = ({ show }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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

      {/* Dropdown Container */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.35s ease-in-out",
        }}
      >
        <div className="overflow-hidden">
          <div className="p-6 bg-slate-50/20 border-t border-slate-100">
            <div className="overflow-x-auto pb-2 custom-scrollbar">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">
                    <th className="px-4 py-3 bg-slate-100/50 first:rounded-l-xl last:rounded-r-xl whitespace-nowrap">Tên loại vé</th>
                    <th className="px-4 py-3 bg-slate-100/50 whitespace-nowrap">Giá vé</th>
                    <th className="px-4 py-3 bg-slate-100/50 whitespace-nowrap">Tổng số</th>
                    <th className="px-4 py-3 bg-slate-100/50 whitespace-nowrap">Đã bán</th>
                    <th className="px-4 py-3 bg-slate-100/50 whitespace-nowrap">Vé đã đặt</th>
                    <th className="px-4 py-3 bg-slate-100/50 whitespace-nowrap">Vé khả dụng</th>
                    <th className="px-4 py-3 bg-slate-100/50 whitespace-nowrap">Doanh thu gộp</th>
                    <th className="px-4 py-3 bg-slate-100/50 whitespace-nowrap">Chiết khấu</th>
                    <th className="px-4 py-3 bg-slate-100/50 whitespace-nowrap">Doanh thu thuần</th>
                    <th className="px-4 py-3 bg-slate-100/50 whitespace-nowrap">Trạng thái (Hệ thống)</th>
                    <th className="px-4 py-3 bg-slate-100/50 text-center whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {show.ticketTypes?.map((type) => (
                    <TicketTypeGroup key={type.id} type={type} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowItem;
