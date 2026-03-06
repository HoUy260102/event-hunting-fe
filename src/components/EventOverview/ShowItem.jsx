import React, { useState } from "react";
import TicketTypeGroup from "./TicketTypeGroup";
import ShowStatusBadge from "../common/ShowStatusBadge";
import { formatEventDateToString } from "../../utils/format";

const ShowItem = ({ show }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-4 transition-all duration-300 hover:shadow-md">
      <div
        className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex flex-col items-center justify-center border border-gray-200 text-gray-800">
              <span className="text-[10px] font-bold uppercase text-gray-500">
                {show.startMonth}
              </span>
              <span className="text-lg font-extrabold">{show.startDay}</span>
            </div>

            <div>
              {/* <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                {show.name}
              </h4> */}
              <p className="text-xs text-gray-500">{formatEventDateToString(show?.startTime)} - {formatEventDateToString(show?.endTime)}</p>
              <ShowStatusBadge status={show?.status}></ShowStatusBadge>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-between sm:justify-end gap-4">
            {/* Sold count mobile + desktop */}
            <div className="text-sm sm:text-right">
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                Vé đã bán
              </p>
              <p className="font-bold text-gray-800">
                {show.soldQuantity?.toLocaleString()} /{" "}
                {show.totalQuantity?.toLocaleString()}
              </p>
            </div>
            <div className="text-sm sm:text-right">
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                Doanh thu
              </p>
              <p className="font-bold text-gray-800">
                {show.totalRevenue?.toLocaleString()} đ
              </p>
            </div>
            <span
              className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
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
                    <th className="px-4 pb-2">Tên loại vé</th>
                    <th className="px-4 pb-2">Giá vé</th>
                    <th className="px-4 pb-2">Tổng số</th>
                    <th className="px-4 pb-2">Đã bán</th>
                    <th className="px-4 pb-2">Trạng thái(Hệ thống)</th>
                    <th className="px-4 pb-2">Trạng thái(Doanh nghiệp)</th>
                    <th className="px-4 pb-2 text-right">Thao tác</th>
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
