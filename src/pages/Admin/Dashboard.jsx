import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layouts/Sidebar";
import { useState } from "react";
function Dashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const sidebarWidth = isOpen ? "270px" : "85px";
  return (
    <>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <Sidebar isOpen={isOpen} handleIsOpen={() => setIsOpen(!isOpen)} />
        <main
          style={{
            flex: 1,
            marginLeft: sidebarWidth,
            transition: "margin 0.3s ease",
            padding: "32px",
            width: `calc(100% - ${sidebarWidth})`,
          }}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}
export default Dashboard;
