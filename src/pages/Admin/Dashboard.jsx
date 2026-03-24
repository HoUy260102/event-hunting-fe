import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layouts/AdminLayout/Sidebar";
import { useState, useEffect } from "react";
import Header from "../../components/layouts/AdminLayout/Header";
import { HeaderProvider } from "../../contexts/HeaderContext";
function Dashboard() {
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const sidebarWidth = isOpen ? "270px" : "85px";
  return (
    <>
      <HeaderProvider>
        <div className="flex min-h-screen bg-background-light overflow-x-hidden">
          <Sidebar isOpen={isOpen} handleIsOpen={() => setIsOpen(!isOpen)} />
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
