import { useEffect, useState } from "react";
import ReservationSummaryInfo from "../../../components/Booking/ReservationSummaryInfo";
import vnpayIcon from "../../../images/vnpaylogo.png";
import momoIcon from "../../../images/momoicon.png";
import axiosClient from "../../../api/axiosClient";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import VoucherListModal from "../../../components/modals/VoucherListModal";
import Modal from "../../../components/common/Modal";

function Step3Payment({ reservationInfo, showId }) {
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(reservationInfo);
  const [isOpenVoucher, setIsOpenVoucher] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
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
  const [notiModal, setNotiModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const closeNotiModal = () =>
    setNotiModal((prev) => ({ ...prev, isOpen: false }));

  const toastSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const toastError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const handleCreatePaymentUrl = async () => {
    if (paymentMethod === "vnpay") {
      try {
        const payload = {
          ...reservation,
          ...(selectedVoucherId ? { voucherId: selectedVoucherId } : {}),
        };
        const res = await axiosClient.post(
          `/payments/create_payment_url`,
          payload,
        );
        const paymentUrl = res?.data;
        console.log(paymentUrl);
        window.open(paymentUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/api/v1/ws");
    const stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect(
      {},
      () => {
        console.log("Connected to WebSocket");
        stompClient.subscribe(
          `/topic/reservations/${reservationInfo?.id}/payment-response`,
          (message) => {
            if (message.body) {
              const data = JSON.parse(message.body);
              console.log("Nhận update ghế từ socket:", data);
              if (data.status === "SUCCESS") {
                toastSuccess(data?.message || "Giao dịch thành công.");
                setTimeout(
                  () => navigate(`/payments/success/${data.reservationId}`),
                  2000,
                );
              } else {
                setNotiModal({
                  isOpen: true,
                  title: "Thanh toán đơn đặt hàng",
                  message: "Thanh toán thất bại thất bại: " + data?.message,
                  type: "error",
                });
              }
            }
          },
        );
      },
      (error) => {
        setNotiModal({
          isOpen: true,
          title: "Thanh toán đơn đặt hàng",
          message: "Thanh toán thất bại thất bại: " + error.message,
          type: "error",
        });
        console.error("WebSocket error:", error);
      },
    );

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [reservationInfo]);

  const handleSelectVoucher = async (voucherId) => {
    try {
      const res = await axiosClient.get(
        `/reservations/${reservationInfo?.id}/vouchers`,
        {
          params: { voucherId },
        },
      );
      setSelectedVoucherId(voucherId);
      setReservation(res?.data);
    } catch (error) {
      console.log(error.message);
      setNotiModal({
        isOpen: true,
        title: "Thanh toán đơn đặt hàng",
        message: "Thanh toán thất bại thất bại: " + error?.message,
        type: "error",
      });
    } finally {
      toggleVoucher();
    }
  };

  const toggleVoucher = () => {
    setIsOpenVoucher((prev) => !prev);
  };

  return (
    <>
      <VoucherListModal
        isOpen={isOpenVoucher}
        onClose={toggleVoucher}
        showId={showId}
        selectedId={selectedVoucherId}
        handleSelectVoucher={handleSelectVoucher}
        toastSuccess={toastSuccess}
        toastError={toastError}
      ></VoucherListModal>
      {notiModal.isOpen && (
        <Modal
          isOpen={notiModal.isOpen}
          title={notiModal.title}
          message={notiModal.message}
          onClose={closeNotiModal}
          type={notiModal.type}
        />
      )}
      <ToastContainer />
      <div className="animate-fadeIn p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* CỘT TRÁI: Chi tiết đơn hàng */}
          <div className="lg:col-span-4 order-2 lg:order-1 h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
              <ReservationSummaryInfo
                reservationInfo={reservation}
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
                      Vé sẽ được gửi về email {reservation?.customerEmail} và
                      mục "Vé của tôi".
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
                      className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === option.id
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
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === option.id
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

                <div className="mt-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                    {/* LEFT */}
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        Mã khuyến mãi
                      </h4>

                      {selectedVoucherId ? (
                        <p className="text-sm text-green-600 mt-1">
                          Đã áp dụng voucher
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 mt-1">
                          Chọn mã giảm giá cho đơn hàng
                        </p>
                      )}
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleVoucher}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                      >
                        {selectedVoucherId ? "Đổi" : "Chọn"}
                      </button>
                    </div>
                  </div>
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
