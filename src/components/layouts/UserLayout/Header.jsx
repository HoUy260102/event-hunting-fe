import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import axiosClient from "../../../api/axiosClient";
import ConfirmModal from "../../modals/ConfirmModal";
import hochiminhImg from "../../../images/hochiminh.jpg";
import hanoiImg from "../../../images/hanoi.jpg";
import danangImg from "../../../images/danang.jpeg";
import haiphongImg from "../../../images/haiphong.jpg";

import concertImg from "../../../images/liveshowconcert.jpeg";
import trienlamImg from "../../../images/nghethuattrienlam.jpg";
import kichImg from "../../../images/sankhaukich.jpg";
import khacImg from "../../../images/khac.png";

const getCategoryImage = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("nhạc") || n.includes("concert") || n.includes("live") || n.includes("âm nhạc")) {
    return concertImg;
  }
  if (n.includes("nghệ thuật") || n.includes("triển lãm") || n.includes("trien lam")) {
    return trienlamImg;
  }
  if (n.includes("sân khấu") || n.includes("kịch") || n.includes("kich")) {
    return kichImg;
  }
  return khacImg;
};

const getCityImage = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("hồ chí minh") || n.includes("hcm") || n.includes("sài gòn")) {
    return hochiminhImg;
  }
  if (n.includes("hà nội") || n.includes("ha noi")) {
    return hanoiImg;
  }
  if (n.includes("đà nẵng") || n.includes("da nang")) {
    return danangImg;
  }
  if (n.includes("hải phòng") || n.includes("hai phong")) {
    return haiphongImg;
  }
  // Fallbacks using our local images
  const fallbacks = [hochiminhImg, hanoiImg, danangImg, haiphongImg];
  return fallbacks[Math.abs(name.length) % fallbacks.length];
};

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

  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("category");
  const [dbCategories, setDbCategories] = useState([]);
  const [dbProvinces, setDbProvinces] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [provinceRes, categoryRes] = await Promise.all([
          axiosClient.get("/provinces"),
          axiosClient.get("/categories"),
        ]);
        if (provinceRes?.data) setDbProvinces(provinceRes.data);
        if (categoryRes?.data) setDbCategories(categoryRes.data);
      } catch (error) {
        console.error("Failed to fetch search metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  const fetchSearchHistory = async () => {
    if (user) {
      try {
        const response = await axiosClient.get("/search/history");
        if (response?.data) {
          setSearchHistory(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch search history from Redis:", error);
      }
    } else {
      const localHistory = JSON.parse(localStorage.getItem("local_search_history") || "[]");
      setSearchHistory(localHistory);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keywordFromUrl = params.get("keyword") || "";
    setKeyword(keywordFromUrl);
  }, [location]);

  useEffect(() => {
    fetchSearchHistory();
  }, [user]);

  useEffect(() => {
    if (isSearchFocused) {
      fetchSearchHistory();
    }
  }, [isSearchFocused]);

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

  const saveSearchHistory = async (queryToSave) => {
    const trimmed = queryToSave.trim();
    if (!trimmed) return;

    if (user) {
      try {
        await axiosClient.post(`/search/history?query=${encodeURIComponent(trimmed)}`);
      } catch (error) {
        console.error("Failed to save search history to Redis:", error);
      }
    } else {
      let localHistory = JSON.parse(localStorage.getItem("local_search_history") || "[]");
      localHistory = localHistory.filter(item => item !== trimmed);
      localHistory.unshift(trimmed);
      localHistory = localHistory.slice(0, 10);
      localStorage.setItem("local_search_history", JSON.stringify(localHistory));
    }
    fetchSearchHistory();
  };

  const deleteSearchHistoryItem = async (e, itemToDelete) => {
    e.stopPropagation();
    e.preventDefault();
    if (user) {
      try {
        await axiosClient.delete(`/search/history?query=${encodeURIComponent(itemToDelete)}`);
      } catch (error) {
        console.error("Failed to delete search history from Redis:", error);
      }
    } else {
      let localHistory = JSON.parse(localStorage.getItem("local_search_history") || "[]");
      localHistory = localHistory.filter(item => item !== itemToDelete);
      localStorage.setItem("local_search_history", JSON.stringify(localHistory));
    }
    fetchSearchHistory();
  };

  const handleSearch = (searchTerm = keyword) => {
    const trimmed = searchTerm.trim();
    const searchParams = new URLSearchParams(window.location.search);
    if (trimmed) {
      searchParams.set("keyword", trimmed);
      saveSearchHistory(trimmed);
    } else {
      searchParams.delete("keyword");
    }
    navigate(`/search?${searchParams.toString()}`);
    setIsSearchFocused(false);
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
        <div className="max-w-[1440px] mx-auto px-2 md:px-4 h-20 flex items-center justify-between gap-8">
          {/* Logo Section */}
          <Link to="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
            {/* Logo Chữ cho Desktop */}
            <img
              src="https://res.cloudinary.com/dstmcgsoa/image/upload/v1779946512/eventhuntinglogochu_lpzadg.png"
              alt="EventHunting Logo"
              className="hidden md:block h-24 w-auto object-contain"
            />
            {/* Logo Biểu tượng cho Mobile */}
            <img
              src="https://res.cloudinary.com/dstmcgsoa/image/upload/v1779947380/eventhuntinglogo_drv0cb.png"
              alt="EventHunting Icon"
              className="block md:hidden h-20 w-auto object-contain"
            />
          </Link>

          {/* Search Bar Section - Responsive */}
          <div className="flex-1 min-w-[50px] md:max-w-xl transition-all duration-300">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none z-10">
                <span className="material-symbols-outlined text-gray-400 text-xl md:text-2xl group-focus-within:text-[#22C55E]">
                  search
                </span>
              </div>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full h-10 md:h-11 pl-10 md:pl-12 pr-2 md:pr-4 bg-white text-slate-900 rounded-lg border-none focus:ring-2 focus:ring-[#22C55E]/50 transition-all placeholder:text-gray-400 text-sm md:text-base outline-none"
                placeholder="Bạn tìm gì hôm nay?"
                type="text"
              />

              {/* Search History Dropdown - Premium Ticketbox Dark Glassmorphism style */}
              {isSearchFocused && (
                <div className="fixed left-4 right-4 top-[76px] md:absolute md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[700px] md:top-full mt-2 bg-[#181A20]/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50 text-white">
                  <div className="py-3">

                    {/* Recent Search History Section */}
                    {searchHistory.length > 0 && (
                      <>
                        <div className="mb-2">
                          {searchHistory.map((item, index) => (
                            <div
                              key={index}
                              onMouseDown={() => {
                                setKeyword(item);
                                handleSearch(item);
                              }}
                              className="flex items-center justify-between px-5 py-2.5 hover:bg-white/5 cursor-pointer group/item transition-colors"
                            >
                              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                <span className="material-symbols-outlined text-gray-400 text-xl flex-shrink-0">
                                  schedule
                                </span>
                                <span className="text-[14px] text-gray-200 font-medium group-hover/item:text-white truncate">
                                  {item}
                                </span>
                              </div>
                              {/* Trash Delete Icon - Visible strictly on hover */}
                              <button
                                onMouseDown={(e) => deleteSearchHistoryItem(e, item)}
                                className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-white/10 text-gray-400 hover:text-rose-400 rounded-md transition-all duration-200"
                                title="Xóa tìm kiếm"
                              >
                                <span className="material-symbols-outlined text-base">
                                  delete
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-slate-800/80 my-2"></div>
                      </>
                    )}

                    {/* Categories and Cities Tabs */}
                    <div className="flex border-b border-slate-800/80 px-5 gap-6 mt-2">
                      <button
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab("category"); }}
                        className={`pb-2.5 text-xs sm:text-sm transition-all relative font-bold tracking-wide uppercase ${activeTab === "category" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                      >
                        Khám phá theo Thể loại
                        {activeTab === "category" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2DC275]"></div>
                        )}
                      </button>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab("city"); }}
                        className={`pb-2.5 text-xs sm:text-sm transition-all relative font-bold tracking-wide uppercase ${activeTab === "city" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                      >
                        Khám phá theo Thành phố
                        {activeTab === "city" && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2DC275]"></div>
                        )}
                      </button>
                    </div>

                    {/* Tab contents grid */}
                    {activeTab === "category" ? (
                      <div className="px-4 py-3">
                        {dbCategories.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {dbCategories.slice(0, 4).map((cat) => {
                              const imgUrl = getCategoryImage(cat.name);
                              return (
                                <div
                                  key={cat.id}
                                  onMouseDown={() => {
                                    navigate(`/search?categoryIds=${cat.id}`);
                                    setIsSearchFocused(false);
                                  }}
                                  className="relative h-20 rounded-xl overflow-hidden cursor-pointer group/card active:scale-[0.98] transition-all shadow-md flex items-center justify-center border border-white/5 hover:border-white/20 bg-slate-900"
                                >
                                  {/* Photographic Background Image */}
                                  <img
                                    src={imgUrl}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/card:scale-110 transition-transform duration-500"
                                  />
                                  {/* Dark Gradient Overlay for text readability */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

                                  <span className="relative z-10 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase text-white text-center px-2 group-hover/card:scale-105 transition-all line-clamp-2 drop-shadow-md">
                                    {cat.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-xs text-gray-500">
                            Không có thể loại nào khả dụng
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3">
                        {dbProvinces.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {dbProvinces.slice(0, 4).map((prov) => {
                              const imgUrl = getCityImage(prov.name);
                              return (
                                <div
                                  key={prov.id}
                                  onMouseDown={() => {
                                    navigate(`/search?provinceId=${prov.id}`);
                                    setIsSearchFocused(false);
                                  }}
                                  className="relative h-20 rounded-xl overflow-hidden cursor-pointer group/card active:scale-[0.98] transition-all shadow-md flex items-center justify-center border border-white/5 hover:border-white/20 bg-slate-900"
                                >
                                  {/* Photographic Background Image */}
                                  <img
                                    src={imgUrl}
                                    alt={prov.name}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/card:scale-110 transition-transform duration-500"
                                  />
                                  {/* Dark Gradient Overlay for text readability */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

                                  <span className="relative z-10 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase text-white text-center px-2 group-hover/card:scale-105 transition-all line-clamp-2 drop-shadow-md">
                                    {prov.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-xs text-gray-500">
                            Không có thành phố nào khả dụng
                          </div>
                        )}
                      </div>
                    )}



                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <button className="flex items-center justify-center gap-2 w-10 h-10 lg:w-auto lg:h-auto lg:px-5 lg:py-2.5 bg-white/15 hover:bg-white border border-white/20 hover:border-transparent text-white hover:text-[rgb(45,194,117)] rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]">
              <span className="material-symbols-outlined text-xl">
                add_circle
              </span>
              <span className="hidden lg:inline">Tạo sự kiện</span>
            </button>

            <Link
              to="/my-tickets"
              className="flex items-center justify-center gap-2 w-10 h-10 lg:w-auto lg:h-auto lg:px-4 lg:py-2.5 rounded-xl bg-white/0 hover:bg-white/10 text-white hover:text-white transition-all duration-300 font-bold text-sm group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 group-hover:rotate-[15deg] transition-all text-white">
                confirmation_number
              </span>
              <span className="hidden lg:inline text-sm font-bold border-b border-transparent group-hover:border-white">
                Vé của tôi
              </span>
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-white/30 hidden sm:block"></div>

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
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <div className="hidden lg:flex flex-col text-sm">
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
                      to="/my-calendar"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-500">
                        calendar_month
                      </span>
                      <span className="font-medium text-sm">Lịch của tôi</span>
                    </Link>
                    <Link
                      to="/my-favorite-events"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-500">
                        favorite
                      </span>
                      <span className="font-medium text-sm">Sự kiện yêu thích</span>
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
