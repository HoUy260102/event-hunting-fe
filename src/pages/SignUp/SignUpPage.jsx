import React, { useState } from "react";
import "./SignUpPage.css";
import { toast, ToastContainer } from "react-toastify";
import eventIllustration from "../../images/happy-tiny-business-people-dancing-having-fun-drinking-wine-corporate-party-team-building-activity-corporate-event-idea-concept-pinkish-coral-bluevector-isolated-illustration.png";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

const signupSchema = z
  .object({
    email: z.string().email("Email không hợp lệ").nonempty("Email là bắt buộc"),
    name: z.string().nonempty("Tên không được để trống"),
    phone: z
      .string()
      .regex(
        /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        "Số điện thoại không đúng định dạng VN",
      )
      .nonempty("Số điện thoại là bắt buộc"),
    dob: z.string().refine((val) => {
      const selectedDate = new Date(val);
      const now = new Date();
      return selectedDate < now;
    }, "Ngày sinh phải là một ngày trong quá khứ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().nonempty("Vui lòng xác nhận mật khẩu"),
    address: z.preprocess((val) => {
      if (typeof val !== "string" || val.trim() === "") {
        return undefined;
      }
      return val.trim();
    }, z.string().min(1, "Nếu nhập thì phải có ít nhất 1 ký tự").optional()),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
      });
    }
  });

function SignUpPage() {
  const [showVerifyLink, setShowVerifyLink] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      dob: data.dob === "" ? null : data.dob,
    };
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        const err = new Error();
        err.details = result;
        throw err;
      }

      toast.success("Đăng ký thành công! Đang chuyển hướng xác thực...", {
        position: "top-right",
        theme: "colored",
      });

      setTimeout(() => {
        navigate(`/signup/verify?email=${data.email}`);
      }, 2000);
    } catch (err) {
      if (err.details?.code === "USER_NOT_VERIFIED") {
        setShowVerifyLink(true);
        setUserEmail(data.email);
        return;
      }
      toast.error(err.details?.message, {
        position: "top-right",
        theme: "colored",
      });
    }
  };

  const handleSendVerifyMail = async () => {
    setIsSending(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/auth/resend-verify?email=${userEmail}`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        toast.success("Mã mới đã gửi! Đang chuyển hướng...");
        setTimeout(() => {
          navigate(`/signup/verify?email=${userEmail}`);
        }, 1500);
      } else {
        toast.error("Gửi mail thất bại, thử lại sau.");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server.:", error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="login-container shadow">
        <div className="left-panel">
          <div className="text-content">
            <h1>Event Hunting</h1>
            <p>
              Join our community to discover and manage events effortlessly.
              Your journey to amazing experiences starts here.
            </p>
            <img
              src={eventIllustration}
              alt="Signup Illustration"
              className="event-illustration"
            />
          </div>
        </div>

        <div className="right-panel">
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">EMAIL:</label>
              <input
                type="email"
                id="email"
                placeholder="Email address"
                {...register("email")}
              />
              {errors.email && (
                <span
                  className="error-text"
                  style={{ color: "red", fontSize: "12px" }}
                >
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label htmlFor="password">PASSWORD:</label>
              <input
                type="password"
                id="password"
                placeholder="At least 6 characters"
                {...register("password")}
              />
              {errors.password && (
                <span
                  className="error-text"
                  style={{ color: "red", fontSize: "12px" }}
                >
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD:</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Repeat your password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <span
                  className="error-text"
                  style={{ color: "red", fontSize: "12px" }}
                >
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
            {/* NAME */}
            <div className="form-group">
              <label htmlFor="password">NAME:</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                {...register("name")}
              />
              {errors.name && (
                <span
                  className="error-text"
                  style={{ color: "red", fontSize: "12px" }}
                >
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* PHONE */}
            <div className="form-group">
              <label htmlFor="phone">PHONE:</label>
              <input
                type="text"
                id="phone"
                placeholder="Phone number"
                {...register("phone")}
              />
              {errors.phone && (
                <span
                  className="error-text"
                  style={{ color: "red", fontSize: "12px" }}
                >
                  {errors.phone.message}
                </span>
              )}
            </div>

            {/* ADDRESS */}
            <div className="form-group">
              <label htmlFor="address">Địa chỉ:</label>
              <input
                type="text"
                id="address"
                placeholder="Nhập địa chỉ"
                {...register("address")}
              />
              {errors.address && (
                <span
                  className="error-text"
                  style={{ color: "red", fontSize: "12px" }}
                >
                  {errors.address.message}
                </span>
              )}
            </div>

            {/* DATE OF BIRTH */}
            <div className="form-group">
              <label htmlFor="dob">DATE OF BIRTH:</label>
              <input
                type="date"
                id="dob"
                max={new Date().toISOString().split("T")[0]}
                {...register("dob")}
              />
              {errors.dob && (
                <span
                  className="error-text"
                  style={{ color: "red", fontSize: "12px" }}
                >
                  {errors.dob.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="login-button"
              style={{ marginTop: "10px" }}
            >
              Sign Up →
            </button>

            <p
              className="forgot-password-link"
              style={{ textAlign: "center", marginTop: "15px" }}
            >
              Already have an account?{" "}
              <Link to="/login" style={{ fontWeight: "bold" }}>
                Login
              </Link>
            </p>
            {showVerifyLink && (
              <p
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                  fontSize: "14px",
                }}
              >
                Tài khoản chưa xác thực.{" "}
                <span
                  onClick={!isSending ? handleSendVerifyMail : null}
                  style={{
                    color: "red",
                    textDecoration: "underline",
                    cursor: isSending ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {isSending
                    ? "Đang gửi mail..."
                    : "Nhấn vào đây để nhận mã và xác thực"}
                </span>
              </p>
            )}
          </form>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default SignUpPage;
