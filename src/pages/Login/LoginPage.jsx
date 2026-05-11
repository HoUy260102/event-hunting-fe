import "./LoginPage.css";
import { toast, ToastContainer } from "react-toastify";
import eventIllustration from "../../images/happy-tiny-business-people-dancing-having-fun-drinking-wine-corporate-party-team-building-activity-corporate-event-idea-concept-pinkish-coral-bluevector-isolated-illustration.png";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import axiosClient from "../../api/axiosClient";
import backgroundImageUrl from "../../images/bgeventhunting.png";
import { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useGoogleLogin } from "../../hooks/useGoogleLogin";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ").nonempty("Email là bắt buộc"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

function LoginPage() {
  const { loginWithGoogle, error: googleError } = useGoogleLogin();
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
      if (apiRes?.data?.user?.role === "ADMIN") {
        navigate("/admin/");
        return;
      }
      if (apiRes?.data?.user?.role === "USER") {
        navigate("/");
        return;
      }
      toastSuccess(apiRes.message || "Đăng nhập thành công!");
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

  return (
    <>
      <div
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        className="flex justify-center items-center min-h-screen"
      >
        <div className="login-container shadow-2xl">
          <div className="left-panel">
            <div className="text-content text-center">
              <h1>Event Hunting</h1>
              <p>Săn tìm sự kiện, chạm tới đam mê.</p>
              <p> Đừng chỉ đứng nhìn, hãy là một phần của những cuộc vui.</p>
              <img
                src={eventIllustration}
                alt="Event Management Illustration"
                className="event-illustration"
              />
            </div>
          </div>

          <div className="right-panel">
            {/* Sử dụng handleSubmit của react-hook-form */}
            <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="email" className="uppercase">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Nhập email..."
                  {...register("email")} // Đăng ký input với hook form
                />
                <div className="error-container" style={{ minHeight: "18px" }}>
                  {errors.email && (
                    <span
                      className="error-text"
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="uppercase">
                  Mật khẩu:
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Nhập mật khẩu..."
                  {...register("password")}
                />
                <div className="error-container" style={{ minHeight: "18px" }}>
                  {errors.password && (
                    <span
                      className="error-text"
                      style={{ color: "red", fontSize: "12px" }}
                    >
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

              <button
                type="button"
                onClick={loginWithGoogle}
                className="google-login-button"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  alt="Google logo"
                  className="google-icon"
                />
                Đăng nhập bằng Google
              </button>

              <Link to="/forgot-password" className="forgot-password-link">
                Quên mật khẩu?
              </Link>
              <p className="forgot-password-link">
                Bạn chưa có tài khoản?
                <Link to="/signup" className="">
                  Đăng ký?
                </Link>
              </p>
              {googleError && (
                <span
                  className="error-text"
                  style={{ color: "red", fontSize: "12px" }}
                >
                  {googleError}
                </span>
              )}
            </form>
          </div>
          <ToastContainer />
        </div>
      </div>
    </>
  );
}

export default LoginPage;
