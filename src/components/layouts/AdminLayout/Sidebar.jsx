import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { useAuth } from "../../../hooks/useAuth";
import axiosClient from "../../../api/axiosClient";
import ConfirmModal from "../../modals/ConfirmModal";

function Sidebar({ isOpen, handleIsOpen }) {
  const { user, logout } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

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

  // Hàm xác định trạng thái active dựa trên đường dẫn hiện tại
  const getActiveState = () => {
    if (pathname === "/admin" || pathname === "/admin/") {
      return { menu: "dashboard", dropdown: null };
    }
    if (pathname.includes("/admin/users") || pathname.includes("/admin/add-user")) {
      return { menu: "users", dropdown: "users" };
    }
    if (pathname.includes("/admin/categories") || pathname.includes("/admin/add-category")) {
      return { menu: "categories", dropdown: "categories" };
    }
    if (pathname.includes("/admin/events") || pathname.includes("/admin/add-event")) {
      return { menu: "events", dropdown: "events" };
    }
    if (pathname.includes("/admin/reservations")) {
      return { menu: "reservations", dropdown: "reservations" };
    }
    if (pathname.includes("/admin/vouchers") || pathname.includes("/admin/add-voucher")) {
      return { menu: "vouchers", dropdown: "vouchers" };
    }
    if (pathname.includes("/admin/roles") || pathname.includes("/admin/permissions")) {
      return { menu: "permissions", dropdown: "permissions" };
    }
    return { menu: "dashboard", dropdown: null };
  };

  const [activeMenu, setActiveMenu] = useState(() => getActiveState().menu);
  const [openDropdown, setOpenDropdown] = useState(() => getActiveState().dropdown);

  // Đồng bộ lại trạng thái khi thay đổi trang hoặc tải lại trang
  useEffect(() => {
    const state = getActiveState();
    setActiveMenu(state.menu);
    if (state.dropdown) {
      setOpenDropdown(state.dropdown);
    }
  }, [pathname]);

  const [activeHoveredTop, setActiveHoveredTop] = useState(0);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnterDropdown = (key, rectTop) => {
    if (!isOpen) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (rectTop !== undefined) setActiveHoveredTop(rectTop);
      setHoveredDropdown(key);
    }
  };

  const handleMouseLeaveDropdown = () => {
    if (!isOpen) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredDropdown(null);
      }, 150);
    }
  };

  const usersRef = useRef(null);
  const vouchersRef = useRef(null);
  const reservationsRef = useRef(null);
  const categoriesRef = useRef(null);
  const permissionsRef = useRef(null);
  const eventsRef = useRef(null);

  const toggleDropdown = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  const toggleSidebar = () => {
    closeAllDropdowns();
    handleIsOpen();
  };

  if (role === "USER") return null;

  const isAdmin = role === "ADMIN";

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
      <aside className={`sidebar ${!isOpen ? "collapsed" : ""}`}>
        <header className="sidebar-header">
          <Link to="/admin" className="header-logo relative flex items-center w-[160px] h-[54px] overflow-visible">
            {/* Expanded Text Logo */}
            <img
              src="https://res.cloudinary.com/dstmcgsoa/image/upload/v1779946512/eventhuntinglogochu_lpzadg.png"
              alt="EventHunting Logo"
              className={`h-[54px] w-auto object-contain transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) drop-shadow-[0_0_15px_rgba(16,185,129,0.85)] drop-shadow-[0_0_4px_rgba(16,185,129,0.45)] hover:scale-105 hover:drop-shadow-[0_0_28px_rgba(16,185,129,0.98)] hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.75)] ${isOpen
                ? "opacity-100 scale-100 translate-x-0 pointer-events-auto"
                : "opacity-0 scale-75 -translate-x-12 pointer-events-none absolute"
                }`}
            />

            {/* Collapsed Icon Logo */}
            <div
              className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${!isOpen
                ? "opacity-100 scale-100 translate-x-0 pointer-events-auto"
                : "opacity-0 scale-75 translate-x-12 pointer-events-none absolute"
                }`}
            >
              <img
                src="https://res.cloudinary.com/dstmcgsoa/image/upload/v1779947380/eventhuntinglogo_drv0cb.png"
                alt="EventHunting Icon"
                className="w-[45px] h-[45px] object-contain"
              />
            </div>
          </Link>
          <button className="sidebar-toggler" onClick={toggleSidebar}>
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
        </header>

        <nav className="sidebar-nav">
          <ul className="nav-list primary-nav">
            <li className="nav-item">
              <Link
                to="/admin"
                className={`nav-link ${activeMenu === "dashboard" ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu("dashboard");
                }}
              >
                <span className="material-symbols-rounded">dashboard</span>
                <span className="nav-label">Dashboard</span>
              </Link>
            </li>

            {/* Quản lý tài khoản */}
            {isAdmin && (
              <li
                className={`nav-item dropdown-container ${openDropdown === "users" ? "open" : ""} ${
                  !isOpen && hoveredDropdown === "users" ? "active-hover" : ""
                }`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleMouseEnterDropdown("users", rect.top);
                }}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <Link
                  to="#"
                  className={`nav-link custom-dropdown-toggle ${activeMenu === "users" ? "active" : ""}`}
                  onClick={() => {
                    toggleDropdown("users");
                  }}
                >
                  <span className="material-symbols-rounded">
                    manage_accounts
                  </span>
                  <span className="nav-label">Quản lý tài khoản</span>
                  <span className="dropdown-icon material-symbols-rounded">
                    keyboard_arrow_down
                  </span>
                </Link>

                <ul
                  ref={usersRef}
                  className="dropdown"
                  onMouseEnter={() => handleMouseEnterDropdown("users")}
                  onMouseLeave={handleMouseLeaveDropdown}
                  style={!isOpen ? {
                    position: "fixed",
                    left: "85px",
                    top: `${activeHoveredTop - 12}px`,
                  } : {
                    height:
                      openDropdown === "users"
                        ? `${usersRef.current?.scrollHeight || 0}px`
                        : 0,
                    overflow: "hidden",
                    transition: "height 0.3s ease",
                  }}
                >
                  <li className="nav-item">
                    <Link className="nav-link dropdown-title">
                      Quản lý tài khoản
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/admin/users"
                      className="nav-link dropdown-link"
                      onClick={() => {
                        setActiveMenu("users");
                      }}
                    >
                      Danh sách tài khoản
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/admin/add-user"
                      className="nav-link dropdown-link"
                      onClick={() => {
                        setActiveMenu("users");
                      }}
                    >
                      Thêm tài khoản
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* Thể loại */}
            {isAdmin && (
              <li
                className={`nav-item dropdown-container ${openDropdown === "categories" ? "open" : ""} ${
                  !isOpen && hoveredDropdown === "categories" ? "active-hover" : ""
                }`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleMouseEnterDropdown("categories", rect.top);
                }}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <a
                  href="#"
                  className={`nav-link custom-dropdown-toggle ${activeMenu === "categories" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown("categories");
                  }}
                >
                  <span className="material-symbols-rounded">category</span>
                  <span className="nav-label">Chủ đề</span>
                  <span className="dropdown-icon material-symbols-rounded">
                    keyboard_arrow_down
                  </span>
                </a>

                <ul
                  ref={categoriesRef}
                  className="dropdown"
                  onMouseEnter={() => handleMouseEnterDropdown("categories")}
                  onMouseLeave={handleMouseLeaveDropdown}
                  style={!isOpen ? {
                    position: "fixed",
                    left: "85px",
                    top: `${activeHoveredTop - 12}px`,
                  } : {
                    height:
                      openDropdown === "categories"
                        ? `${categoriesRef.current?.scrollHeight || 0}px`
                        : 0,
                    overflow: "hidden",
                    transition: "height 0.3s ease",
                  }}
                >
                  <li className="nav-item">
                    <Link className="nav-link dropdown-title">Chủ đề</Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/admin/categories"
                      className="nav-link dropdown-link"
                      onClick={() => {
                        setActiveMenu("categories");
                      }}
                    >
                      Danh sách chủ đề
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/admin/add-category"
                      className="nav-link dropdown-link"
                      onClick={() => {
                        setActiveMenu("categories");
                      }}
                    >
                      Thêm chủ đề mới
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* Events */}
            <li
              className={`nav-item dropdown-container ${openDropdown === "events" ? "open" : ""} ${
                !isOpen && hoveredDropdown === "events" ? "active-hover" : ""
              }`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleMouseEnterDropdown("events", rect.top);
              }}
              onMouseLeave={handleMouseLeaveDropdown}
            >
              <a
                className={`nav-link custom-dropdown-toggle ${activeMenu === "events" ? "active" : ""}`}
                onClick={() => {
                  toggleDropdown("events");
                }}
              >
                <span className="material-symbols-rounded">event</span>
                <span className="nav-label">Sự kiện</span>
                <span className="dropdown-icon material-symbols-rounded">
                  keyboard_arrow_down
                </span>
              </a>

              <ul
                ref={eventsRef}
                className="dropdown"
                onMouseEnter={() => handleMouseEnterDropdown("events")}
                onMouseLeave={handleMouseLeaveDropdown}
                style={!isOpen ? {
                  position: "fixed",
                  left: "85px",
                  top: `${activeHoveredTop - 12}px`,
                } : {
                  height:
                    openDropdown === "events"
                      ? `${eventsRef.current?.scrollHeight || 0}px`
                      : 0,
                  overflow: "hidden",
                  transition: "height 0.3s ease",
                }}
              >
                <li className="nav-item">
                  <Link className="nav-link dropdown-title">Sự kiện</Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/admin/events"
                    className="nav-link dropdown-link"
                    onClick={() => {
                      setActiveMenu("events");
                    }}
                  >
                    Danh sách sự kiện
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/admin/add-event"
                    className="nav-link dropdown-link"
                    onClick={() => {
                      setActiveMenu("events");
                    }}
                  >
                    Thêm sự kiện
                  </Link>
                </li>
              </ul>
            </li>

            {/* Reservations */}
            <li
              className={`nav-item dropdown-container ${openDropdown === "reservations" ? "open" : ""} ${
                !isOpen && hoveredDropdown === "reservations" ? "active-hover" : ""
              }`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleMouseEnterDropdown("reservations", rect.top);
              }}
              onMouseLeave={handleMouseLeaveDropdown}
            >
              <a
                className={`nav-link custom-dropdown-toggle ${activeMenu === "reservations" ? "active" : ""}`}
                onClick={() => {
                  toggleDropdown("reservations");
                }}
              >
                <span className="material-symbols-rounded">book_online</span>
                <span className="nav-label">Đặt chỗ</span>
                <span className="dropdown-icon material-symbols-rounded">
                  keyboard_arrow_down
                </span>
              </a>

              <ul
                ref={reservationsRef}
                className="dropdown"
                onMouseEnter={() => handleMouseEnterDropdown("reservations")}
                onMouseLeave={handleMouseLeaveDropdown}
                style={!isOpen ? {
                  position: "fixed",
                  left: "85px",
                  top: `${activeHoveredTop - 12}px`,
                } : {
                  height:
                    openDropdown === "reservations"
                      ? `${reservationsRef.current?.scrollHeight || 0}px`
                      : 0,
                  overflow: "hidden",
                  transition: "height 0.3s ease",
                }}
              >
                <li className="nav-item">
                  <Link className="nav-link dropdown-title">Đặt chỗ</Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/admin/reservations"
                    className="nav-link dropdown-link"
                    onClick={() => {
                      setActiveMenu("reservations");
                    }}
                  >
                    Danh sách đặt chỗ
                  </Link>
                </li>
              </ul>
            </li>

            {/* Vouchers */}
            <li
              className={`nav-item dropdown-container ${openDropdown === "vouchers" ? "open" : ""} ${
                !isOpen && hoveredDropdown === "vouchers" ? "active-hover" : ""
              }`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleMouseEnterDropdown("vouchers", rect.top);
              }}
              onMouseLeave={handleMouseLeaveDropdown}
            >
              <a
                className={`nav-link custom-dropdown-toggle ${activeMenu === "vouchers" ? "active" : ""}`}
                onClick={() => {
                  toggleDropdown("vouchers");
                }}
              >
                <span className="material-symbols-rounded">local_offer</span>
                <span className="nav-label">Khuyến mãi</span>
                <span className="dropdown-icon material-symbols-rounded">
                  keyboard_arrow_down
                </span>
              </a>

              <ul
                ref={vouchersRef}
                className="dropdown"
                onMouseEnter={() => handleMouseEnterDropdown("vouchers")}
                onMouseLeave={handleMouseLeaveDropdown}
                style={!isOpen ? {
                  position: "fixed",
                  left: "85px",
                  top: `${activeHoveredTop - 12}px`,
                } : {
                  height:
                    openDropdown === "vouchers"
                      ? `${vouchersRef.current?.scrollHeight || 0}px`
                      : 0,
                  overflow: "hidden",
                  transition: "height 0.3s ease",
                }}
              >
                <li className="nav-item">
                  <Link className="nav-link dropdown-title">Khuyến mãi</Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/admin/vouchers"
                    className="nav-link dropdown-link"
                    onClick={() => {
                      setActiveMenu("vouchers");
                    }}
                  >
                    Danh sách khuyến mãi
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/admin/add-voucher"
                    className="nav-link dropdown-link"
                    onClick={() => {
                      setActiveMenu("vouchers");
                    }}
                  >
                    Thêm khuyến mãi
                  </Link>
                </li>
              </ul>
            </li>

            {/* Phân quyền */}
            {isAdmin && (
              <li
                className={`nav-item dropdown-container ${openDropdown === "permissions" ? "open" : ""} ${
                  !isOpen && hoveredDropdown === "permissions" ? "active-hover" : ""
                }`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleMouseEnterDropdown("permissions", rect.top);
                }}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <Link
                  to="#"
                  className={`nav-link custom-dropdown-toggle ${activeMenu === "permissions" ? "active" : ""}`}
                  onClick={() => {
                    toggleDropdown("permissions");
                  }}
                >
                  <span className="material-symbols-rounded">verified_user</span>
                  <span className="nav-label">Vai trò & Phân quyền</span>
                  <span className="dropdown-icon material-symbols-rounded">
                    keyboard_arrow_down
                  </span>
                </Link>

                <ul
                  ref={permissionsRef}
                  className="dropdown"
                  onMouseEnter={() => handleMouseEnterDropdown("permissions")}
                  onMouseLeave={handleMouseLeaveDropdown}
                  style={!isOpen ? {
                    position: "fixed",
                    left: "85px",
                    top: `${activeHoveredTop - 12}px`,
                  } : {
                    height:
                      openDropdown === "permissions"
                        ? `${permissionsRef.current?.scrollHeight || 0}px`
                        : 0,
                    overflow: "hidden",
                    transition: "height 0.3s ease",
                  }}
                >
                  <li className="nav-item">
                    <Link className="nav-link dropdown-title">
                      Vai trò & Phân quyền
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="#"
                      className="nav-link dropdown-link"
                      onClick={() => {
                        setActiveMenu("permissions");
                      }}
                    >
                      Thêm quyền
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="#"
                      className="nav-link dropdown-link"
                      onClick={() => {
                        setActiveMenu("permissions");
                      }}
                    >
                      Danh sách quyền
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/admin/roles/assignment"
                      className="nav-link dropdown-link"
                      onClick={() => {
                        setActiveMenu("permissions");
                      }}
                    >
                      Phân quyền chức năng
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          <ul className="nav-list secondary-nav">
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">help</span>
                <span className="nav-label">Hỗ trợ</span>
              </a>
            </li>
            <li className="nav-item">
              <button
                onClick={() => {
                  setConfirmModal({
                    title: "Xác nhận đăng xuất",
                    message: "Bạn chắc chắn muốn thoát khỏi hệ thống?",
                    isOpen: true,
                    onConfirm: handleLogout,
                  });
                }}
                className="nav-link w-full text-left bg-transparent border-none outline-none cursor-pointer"
              >
                <span className="material-symbols-rounded">logout</span>
                <span className="nav-label">Đăng xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
