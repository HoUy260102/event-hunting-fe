/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useLocation } from "react-router-dom";
export const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
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

  useEffect(() => {
    let isMounted = true;

    const syncPermissions = async () => {
      if (!user?.roleId) return;
      try {
        const res = await axiosClient.get(`/roles/${user.roleId}/permissions`);
        const newPerms = res.data?.map((p) => p.code) || [];
        if (
          isMounted &&
          JSON.stringify(newPerms) !== JSON.stringify(permissions)
        ) {
          setPermissions(newPerms);
          const currentStored = JSON.parse(
            localStorage.getItem("user") || "{}",
          );
          localStorage.setItem(
            "user",
            JSON.stringify({ ...currentStored, permissions: newPerms }),
          );
          console.log("Quyền của bạn đã được Admin cập nhật!");
        }
      } catch (error) {
        console.error("Lỗi đồng bộ quyền:", error);
      }
    };
    syncPermissions();
    return () => {
      isMounted = false;
    };
  }, [location.pathname, user?.roleId]); 

  const login = (userData, token, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    setPermissions(userData?.permissions);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider value={{ user, permissions, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
