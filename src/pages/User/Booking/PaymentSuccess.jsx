// PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { formatDateVN } from "../../../utils/format";
import PaymentSuccessSkeleton from "../../../components/common/PaymentSuccessSkeleton";

const PaymentSuccess = () => {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const reservationRes = await axiosClient.get(
          `/reservations/${id}/payment-success`,
        );
        setReservation(reservationRes?.data);
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);
  if (isLoading) return <PaymentSuccessSkeleton></PaymentSuccessSkeleton>;
  return (
    <>
      <style>
        {`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            line-height: 1;
          }
          .glow-success {
            box-shadow: 0 0 40px -10px rgba(34, 197, 94, 0.4);
          }
          .nocturnal-gradient {
            background: radial-gradient(circle at top left, #252626 0%, #0e0e0e 100%);
          }
        `}
      </style>
      <main
        className="flex flex-col items-center justify-center px-4 py-20"
        style={{
          background:
            "radial-gradient(circle at top left, #252626 0%, #0e0e0e 100%)",
        }}
      >
        {/* Success Card */}
        <div className="w-full max-w-2xl bg-[#131313] border border-[#474848]/20 rounded-xl overflow-hidden shadow-2xl relative">
          {/* Green accent line at top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#22c55e]"></div>
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            {/* Checkmark Icon */}
            <div className="w-24 h-24 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center mb-8 glow-success border border-[#22c55e]/20">
              <span
                className="material-symbols-outlined text-[#22c55e]"
                style={{
                  fontVariationSettings: "'FILL' 1",
                  fontSize: "50px",
                }}
              >
                check_circle
              </span>
            </div>
            <h3
              className="font-bold text-2xl md:text-3xl text-[#e7e5e5] mb-4 tracking-tight"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Thanh toán thành công!
            </h3>

            <p className="text-[#acabab] max-w-md mx-auto mb-10 leading-relaxed">
              Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi. Thông tin vé điện tử
              đã được gửi về email:{" "}
              <span className="text-[#e7e5e5] font-medium">
                {reservation?.customerEmail}
              </span>
              {" "}hoặc bạn có thể xem vé tại mục "Vé của tôi".
            </p>

            {/* Order Details Card */}
            <div className="w-full bg-[#1f2020] rounded-lg p-6 md:p-8 text-left border border-[#474848]/10 mb-10">
              <div className="flex justify-between items-start border-b border-[#474848]/20 pb-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#acabab] font-bold mb-1">
                    Mã đơn hàng
                  </p>
                  <p className="font-mono text-[#4ade80] font-bold text-xl">
                    {reservation?.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-[#acabab] font-bold mb-1">
                    Trạng thái
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30">
                    {reservation?.status}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-[#acabab] mb-1">Sự kiện</p>
                    <h3
                      className="font-bold text-[#e7e5e5] leading-tight"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {reservation?.eventName}
                    </h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#acabab] mb-1">Ngày diễn ra:</p>
                    <p
                      className="font-bold text-[#e7e5e5] leading-tight"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {formatDateVN(reservation?.showStartTime)} -{" "}
                      {formatDateVN(reservation?.showEndTime)}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-3 text-[#acabab]">
                    <span className="material-symbols-outlined text-green-500">
                      location_on
                    </span>
                    <p className="text-sm font-medium">
                      {reservation?.eventLocation}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {reservation?.items.map((item) => (
                    <div key={item?.id} className="flex justify-between w-full">
                      <div>
                        <p className="text-xs text-[#acabab] mb-1">
                          Số lượng vé
                        </p>
                        <p className="font-semibold text-[#e7e5e5]">
                          {item.quantity} x {item.ticketTypeName}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-[#acabab] mb-1">Tổng cộng</p>
                        <p
                          className="text-xl font-extrabold text-[#e7e5e5]"
                          style={{ fontFamily: "Manrope, sans-serif" }}
                        >
                          {(item.finalPrice ?? item.totalPrice)?.toLocaleString(
                            "vi-VN",
                          )}
                          đ
                        </p>
                        {item.finalPrice &&
                          item.finalPrice !== item.totalPrice && (
                            <p className="text-sm text-[#888] line-through decoration-slate-300">
                              {item.totalPrice?.toLocaleString("vi-VN")}đ
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  {/* Cột 1: Tổng tiền */}
                  <div className="flex justify-between items-end border-b border-gray-800 pb-1">
                    <p className="text-xs uppercase tracking-widest text-[#acabab] font-bold">
                      Tổng tiền
                    </p>
                    <p className="font-mono text-[#4ade80] font-bold text-xl">
                      {reservation?.totalAmount?.toLocaleString("vi-VN")}đ
                    </p>
                  </div>

                  {/* Cột 2: Chiết khấu */}
                  <div className="flex justify-between items-end border-b border-gray-800 pb-1">
                    <p className="text-xs uppercase tracking-widest text-[#acabab] font-bold">
                      Chiết khấu
                    </p>
                    <p className="font-mono text-orange-200 font-bold text-xl">
                      -{reservation?.discountAmount?.toLocaleString("vi-VN")}đ
                    </p>
                  </div>

                  {/* Hàng 2 - Cột 1: Tổng tiền đã trả (hoặc bạn có thể thêm mục khác vào đây) */}
                  <div className="flex justify-between items-end border-b border-gray-800 pb-1">
                    <p className="text-xs uppercase tracking-widest text-[#acabab] font-bold">
                      Đã thanh toán
                    </p>
                    <p className="font-mono text-[#4ade80] font-bold text-xl">
                      {reservation?.finalAmount?.toLocaleString("vi-VN")}đ
                    </p>
                  </div>

                  {/* Cột còn lại để trống hoặc thêm thông tin khác */}
                  <div className="flex justify-between items-end border-b border-gray-800 pb-1">
                    {/* Trống */}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                type="button"
                onClick={() => {
                  navigate("/my-tickets");
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-[#0e0e0e] font-bold py-4 rounded-full transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">
                  confirmation_number
                </span>
                Vé của tôi
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/");
                }}
                className="flex-1 bg-[#252626] hover:bg-[#2b2c2c] text-[#e7e5e5] font-semibold py-4 rounded-full transition-all duration-300 border border-[#474848]/30 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">home</span>
                Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>

        {/* Help Support */}
        <p className="mt-8 text-[#acabab] text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">help</span>
          Cần hỗ trợ? Liên hệ hotline{" "}
          <span className="text-[#e7e5e5] font-bold">1900 6408</span>
        </p>
      </main>
    </>
  );
};

export default PaymentSuccess;
