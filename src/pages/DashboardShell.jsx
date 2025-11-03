import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import { useEffect } from "react";
import { DashboardLayout } from "../core/ui/layouts/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout, setActivePage } from "../features/auth/authSlice";

import { useDashboardNavigation } from "../core/hooks/useDashboardNavigation";
import { Spinner } from "../core/ui/Spinner";

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
  const { menuItems } = useDashboardNavigation();

  const currentPage = getActiveItemId(location.pathname);

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

  return (
    <DashboardLayout
      title="Dashboard"
      menuItems={menuItems}
      activeItemId={activePage}
      onNavigate={(item) => navigate(item.href)}
      onLogout={() => {
        dispatch(logout());
        navigate("/", { replace: true });
      }}
      user={user}
    >
      <Suspense fallback={<Spinner fullPage message="İçerik yükleniyor..." />}>
        <Outlet />
      </Suspense>
    </DashboardLayout>
  );
}
