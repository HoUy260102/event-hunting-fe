import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import ProfileSidebar from "./ProfileSidebar";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const ChangePassword = () => {
  useEffect(() => {
    document.title = "Đổi mật khẩu | Event Hunting";
    return () => {
      document.title = "Event Hunting";
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await axiosClient.put("/users/change-password", data);

      // Silent Re-login: Cập nhật token mới mà không cần logout
      const { accessToken, refreshToken } = response.data;
      if (accessToken && refreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        toast.success("Đổi mật khẩu thành công!");
        reset();
      } else {
        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error("Change password error:", error?.message);

      // Nếu có lỗi validation từ backend (ví dụ: mật khẩu mới quá ngắn, trống...)
      if (error.code === "VALIDATION_ERROR" && error.details) {
        Object.keys(error.details).forEach((key) => {
          setError(key, {
            type: "server",
            message: error.details[key],
          });
        });
        toast.error("Vui lòng kiểm tra lại thông tin nhập vào.");
      } else {
        // Lỗi logic nghiệp vụ (ví dụ: mật khẩu hiện tại không đúng)
        toast.error(error.message || "Đổi mật khẩu thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 lg:px-6 lg:py-6 flex flex-col lg:flex-row gap-10">
      {/* Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <ProfileSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full">
        {/* Header */}
        <div className="mb-8 border-b border-[#474848]/20 pb-4">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Đổi mật khẩu
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Để bảo mật, vui lòng không chia sẻ mật khẩu của bạn với người khác.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full bg-[#131313] rounded-[2rem] shadow-sm border border-slate-800 p-6 lg:p-10"
        >
          <div className="flex flex-col gap-6">
            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white ml-3">
                Mật khẩu hiện tại:
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  {...register("currentPassword")}
                  className={`w-full h-12 px-6 pr-12 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent focus:border-green-500 focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.currentPassword ? "border-red-500 ring-1 ring-red-500" : ""
                    }`}
                  placeholder="Nhập mật khẩu hiện tại..."
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showCurrentPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.currentPassword && (
                <span className="text-red-500 text-xs ml-4">
                  {errors.currentPassword.message}
                </span>
              )}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white ml-3">
                Mật khẩu mới:
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword")}
                  className={`w-full h-12 px-6 pr-12 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent focus:border-green-500 focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.newPassword ? "border-red-500 ring-1 ring-red-500" : ""
                    }`}
                  placeholder="Nhập mật khẩu mới..."
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showNewPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.newPassword && (
                <span className="text-red-500 text-xs ml-4">
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white ml-3">
                Xác nhận mật khẩu mới:
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`w-full h-12 px-6 pr-12 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent focus:border-green-500 focus:ring-0 focus:bg-white dark:focus:bg-black/20 text-slate-900 dark:text-white transition-all ${errors.confirmPassword ? "border-red-500 ring-1 ring-red-500" : ""
                    }`}
                  placeholder="Xác nhận mật khẩu mới..."
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-red-500 text-xs ml-4">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center gap-4 mt-6 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  reset();
                }}
                className="px-8 h-12 rounded-xl border border-slate-700 text-white font-bold hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`${isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 hover:brightness-110"
                  } px-8 h-12 rounded-xl text-slate-900 font-bold flex items-center justify-center gap-2 transition-all`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined">lock_open</span>
                )}
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ChangePassword;
