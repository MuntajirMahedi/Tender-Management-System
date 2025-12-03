import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  return (
    <div className="app-shell">

      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={closeSidebar}></div>
      )}

      <div className="main-content">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="content-wrapper">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AppLayout;
