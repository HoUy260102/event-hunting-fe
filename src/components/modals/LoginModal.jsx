import { toast, ToastContainer } from "react-toastify";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import axiosClient from "../../api/axiosClient";
import { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ").nonempty("Email là bắt buộc"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

function LoginModal({ isOpen, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSendVerifyMail = async (userEmail) => {
    try {
      const apiRes = await axiosClient.post("/auth/resend-verify", null, {
        params: { email: userEmail },
      });

      toast.success(apiRes.message || "Mã mới đã gửi! Đang chuyển hướng...");

      setTimeout(() => {
        navigate(`/signup/verify?email=${userEmail}`);
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Gửi mail thất bại, thử lại sau.");
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const apiRes = await axiosClient.post("/auth/login", {
        username: data.email,
        password: data.password,
      });

      login(
        apiRes?.data?.user,
        apiRes?.data?.accessToken,
        apiRes?.data?.refreshToken,
      );
      toastSuccess(apiRes.message || "Đăng nhập thành công!");
      onClose();
    } catch (error) {
      if (error.code === "USER_NOT_VERIFIED") {
        handleSendVerifyMail(data?.email);
        return;
      }
      toastError(error.message || "Đăng nhập thất bại!");
      console.error("Lỗi chi tiết:", error);
    } finally {
      setIsLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
      {/* Container Modal */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Nút đóng (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Đăng Nhập
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* EMAIL */}
            <div className="form-group">
              <label
                className="block text-sm font-semibold mb-1"
                htmlFor="email"
              >
                EMAIL:
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Email"
                {...register("email")}
              />
              <div className="error-container" style={{ minHeight: "18px" }}>
                {errors.email && (
                  <span className="text-red-500 text-xs">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label
                className="block text-sm font-semibold mb-1"
                htmlFor="password"
              >
                MẬT KHẨU:
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Password"
                {...register("password")}
              />
              <div className="error-container" style={{ minHeight: "18px" }}>
                {errors.password && (
                  <span className="text-red-500 text-xs">
                    {errors.password.message}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
              style={{
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>Đăng nhập →</>
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-all"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                alt="Google logo"
                className="w-5 h-5 mr-2"
              />
              Đăng nhập bằng Google
            </button>

            <div className="text-center mt-4 space-y-2">
              <Link
                to="/forgot-password"
                size="sm"
                className="block text-blue-500 text-sm hover:underline"
              >
                Quên mật khẩu?
              </Link>
              <p className="text-sm text-gray-600">
                Bạn chưa có tài khoản?{" "}
                <Link
                  to="/signup"
                  className="text-blue-500 font-bold hover:underline"
                >
                  Đăng ký
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LoginModal;
