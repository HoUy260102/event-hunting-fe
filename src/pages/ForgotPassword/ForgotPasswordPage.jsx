import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosClient from "../../api/axiosClient";
import backgroundImageUrl from "../../images/bgeventhunting.png";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Step state: 1 = Xác thực tài khoản, 2 = Đổi mật khẩu, 3 = Thành công
  const [step, setStep] = useState(1);

  // Form fields
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState(() => {
    return searchParams.get("token") || searchParams.get("resetToken") || "";
  });
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = "Đổi mật khẩu | Event Hunting";
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const validateEmail = (val) => {
    return String(val)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  // Handler for sending OTP
  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Vui lòng nhập địa chỉ email" }));
      return;
    }
    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Email không đúng định dạng" }));
      return;
    }

    setErrors((prev) => ({ ...prev, email: undefined }));
    setIsSendingCode(true);

    try {
      const response = await axiosClient.post("/auth/forgot-password/send-otp", {
        email: email.trim(),
        resetToken: resetToken || undefined,
      });

      const tokenFromBackend = response?.data?.resetToken;
      if (tokenFromBackend) {
        setResetToken(tokenFromBackend);
        // Gắn token lên param của URL (?token=...)
        setSearchParams({ token: tokenFromBackend }, { replace: true });
      }

      setCountdown(60);
      toast.success(response?.message || `Mã xác thực đã được gửi đến ${email}!`, {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
      });
    } catch (error) {
      toast.error(error?.message || "Gửi mã thất bại. Vui lòng kiểm tra lại email!");
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handler for Step 1: Submit email + OTP
  const handleContinueStep1 = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!otpCode.trim()) {
      newErrors.otp = "Vui lòng nhập mã xác thực đã nhận";
    } else if (otpCode.trim().length !== 6) {
      newErrors.otp = "Mã xác thực phải gồm 6 chữ số";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!resetToken) {
      setErrors({ otp: "Vui lòng bấm 'Gửi mã' trước khi tiếp tục" });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await axiosClient.post("/auth/forgot-password/verify-otp", {
        resetToken,
        email: email.trim(),
        otp: otpCode.trim(),
      });

      setStep(2);
      toast.success(response?.message || "Xác thực OTP thành công! Vui lòng đặt mật khẩu mới.", {
        position: "top-right",
        autoClose: 2500,
      });
    } catch (error) {
      toast.error(error?.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "Mật khẩu mới là bắt buộc";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await axiosClient.post("/auth/forgot-password/reset-password", {
        resetToken,
        newPassword,
        confirmPassword,
      });

      setStep(3);
      setSearchParams({}, { replace: true });
      toast.success(response?.message || "Đổi mật khẩu thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(error?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="forgot-password-page-wrapper"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="forgot-password-card">
        {/* Card Header */}
        <div className="forgot-header">
          <h1 className="forgot-title">Đổi mật khẩu</h1>

          {/* Stepper */}
          {step !== 3 && (
            <div className="stepper-container">
              {/* Step 1 Item */}
              <div
                className={`step-item ${step === 1 ? "step-active" : "step-completed"}`}
              >
                <span className="step-badge">
                  {step > 1 ? (
                    <span className="material-symbols-outlined text-sm font-bold">
                      check
                    </span>
                  ) : (
                    "1"
                  )}
                </span>
                <span className="step-label">Xác thực tài khoản</span>
              </div>

              {/* Stepper Chevron */}
              <span className="step-arrow material-symbols-outlined">
                chevron_right
              </span>

              {/* Step 2 Item */}
              <div
                className={`step-item ${step === 2 ? "step-active" : "step-inactive"}`}
              >
                <span className="step-badge">2</span>
                <span className="step-label">Đổi mật khẩu</span>
              </div>
            </div>
          )}
        </div>

        {/* STEP 1: Xác thực tài khoản */}
        {step === 1 && (
          <form onSubmit={handleContinueStep1} className="forgot-form">
            {/* Input 1: Email */}
            <div className="input-group">
              <div
                className={`input-wrapper ${errors.email ? "input-error" : ""}`}
              >
                <span className="material-symbols-outlined input-icon">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="Nhập địa chỉ email..."
                  className="custom-input"
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Input 2: Mã xác thực + Gửi mã / Countdown */}
            <div className="input-group">
              <div
                className={`input-wrapper ${errors.otp ? "input-error" : ""}`}
              >
                <span className="material-symbols-outlined input-icon">
                  verified_user
                </span>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                  }}
                  placeholder='Nhấn "Gửi mã", sau đó vui lòng nhập mã...'
                  className="custom-input pr-2"
                />
                {countdown > 0 ? (
                  <span className="countdown-badge">
                    {countdown} s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode}
                    className="send-code-btn"
                  >
                    {isSendingCode ? "Đang gửi..." : "Gửi mã"}
                  </button>
                )}
              </div>
              {errors.otp && (
                <span className="error-message">{errors.otp}</span>
              )}
            </div>

            {/* Subtext description */}
            <p className="helper-text">
              Nhấn “Gửi mã”, sau đó vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
            </p>

            {/* Tiếp tục Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-continue"
            >
              {isSubmitting ? (
                <div className="spinner"></div>
              ) : (
                "Tiếp tục"
              )}
            </button>

            {/* Footer link */}
            <div className="forgot-footer">
              <Link to="/login" className="back-login-link">
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Trở về Đăng nhập
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Đổi mật khẩu mới */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="forgot-form">
            {/* Info alert */}
            <div className="email-display-badge">
              <span className="material-symbols-outlined text-emerald-600 text-lg">
                check_circle
              </span>
              <span className="text-xs text-slate-600 truncate">
                Xác thực cho: <b className="text-slate-800">{email}</b>
              </span>
            </div>

            {/* New Password */}
            <div className="input-group">
              <div
                className={`input-wrapper ${errors.newPassword ? "input-error" : ""}`}
              >
                <span className="material-symbols-outlined input-icon">
                  lock
                </span>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword)
                      setErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  placeholder="Nhập mật khẩu mới..."
                  className="custom-input"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="eye-toggle-btn"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showNewPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.newPassword && (
                <span className="error-message">{errors.newPassword}</span>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="input-group">
              <div
                className={`input-wrapper ${errors.confirmPassword ? "input-error" : ""}`}
              >
                <span className="material-symbols-outlined input-icon">
                  lock_reset
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                  }}
                  placeholder="Xác nhận lại mật khẩu mới..."
                  className="custom-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="eye-toggle-btn"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Password requirement hint */}
            <p className="helper-text">
              * Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn cho tài khoản.
            </p>

            {/* Action Buttons */}
            <div className="step-actions">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-back-step"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-continue flex-1"
              >
                {isSubmitting ? (
                  <div className="spinner"></div>
                ) : (
                  "Xác nhận đổi mật khẩu"
                )}
              </button>
            </div>

            {/* Footer link */}
            <div className="forgot-footer">
              <Link to="/login" className="back-login-link">
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Trở về Đăng nhập
              </Link>
            </div>
          </form>
        )}

        {/* STEP 3: Hoàn tất / Thành công */}
        {step === 3 && (
          <div className="success-wrapper">
            <div className="success-icon-box">
              <span className="material-symbols-outlined text-4xl text-emerald-600">
                task_alt
              </span>
            </div>
            <h2 className="success-title">Đổi mật khẩu thành công!</h2>
            <p className="success-description">
              Mật khẩu cho tài khoản <b>{email}</b> đã được cập nhật thành công. Vui lòng đăng nhập bằng mật khẩu mới.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-continue w-full"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPasswordPage;
