import { useMemo } from "react";
import ROUTES from "../../routes/routeList";
import { useHasPermission } from "./useHasPermission";
import { useAppSelector } from "../../app/hooks";

export const useDashboardNavigation = () => {
  const hasPermission = useHasPermission();
  const user = useAppSelector((state) => state.auth.user);
  const loginStatus = useAppSelector((state) => state.auth.loginStatus);

  const dashboardRoute = ROUTES.find((route) => route.key === "dashboard");
  const dashboardChildren = dashboardRoute?.children ?? [];

  const hasPermissionPayload = Array.isArray(user?.permissionGroups);
  const isAccessReady = Boolean(user) && hasPermissionPayload;
  const isAccessLoading = loginStatus === "loading" && !isAccessReady;

  const menuItems = useMemo(() => {
    const candidates = dashboardChildren
      .filter((child) => child?.navigation && child.isMenuItem !== false)
      .map((child) => ({
        id: child.navigation.id || child.key,
        label: child.navigation.label || child.key,
        icon: child.navigation.icon,
        href: child.path ? `/dashbord/${child.path}` : "/dashbord",
        requiredPermissions: child.requiredPermissions,
      }));

    if (!isAccessReady) {
      return candidates;
    }

    return candidates.filter((item) => {
      if (!item.requiredPermissions) {
        return true;
      }
      
      return hasPermission(item.requiredPermissions);
    });
  }, [dashboardChildren, hasPermission, isAccessReady]);

  return {
    menuItems,
    isAccessReady,
    isAccessLoading,
  };
};
