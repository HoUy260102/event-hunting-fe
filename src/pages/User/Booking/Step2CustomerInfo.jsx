import BookingSummaryInfo from "../../../components/Booking/BookingSummaryInfo";
import { useFormContext } from "react-hook-form";
import CircularProgress from "@mui/material/CircularProgress";

function Step2CustomerInfo({ cart, onBack, isSubmittingPayment }) {
  const {
    register,
    formState: {errors},
  } = useFormContext();
  return (
    <div className="animate-fadeIn p-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* CỘT TRÁI: Chi tiết đơn hàng */}
        <div className="lg:col-span-4 order-2 lg:order-1 h-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
            <BookingSummaryInfo cart={cart} />
          </div>
        </div>

        {/* CỘT PHẢI: Form nhập liệu */}
        <div className="lg:col-span-8 order-1 lg:order-2 h-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Thông tin liên hệ
                </h3>
              </div>

              <div className="space-y-5">
                {/* Họ tên */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      errors.fullName
                        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
                        : "border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium italic">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="name@example.com"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      errors.email
                        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
                        : "border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium italic">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="09xx xxx xxx"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      errors.phone
                        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
                        : "border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium italic">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Nút bấm điều hướng */}
            <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmittingPayment}
                className="text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                ← Quay lại chọn vé
              </button>

              <button
                type="submit"
                disabled={isSubmittingPayment}
                className="w-full sm:w-auto px-12 py-4 bg-green-500 hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-green-100 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmittingPayment && <CircularProgress size={20} color="inherit" />}
                {isSubmittingPayment ? "Đang xử lý..." : "Thanh toán ngay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step2CustomerInfo;
