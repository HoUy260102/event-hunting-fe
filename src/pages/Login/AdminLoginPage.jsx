import "./AdminLoginPage.css";
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

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ").nonempty("Email là bắt buộc"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

function AdminLoginPage() {
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
      theme: "colored",
    });
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const apiRes = await axiosClient.post("/auth/login", {
        username: data.email,
        password: data.password,
      });

      const userData = apiRes?.data?.user;
      const role = userData?.role;

      if (role === "ADMIN" || role === "ORGANIZER") {
        login(userData, apiRes?.data?.accessToken, apiRes?.data?.refreshToken);
        toastSuccess(apiRes.message || "Đăng nhập thành công!");
        setTimeout(() => {
          navigate("/admin/");
        }, 1000);
      } else {
        toastError("Bạn không có quyền truy cập vào trang quản trị!");
      }
    } catch (error) {
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
        <div className="admin-login-container shadow-2xl">
          {/* Left panel */}
          <div className="left-panel">
            <div className="text-content text-center">
              <span className="admin-badge">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  admin_panel_settings
                </span>
                Admin Portal
              </span>
              <h1>Event Hunting</h1>
              <p>Quản lý sự kiện, kiểm soát hệ thống.</p>
              <p>Toàn quyền điều hành trong tầm tay.</p>
              <img
                src={eventIllustration}
                alt="Admin Illustration"
                className="event-illustration"
              />
            </div>
          </div>

          {/* Right panel */}
          <div className="right-panel">
            <form className="admin-login-form" onSubmit={handleSubmit(onSubmit)}>
              <h2 className="form-title uppercase">Đăng nhập quản trị</h2>
              <p className="form-subtitle">Dành cho Admin & Organizer</p>

              <div className="form-group">
                <label htmlFor="email" className="uppercase">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Nhập email..."
                  {...register("email")}
                />
                <div className="error-container" style={{ minHeight: "18px" }}>
                  {errors.email && (
                    <span className="error-text">{errors.email.message}</span>
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
                    <span className="error-text">{errors.password.message}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="admin-login-button"
                disabled={isLoading}
                style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <>Đăng nhập →</>
                )}
              </button>

              <Link to="/" className="admin-back-link">
                ← Quay lại trang chủ
              </Link>
            </form>
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export default AdminLoginPage;
