import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css"
function Sidebar({isOpen, handleIsOpen}) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [openDropdown, setOpenDropdown] = useState(null);
  const usersRef = useRef(null);
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

  return (
    <>
      <aside className={`sidebar ${!isOpen ? "collapsed" : ""}`}>
        <header className="sidebar-header">
          <a href="#" className="header-logo">
            <img src="logo.png" alt="CodingNepal" />
          </a>
          <button className="sidebar-toggler" onClick={toggleSidebar}>
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
        </header>

        <nav className="sidebar-nav">
          <ul className="nav-list primary-nav">
            <li className="nav-item">
              <Link to="/admin" className={`nav-link ${activeMenu === "dashboard" ? "active" : ""}`} onClick={() => {
                setActiveMenu("dashboard");
              }}>
                <span className="material-symbols-rounded">dashboard</span>
                <span className="nav-label">Dashboard</span>
              </Link>
            </li>

            {/* Quản lý tài khoản */}
            <li
              className={`nav-item dropdown-container ${
                openDropdown === "users" ? "open" : ""
              }`}
            >
              <Link
                to="#"
                className={`nav-link custom-dropdown-toggle ${activeMenu === "users" ? "active" : ""}`}
                onClick={() => {
                  toggleDropdown("users");
                }}
              >
                <span className="material-symbols-rounded">manage_accounts</span>
                <span className="nav-label">Quản lý tài khoản</span>
                <span className="dropdown-icon material-symbols-rounded">
                  keyboard_arrow_down
                </span>
              </Link>

              <ul
                ref={usersRef}
                className="dropdown"
                style={{
                  height:
                    openDropdown === "users"
                      ? `${usersRef.current?.scrollHeight}px`
                      : 0,
                  overflow: "hidden",
                  transition: "height 0.3s ease",
                }}
              >
                <li className="nav-item">
                  <Link className="nav-link dropdown-title">Quản lý tài khoản</Link>
                </li>
                <li className="nav-item">
                  <Link to="/admin/users" className="nav-link dropdown-link" onClick={() => {
                    setActiveMenu("users");
                  }}>
                    Danh sách tài khoản
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/admin/add-user" className="nav-link dropdown-link" onClick={() => {
                    setActiveMenu("users");
                  }}>
                    Thêm tài khoản
                  </Link>
                </li>
              </ul>
            </li>

            {/* Events */}
            <li
              className={`nav-item dropdown-container ${
                openDropdown === "events" ? "open" : ""
              }`}
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
                style={{
                  height:
                    openDropdown === "events"
                      ? `${eventsRef.current?.scrollHeight}px`
                      : 0,
                  overflow: "hidden",
                  transition: "height 0.3s ease",
                }}
              >
                <li className="nav-item">
                  <Link className="nav-link dropdown-title">Sự kiện</Link>
                </li>
                <li className="nav-item">
                  <Link to="/admin/events" className="nav-link dropdown-link" onClick={() => {
                    setActiveMenu("events");
                  }}>
                    Sự kiện của tôi
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/admin/add-event" className="nav-link dropdown-link" onClick={() => {
                    setActiveMenu("events");
                  }}>
                    Thêm sự kiện
                  </Link>
                </li>
              </ul>
            </li>

            {/* Thể loại */}
            <li 
              className={`nav-item dropdown-container ${
                openDropdown === "categories" ? "open" : ""
              }`}
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
                style={{
                  height:
                    openDropdown === "categories"
                      ? `${categoriesRef.current?.scrollHeight}px`
                      : 0,
                  overflow: "hidden",
                  transition: "height 0.3s ease",
                }}
              >
                <li className="nav-item">
                  <Link className="nav-link dropdown-title">Chủ đề</Link>
                </li>
                <li className="nav-item">
                  <Link to="/admin/categories" className="nav-link dropdown-link" onClick={() => {
                    setActiveMenu("categories");
                  }}>
                    Danh sách chủ đề
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/admin/add-category" className="nav-link dropdown-link" onClick={() => {
                    setActiveMenu("categories");
                  }}>
                    Thêm chủ đề mới
                  </Link>
                </li>
              </ul>
            </li>
            {/* Phân quyền */}
            <li
              className={`nav-item dropdown-container ${
                openDropdown === "permissions" ? "open" : ""
              }`}
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
                style={{
                  height:
                    openDropdown === "permissions"
                      ? `${permissionsRef.current?.scrollHeight}px`
                      : 0,
                  overflow: "hidden",
                  transition: "height 0.3s ease",
                }}
              >
                <li className="nav-item">
                  <Link className="nav-link dropdown-title">Vai trò & Phân quyền</Link>
                </li>
                <li className="nav-item">
                  <Link to="#" className="nav-link dropdown-link" onClick={() => {
                    setActiveMenu("permissions");
                  }}>
                    Thêm quyền
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="#" className="nav-link dropdown-link" onClick={() => {
                    setActiveMenu("permissions");
                  }}>
                    Danh sách quyền
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/admin/roles/assignment" className="nav-link dropdown-link" onClick={() => {
                    setActiveMenu("permissions");
                  }}>
                    Phân quyền chức năng
                  </Link>
                </li>
              </ul>
            </li>
          </ul>

          <ul className="nav-list secondary-nav">
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">help</span>
                <span className="nav-label">Support</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <span className="material-symbols-rounded">logout</span>
                <span className="nav-label">Sign Out</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
