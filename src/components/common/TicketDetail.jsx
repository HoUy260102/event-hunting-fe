import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { formatDateVN } from "../../utils/format";
import { QRCodeSVG } from "qrcode.react";
import TicketDetailSkeleton from "./TicketDetailSkeleton";

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ticketRes = await axiosClient.get(`/tickets/my-tickets/${id}`);
        setTicket(ticketRes?.data);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  if (loading) return <TicketDetailSkeleton />;
  return (
    <div className="bg-[#0e0e0e] text-[#e7e5e5] font-['Inter'] min-h-screen">
      {/* Nhét CSS trực tiếp vào component */}
      <style
        dangerouslySetInnerHTML={{
          __html: `        
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        
        .ticket-shape {
          clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 95% 73%, 95% 77%, 100% 80%, 100% 100%, 0% 100%, 0% 80%, 5% 77%, 5% 73%, 0% 70%);
        }

        .custom-selection::selection {
          background-color: #00FF00;
          color: #000000;
        }

        /* Đảm bảo font hoạt động */
        .font-manrope { font-family: 'Manrope', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `,
        }}
      />

      <div className="custom-selection px-10">
        <div className="mb-5 flex items-center gap-3 border-b border-[#474848]/20">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <h3 className="py-5 font-headline text-white text-2xl font-extrabold tracking-tight text-on-surface">
            Chi tiết vé
          </h3>
        </div>
        <main className="max-w-4xl mx-auto px-6 pt-10 pb-24 font-inter">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Ticket Visual */}
            <div className="md:col-span-7 flex flex-col gap-6">
              <div className="bg-[#1f2020] rounded-xl overflow-hidden shadow-2xl relative">
                {/* Event Banner */}
                <div className="h-48 w-full relative">
                  <img
                    className="w-full h-full object-cover opacity-60"
                    src={ticket?.eventPoster?.url}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1f2020] to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className="bg-green-500/20 text-green-500 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest border border-green-500/30">
                      Valid
                    </span>
                  </div>
                </div>

                {/* Ticket Body */}
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-manrope text-2xl font-extrabold text-[#e7e5e5] leading-tight tracking-tighter">
                      {ticket?.eventName}
                    </h3>
                    <p className="mt-10 text-[#acabab] font-medium uppercase text-sm">
                      Mã đơn đặt hàng: {ticket?.reservationId}
                    </p>
                    <p className="mt-2 text-[#acabab] font-medium uppercase text-sm">
                      Mã vé: {ticket?.id}
                    </p>
                  </div>

                  <div className="pt-5 space-y-2 border-t border-[#474848]/20">
                    <p className="text-[#acabab] uppercase font-medium text-sm">
                      Thông tin khách hàng:
                    </p>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-6">
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase tracking-widest text-[#acabab] mb-1">
                          Tên khách hàng:
                        </p>
                        <p className="font-semibold text-[#e7e5e5]">
                          {ticket?.customerName}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] uppercase tracking-widest text-[#acabab] mb-1">
                          Email khách hàng:
                        </p>
                        <p className="font-semibold text-[#e7e5e5]">
                          {ticket?.customerEmail}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] uppercase tracking-widest text-[#acabab] mb-1">
                          Số điện thoại:
                        </p>
                        <p className="font-semibold text-[#e7e5e5]">
                          {ticket?.customerPhone}{" "}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-[#474848]/20 pt-6">
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#acabab] mb-1">
                        Ngày diễn ra:
                      </p>
                      <p className="font-semibold text-[#e7e5e5]">
                        {formatDateVN(ticket?.showStartTime)} -{" "}
                        {formatDateVN(ticket?.showEndTime)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#acabab] mb-1">
                        Khu vực / Section
                      </p>
                      <p className="font-semibold text-[#e7e5e5]">
                        {ticket?.section}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#acabab] mb-1">
                        Số thứ tự / Queue No
                      </p>
                      <p className="font-semibold text-[#e7e5e5]">
                        {ticket?.seatLabel}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3 text-[#acabab]">
                    <span className="material-symbols-outlined text-green-500">
                      location_on
                    </span>
                    <p className="text-sm font-medium">
                      {ticket?.eventLocation}
                    </p>
                  </div>
                </div>

                {/* Perforated Line */}
                <div className="relative h-px w-full border-t-2 border-dashed border-[#474848]/30 my-2">
                  <div className="absolute -left-4 -top-3 w-6 h-6 rounded-full bg-[#0e0e0e]"></div>
                  <div className="absolute -right-4 -top-3 w-6 h-6 rounded-full bg-[#0e0e0e]"></div>
                </div>

                {/* Bottom Branding */}
                <div className="px-8 py-6 flex justify-between items-center bg-[#252626]/30">
                  <p className="text-[10px] text-[#acabab]/60 font-medium tracking-widest uppercase">
                    Vui lòng xuất trình vé này tại lối vào.
                  </p>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/40"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: QR & Actions */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-[#191a1a] rounded-xl p-8 border border-[#474848]/10 shadow-lg flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white rounded-lg mb-6 group relative cursor-pointer">
                  <QRCodeSVG
                    value={ticket?.qrCode}
                    size={160}
                    level={"H"}
                    includeMargin={false}
                    imageSettings={{
                      src: "https://vov.vn/sites/default/files/styles/facebook/public/2021-03/logo_ticketbox.jpg",
                      x: undefined,
                      y: undefined,
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-green-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </div>
                <p className="font-manrope font-bold text-[#e7e5e5] text-lg mb-1">
                  Scan to Check-in
                </p>
                <p className="text-xs text-[#acabab]">
                  Vui lòng tăng độ sáng màn hình lên mức tối đa trước khi quét
                  mã.
                </p>
              </div>

              <div className="bg-[#131313] p-6 rounded-xl border-l-4 border-green-500/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#acabab] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">
                    info
                  </span>
                  Hướng dẫn
                </h3>
                <ul className="space-y-3 text-sm text-[#acabab]">
                  <li className="flex gap-3">
                    <span className="text-green-500">•</span>
                    Nên có mặt tại địa điểm 30 phút trước giờ biểu diễn.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-500">•</span>
                    Vui lòng mang theo giấy tờ tùy thân có ảnh khớp với tên trên
                    đơn hàng khi được yêu cầu.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-500">•</span>
                    Vé không được hoàn tiền sau khi thanh toán, không thể hủy
                    sau khi giao dịch thành công.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TicketDetails;
