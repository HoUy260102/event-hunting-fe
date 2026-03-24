import { useState } from "react";
import ReservationSummaryInfo from "../../../components/Booking/ReservationSummaryInfo";
import vnpayIcon from "../../../images/vnpaylogo.png";
import momoIcon from "../../../images/momoicon.png";
import axiosClient from "../../../api/axiosClient";

function Step3Payment({ reservationInfo }) {
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const paymentOptions = [
    {
      id: "vnpay",
      name: "Ví điện tử VNPAY",
      description: "Thanh toán qua ứng dụng ngân hàng hoặc ví VNPAY",
      logo: vnpayIcon,
    },
    {
      id: "momo",
      name: "Ví điện tử MoMo",
      description: "Thanh toán siêu nhanh qua ứng dụng MoMo",
      logo: momoIcon,
    },
  ];

  const handleCreatePaymentUrl = async () => {
    if (paymentMethod === "vnpay") {
      try {
        const res = await axiosClient.post(
          `/payments/create_payment_url`,
          reservationInfo,
        );
        const paymentUrl = res?.data;
        console.log(paymentUrl);
        window.open(paymentUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  return (
    <>
      <div className="animate-fadeIn p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* CỘT TRÁI: Chi tiết đơn hàng */}
          <div className="lg:col-span-4 order-2 lg:order-1 h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
              <ReservationSummaryInfo
                reservationInfo={reservationInfo}
              ></ReservationSummaryInfo>
            </div>
          </div>

          {/* CỘT PHẢI: Form nhập liệu */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-xl">
                      info
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      Thông tin nhận vé
                    </h3>
                    <p className="text-sm text-slate-500">
                      Vé sẽ được gửi về email {reservationInfo?.customerEmail}{" "}
                      và mục "Vé của tôi".
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-xl">
                      payments
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      Phương thức thanh toán
                    </h3>
                    <p className="text-sm text-slate-500">
                      Vui lòng chọn ví điện tử để tiếp tục
                    </p>
                  </div>
                </div>

                {/* Danh sách các Option */}
                <div className="space-y-4">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        paymentMethod === option.id
                          ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600"
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="hidden"
                        value={option.id}
                        checked={paymentMethod === option.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />

                      <div className="w-14 h-14 flex-shrink-0 bg-white rounded-xl border border-slate-100 p-2 flex items-center justify-center">
                        <img
                          src={option.logo}
                          alt={option.name}
                          className="max-w-full h-auto object-contain"
                        />
                      </div>

                      <div className="ml-5 flex-grow">
                        <h4 className="font-bold text-slate-800 text-base">
                          {option.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {option.description}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === option.id
                            ? "border-blue-600"
                            : "border-slate-300"
                        }`}
                      >
                        {paymentMethod === option.id && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full animate-scaleIn" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Ghi chú bảo mật */}
                <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                  <span className="material-symbols-outlined text-slate-400">
                    shield_lock
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Bằng việc chọn thanh toán, bạn đồng ý với{" "}
                    <b>Điều khoản dịch vụ</b> của chúng tôi. Thông tin thanh
                    toán của bạn được mã hóa an toàn và không lưu trữ trên hệ
                    thống.
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <button
                  type="button"
                  className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 group"
                  onClick={() => {
                    handleCreatePaymentUrl();
                  }}
                >
                  <span>Thanh toán ngay</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Step3Payment;
