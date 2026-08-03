import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "../components/admin/AppSidebar";
import AppTopbar from "../components/admin/AppTopbar";

function AdminLayout() {
  // Open by default on desktop, where the sidebar is in flow; below lg it
  // renders as an overlay drawer and the same flag drives the transform.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* min-w-0 so wide tables scroll inside the column instead of pushing it. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar onToggleSidebar={() => setIsSidebarOpen((value) => !value)} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
