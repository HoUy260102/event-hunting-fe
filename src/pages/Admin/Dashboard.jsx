import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layouts/AdminLayout/Sidebar";
import { useState, useEffect } from "react";
import Header from "../../components/layouts/AdminLayout/Header";
import { HeaderProvider } from "../../contexts/HeaderContext";
function Dashboard() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Only override user preference when crossing the 1024px boundary
      if (prevWidth >= 1024 && currentWidth < 1024) {
        setIsOpen(false);
      } else if (prevWidth < 1024 && currentWidth >= 1024) {
        setIsOpen(true);
      }
      prevWidth = currentWidth;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isOpen ? "270px" : "85px";
  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <>
      <HeaderProvider>
        <div className="flex min-h-screen bg-background-light overflow-x-hidden admin-layout-container">
          <Sidebar isOpen={isOpen} handleIsOpen={toggleSidebar} />
          <div
            style={{
              flex: 1,
              paddingLeft: sidebarWidth,
              transition: "padding 0.3s ease-in-out",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <Header />
            <main className="p-6 flex-1">
              <Outlet />
            </main>
          </div>
        </div>
      </HeaderProvider>
    </>
  );
}
export default Dashboard;
