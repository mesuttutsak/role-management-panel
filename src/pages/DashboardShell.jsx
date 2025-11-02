import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { DashboardLayout } from "../core/ui/layouts/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout, setActivePage } from "../features/auth/authSlice";

const menuItems = [
  { id: "overview", label: "Overview", icon: "FiHome", href: "/dashbord" },
  { id: "users", label: "Users", icon: "FiUsers", href: "/dashbord/users" },
  { id: "roles", label: "Roles", icon: "FiShield", href: "/dashbord/roles" },
];

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
  const dispatch = useAppDispatch();
  const { user, activePage } = useAppSelector((state) => state.auth);

  const currentPage = useMemo(
    () => getActiveItemId(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (currentPage !== activePage) {
      dispatch(setActivePage(currentPage));
    }
  }, [dispatch, currentPage, activePage]);

  const handleNavigate = (item) => {
    if (item?.href) {
      dispatch(setActivePage(item.id));
      navigate(item.href);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  }

  return (
    <DashboardLayout
      title="Dashboard"
      menuItems={menuItems}
      activeItemId={activePage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      user={user}
    >
      <Outlet />
    </DashboardLayout>
  );
}
