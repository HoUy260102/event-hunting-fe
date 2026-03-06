import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import "./VerifyWaitingSignUpPage.css";
import Modal from "../../components/Common/Modal";

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
  const email =
    location.state?.email ||
    new URLSearchParams(location.search).get("email") ||
    "người dùng";

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
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/auth/resend-verify?email=${email}`,
        {
          method: "POST",
        },
      );
      const result = await response.json();
      if (response.ok) {
        alert("Đã gửi lại email xác thực mới!");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert("Lỗi:" + error.message);
    }
    setLoading(false);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="login-container">
          <div className="left-panel">
            <div className="text-content">
              <h1>
                Xác thực <br /> Tài khoản
              </h1>
              <p>Vui lòng kiểm tra email để tiếp tục.</p>
            </div>
          </div>

          <div className="right-panel">
            <div className="verify-container">
              <span className="verify-icon">✉️</span>
              <h2 className="verify-title">Kiểm tra hộp thư của bạn</h2>
              <p className="verify-text">
                Chúng tôi đã gửi link xác thực đến <b>{email}</b>. <br />
                Hệ thống sẽ tự động đăng nhập sau khi bạn xác nhận trong mail.
              </p>

              <button
                className="login-button"
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi lại email xác thực"}
              </button>
              <Link to="/login" className="resend-link">
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyWaitingSignUpPage;
