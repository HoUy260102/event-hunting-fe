import React, { useState } from "react";
import { useHeader } from "../../../hooks/useHeader";
import { useAuth } from "../../../hooks/useAuth";
import ActionMenu from "../../common/ActionMenu";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import axiosClient from "../../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../modals/ConfirmModal";

const Header = () => {
  const { title } = useHeader();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const navigate = useNavigate();
  const renderRole = (roleName) => {
    switch (roleName) {
      case "ADMIN":
        return "Quản trị viên";
      case "ORGANIZER":
        return "Nhà tổ chức";
      default:
        return roleName || "Người dùng";
    }
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      logout();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal?.isOpen}
        title={confirmModal?.title}
        message={confirmModal?.message}
        onConfirm={confirmModal?.onConfirm}
        onClose={() => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
      />
      <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center px-8 sticky top-0 z-[40] transition-all duration-300 shadow-sm">
        {/* Left Section: Title & Search Bar */}
        <div className="flex items-center gap-10 flex-1 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full shrink-0"></div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight whitespace-nowrap">{title}</h3>
          </div>

          {/* Search Bar - Long and professional next to title */}
          <div className="hidden md:flex items-center bg-slate-100/50 border border-slate-200/60 px-4 py-2 rounded-2xl w-full max-w-xl transition-all focus-within:bg-white focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50">
            <span className="material-symbols-outlined text-slate-400 text-xl mr-2">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
            />
            <span className="hidden lg:block text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded ml-2 uppercase tracking-tighter">⌘K</span>
          </div>
        </div>

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center gap-5 shrink-0 ml-4">

          {/* Notification Bell */}
          <button className="relative w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

          {/* User Profile Dropdown (Like UserLayout) */}
          <div
            className="relative"
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center gap-4 group cursor-pointer py-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                  {user?.name}
                </p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                  {renderRole(user?.role)}
                </p>
              </div>

              <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 transition-transform group-hover:scale-105">
                <div className="w-10 h-10 rounded-2xl border-2 border-white overflow-hidden bg-slate-100 shadow-sm">
                  <img
                    src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </div>

            {/* Dropdown Menu */}
            <div className={`
              absolute right-0 top-full pt-2 w-64 transition-all duration-300 z-50
              ${isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}
            `}>
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2">
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tài khoản</p>
                  <p className="text-xs font-medium text-slate-600 truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => navigate("/admin/update-profile")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">account_circle</span>
                  <span className="font-bold text-sm">Chỉnh sửa hồ sơ</span>
                </button>

                <button
                  onClick={() => navigate("/admin/settings")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">settings</span>
                  <span className="font-bold text-sm">Cài đặt hệ thống</span>
                </button>

                <div className="h-px bg-slate-100 my-1 mx-4"></div>

                <button
                  onClick={() => {
                    setConfirmModal({
                      title: "Xác nhận đăng xuất",
                      message: "Bạn chắc chắn muốn thoát khỏi hệ thống?",
                      isOpen: true,
                      onConfirm: handleLogout,
                    });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-bold text-sm">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
