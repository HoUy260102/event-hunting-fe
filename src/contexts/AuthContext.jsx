/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useLocation, useNavigate } from "react-router-dom";
export const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openLogin = () => setIsLoginModalOpen(true);
  const closeLogin = () => setIsLoginModalOpen(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (storedUser && storedUser !== "undefined" && token && refreshToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setPermissions(parsedUser?.permissions || []);
    }
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   let isMounted = true;
  //   const syncPermissions = async () => {
  //     if (!user?.roleId || location.pathname === "/login") return;
  //     try {
  //       const res = await axiosClient.get(`/roles/${user.roleId}/permissions`);
  //       const newPerms = res.data?.map((p) => p.code) || [];
  //       if (
  //         isMounted &&
  //         JSON.stringify(newPerms) !== JSON.stringify(permissions)
  //       ) {
  //         setPermissions(newPerms);
  //         const currentStored = JSON.parse(
  //           localStorage.getItem("user") || "{}",
  //         );
  //         localStorage.setItem(
  //           "user",
  //           JSON.stringify({ ...currentStored, permissions: newPerms }),
  //         );
  //         console.log("Quyền của bạn đã được Admin cập nhật!");
  //       }
  //     } catch (error) {
  //       console.error("Lỗi đồng bộ quyền:", error);
  //     }
  //   };
  //   syncPermissions();
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [location.pathname, user?.roleId]);

  const login = (userData, token, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    setPermissions(userData?.permissions);
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const response = await axiosClient.get("/auth/me");
      const updatedUser = response.data;

      if (updatedUser) {
        setUser(updatedUser);
        setPermissions(updatedUser.permissions || []);
        const currentStored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...currentStored, ...updatedUser }),
        );
        return updatedUser;
      }
    } catch (error) {
      console.error("Không thể làm mới thông tin user:", error);
      if (error.status === 401) logout();
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setPermissions([]);
  };

  const requireAuth = (path) => {
    if (!user) {
      openLogin();
      return;
    }
    navigate(path);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        login,
        logout,
        loading,
        isLoginModalOpen,
        openLogin,
        closeLogin,
        requireAuth,
        refreshUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
