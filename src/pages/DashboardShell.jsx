import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { FiHome, FiUsers, FiShield } from "react-icons/fi";
import { DashboardLayout } from "../core/ui/layouts/DashboardLayout";

const menuItems = [
  { id: "overview", label: "Overview", icon: FiHome, href: "/dashbord" },
  { id: "users", label: "Users", icon: FiUsers, href: "/dashbord/users" },
  { id: "roles", label: "Roles", icon: FiShield, href: "/dashbord/roles" },
];

const userInfo = {
  firstName: "Admin",
  lastName: "User",
  role: "Doktor",
};

function getActiveItemId(pathname) {
  if (pathname === "/dashbord" || pathname === "/dashbord/") {
    return "overview";
  }
  if (pathname.startsWith("/dashbord/users")) {
    return "users";
  }
  if (pathname.startsWith("/dashbord/roles")) {
    return "roles";
  }
  return "overview";
}

export function DashboardShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeItemId = useMemo(
    () => getActiveItemId(location.pathname),
    [location.pathname]
  );

  const handleNavigate = (item) => {
    if (item?.href) {
      navigate(item.href);
    }
  };

  const handleLogout = () => {
    navigate("/", { replace: true });
  };

  return (
    <DashboardLayout
      title="Dashboard"
      menuItems={menuItems}
      activeItemId={activeItemId}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      user={userInfo}
    >
      <Outlet />
    </DashboardLayout>
  );
}
