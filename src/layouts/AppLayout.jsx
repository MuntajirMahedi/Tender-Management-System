import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => setSidebarOpen(false);

  // Lock body scroll in mobile when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay active" onClick={closeSidebar}></div>
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
