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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-4 transition-all duration-300 hover:shadow-md">
      <div
        className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center p-4">
          {/* PHẦN 1: Bên trái - Thời gian (Chiếm 3/12 trên PC) */}
          <div className="lg:col-span-3 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex flex-col items-center justify-center border border-gray-200 text-gray-800 shrink-0">
              <span className="text-[10px] font-bold uppercase text-gray-500">
                {show.startMonth}
              </span>
              <span className="text-lg font-extrabold">{show.startDay}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {formatEventDateToString(show?.startTime)} -{" "}
                {formatEventDateToString(show?.endTime)}
              </p>
              <ShowStatusBadge status={show?.status} />
            </div>
          </div>

          {/* PHẦN 2: Ở giữa - Thông số & Dropdown (Chiếm 6/12 trên PC) */}
          <div className="lg:col-span-6 flex items-center justify-between bg-gray-50 lg:bg-transparent p-3 lg:p-0 rounded-lg gap-6">
            <div className="flex gap-6">
              <div className="text-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold text-[9px]">
                  Vé đã bán
                </p>
                <p className="font-bold text-gray-800">
                  {show.soldQuantity?.toLocaleString()} /{" "}
                  {show.totalQuantity?.toLocaleString()}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold text-[9px]">
                  Doanh thu gộp
                </p>
                <p className="font-bold text-gray-800">
                  {show?.totalAmount?.toLocaleString()} đ
                </p>
              </div>
              <div className="text-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold text-[9px]">
                  Doanh thu thuần
                </p>
                <p className="font-bold text-gray-800">
                  {show?.totalFinalAmount?.toLocaleString()} đ
                </p>
              </div>
            </div>

            {/* Nút dropdown nằm ở giữa */}
            <span
              className={`material-symbols-outlined text-gray-400 cursor-pointer p-2 hover:bg-gray-200 rounded-full transition-all duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </div>

          {/* PHẦN 3: Bên phải - Nút Quét QR (Chiếm 3/12 trên PC) */}
          <div className="lg:col-span-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                navigate(`/admin/shows/${show?.id}/tickets`);
              }}
              className="w-full lg:w-auto whitespace-nowrap px-6 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <QrCodeScannerIcon className="w-5 h-5 text-indigo-600" />
              Quét mã QR
            </button>
          </div>
        </div>
      </div>
      {/* FIX: Wrapper sử dụng Inline Style để đảm bảo transition hoạt động */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.5s ease-in-out",
        }}
      >
        <div className="overflow-hidden">
          <div className="p-6 bg-gray-50/30 border-t border-gray-100">
            <div className="overflow-x-auto pb-2 custom-scrollbar">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-4 pb-2 whitespace-nowrap">Tên loại vé</th>
                    <th className="px-4 pb-2 whitespace-nowrap">Giá vé</th>
                    <th className="px-4 pb-2 whitespace-nowrap">Tổng số</th>
                    <th className="px-4 pb-2 whitespace-nowrap">Đã bán</th>
                    <th className="px-4 pb-2 whitespace-nowrap">Vé đã đặt</th>
                    <th className="px-4 pb-2 whitespace-nowrap">Vé khả dụng</th>
                    <th className="px-4 pb-2 whitespace-nowrap">
                      Doanh thu gộp
                    </th>
                    <th className="px-4 pb-2 whitespace-nowrap">Chiết khấu</th>
                    <th className="px-4 pb-2 whitespace-nowrap">
                      Doanh thu thuần
                    </th>
                    <th className="px-4 pb-2 whitespace-nowrap">
                      Trạng thái(Hệ thống)
                    </th>
                    <th className="px-4 pb-2 text-center whitespace-nowrap">Thao tác</th>
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
