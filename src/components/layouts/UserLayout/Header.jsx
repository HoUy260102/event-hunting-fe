import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import axiosClient from "../../../api/axiosClient";
import ConfirmModal from "../../modals/ConfirmModal";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, openLogin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keywordFromUrl = params.get("keyword") || "";
    setKeyword(keywordFromUrl);
  }, [location]);

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

  const handleSearch = () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (keyword.trim()) {
      searchParams.set("keyword", keyword.trim());
    } else {
      searchParams.delete("keyword");
    }
    navigate(`/search?${searchParams.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
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
      ></ConfirmModal>
      <header className="bg-[rgb(45,194,117)] text-white shadow-md sticky z-50 top-0">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <h3 className="hidden md:block text-xl sm:text-3xl font-extrabold tracking-tight">
              EventHunting
            </h3>
          </Link>

          {/* Search Bar Section - Responsive */}
          <div className="flex-1 min-w-[50px] md:max-w-xl transition-all duration-300">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-xl md:text-2xl group-focus-within:text-[#22C55E]">
                  search
                </span>
              </div>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-10 md:h-11 pl-10 md:pl-12 pr-2 md:pr-4 bg-white text-slate-900 rounded-lg border-none focus:ring-2 focus:ring-[#22C55E]/50 transition-all placeholder:text-gray-400 text-sm md:text-base"
                placeholder="Bạn tìm gì hôm nay?"
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <button className="hidden md:flex items-center gap-2 px-5 py-2.5 border-2 border-white rounded-lg font-bold text-sm hover:bg-white hover:text-[#22C55E] transition-colors">
              <span className="material-symbols-outlined text-xl">
                add_circle
              </span>
              <span>Tạo sự kiện</span>
            </button>

            <Link
              to="/my-tickets"
              className="hidden lg:flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                confirmation_number
              </span>
              <span className="text-sm font-semibold border-b border-transparent group-hover:border-white">
                Vé của tôi
              </span>
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-white/30"></div>

            {/* Profile*/}
            {user ? (
              <div
                onMouseEnter={() => setIsMenuOpen(true)}
                onMouseLeave={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 cursor-pointer group relative"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-white/20">
                    <img
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                      src={user?.avatarUrl}
                    />
                  </div>
                </div>
                <div className="hidden md:flex flex-col text-sm">
                  <span>{user?.email}</span>
                  <span>{user?.name}</span>
                </div>
                <span className="material-symbols-outlined text-white transition-transform group-hover:translate-y-0.5">
                  expand_more
                </span>
                <div
                  className={`
              absolute right-0 top-full pt-2 w-64 transition-all duration-200 z-50
              ${isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}
            `}
                >
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2">
                    {/* Các Option */}
                    <Link
                      to="/my-tickets"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-500">
                        confirmation_number
                      </span>
                      <span className="font-medium text-sm">Vé của tôi</span>
                    </Link>
                    <Link
                      to="/user/profile"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-500">
                        account_circle
                      </span>
                      <span className="font-medium text-sm">
                        Tài khoản của tôi
                      </span>
                    </Link>
                    <div className="h-px bg-gray-100 my-1 mx-4"></div>
                    <button
                      onClick={() => {
                        setConfirmModal({
                          title: "Xác nhận đăng xuất",
                          message: "Bạn chắc chắn muốn thoát khỏi ứng dụng!",
                          isOpen: true,
                          onConfirm: handleLogout,
                        });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined">logout</span>
                      <span className="font-medium text-sm">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="flex items-center gap-2 hover:scale-105 transition-opacity"
              >
                <span className="material-symbols-outlined text-2xl">
                  account_circle
                </span>
                <span className="text-sm font-bold tracking-wide">
                  Đăng nhập
                </span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
