import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
