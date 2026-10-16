import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import Modal from "../../components/common/Modal";
import axiosClient from "../../api/axiosClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./VerifyWaitingSignUpPage.css";
import backgroundImageUrl from "../../images/bgeventhunting.png";
import emailSendingImgUrl from "../../images/emailsending.jpg";

const VerifyWaitingSignUpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const email =
    location.state?.email ||
    new URLSearchParams(location.search).get("email") ||
    "người dùng";

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/api/v1/ws");
    const stompClient = Stomp.over(socket);

    stompClient.debug = null;

    stompClient.connect(
      {},
      () => {
        console.log("Connected to WebSocket");
        stompClient.subscribe(`/topic/verify/${email}`, (message) => {
          if (message.body === "SUCCESS") {
            setModal({
              isOpen: true,
              title: "Xác thực tài khoản",
              message: "Xác thực tài khoản thành công",
              type: "success",
            });
          } else {
            setModal({
              isOpen: true,
              title: "Xác thực tài khoản",
              message: "Xác thực tài khoản không thành công: " + message.body,
              type: "error",
            });
          }
        });
      },
      (error) => {
        setModal({
          isOpen: true,
          title: "Xác thực tài khoản",
          message: "Xác thực tài khoản không thành công",
          type: "error",
        });
        console.error("WebSocket error: ", error);
      },
    );

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [email, navigate]);

  const handleResend = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    try {
      const response = await axiosClient.post("/auth/resend-verify", null, {
        params: { email },
      });
      toast.success(response?.message || "Đã gửi lại email xác thực mới! Vui lòng kiểm tra hộp thư.", {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
      });
      setCountdown(60);
    } catch (error) {
      toast.error(error?.message || "Không thể gửi lại email xác thực. Vui lòng thử lại sau!", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
          type={modal.type}
        />
      )}
      <div
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        className="flex justify-center items-center min-h-screen"
      >
        <div className="verify-container shadow-2xl">
          <div className="left-panel">
            <div className="text-content">
              <h1>
                Xác thực <br /> Tài khoản
              </h1>
              <p>Vui lòng kiểm tra email để tiếp tục.</p>
            </div>
          </div>

          <div className="right-panel">
            <img
              src={emailSendingImgUrl}
              style={{
                width: "280px",
                height: "auto",
                minWidth: "35px", 
                display: "block",
                objectFit: "contain",
              }}
              className="verify-icon"
              alt="email-icon"
            />
            <h2 className="verify-title">Kiểm tra hộp thư của bạn</h2>
            <p className="verify-text">
              Chúng tôi đã gửi link xác thực đến <b>{email}</b>. <br />
            </p>
            <button
              className="verify-button"
              onClick={handleResend}
              disabled={loading || countdown > 0}
            >
              {loading
                ? "Đang gửi..."
                : countdown > 0
                ? `Gửi lại sau (${countdown}s)`
                : "Gửi lại email xác thực"}
            </button>
            <Link to="/login" className="resend-link">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default VerifyWaitingSignUpPage;
