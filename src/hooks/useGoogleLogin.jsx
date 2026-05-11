// hooks/useGoogleLogin.js
import { useState, useEffect, useCallback, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export function useGoogleLogin({ onSuccess, onError, onClose } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const popupRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    const width = 500,
      height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "/loading.html",
      "Google Login",
      `width=${width},height=${height},left=${left},top=${top},noopener=no`,
    );

    if (!popup) {
      setError("Popup bị chặn! Vui lòng cho phép popup.");
      setLoading(false);
      return;
    }

    popupRef.current = popup;

    try {
      const res = await axiosClient.get("auth/google/url");
      const url = res?.data?.url;
      popup.location.href = url;
    } catch (err) {
      popup.close();
      setError("Không lấy được URL đăng nhập." + err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:8080") return;

      const { type, payload } = event.data || {};

      if (type === "LOGIN_SUCCESS") {
        setLoading(false);
        setError(null);
        login(payload?.user, payload?.accessToken, payload?.refreshToken);
        onSuccess?.(payload);
        if (onClose) {
          onClose();
          return;
        }
        if (payload?.user?.role === "ADMIN") {
          navigate("/admin/");
          return;
        }
        if (payload?.user?.role === "USER") {
          navigate("/");
          return;
        }
      }
      
      if (type === "LOGIN_FAILURE") {
        setLoading(false);
        setError(payload?.error || "Đăng nhập thất bại");
        onError?.(payload?.error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, onError, onClose]);

  return { loginWithGoogle, loading, error };
}
