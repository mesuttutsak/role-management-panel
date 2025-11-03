import { useMemo } from "react";
import ROUTES from "../../routes/routeList";
import { useHasPermission } from "./useHasPermission";
import { useAppSelector } from "../../app/hooks";
import { selectPermissionsStatus } from "../../features/permissions/permissionsSlice";
import { selectPermissionGroupsStatus } from "../../features/permissionGroups/permissionGroupsSlice";
import { selectRolesStatus } from "../../features/roles/rolesSlice";

export const useDashboardNavigation = () => {
  const hasPermission = useHasPermission();
  const permissionsStatus = useAppSelector(selectPermissionsStatus);
  const permissionGroupsStatus = useAppSelector(selectPermissionGroupsStatus);
  const rolesStatus = useAppSelector(selectRolesStatus);

  const dashboardRoute = ROUTES.find((route) => route.key === "dashboard");
  const dashboardChildren = dashboardRoute?.children ?? [];

  const isAccessReady = permissionsStatus === "succeeded" && permissionGroupsStatus === "succeeded" && rolesStatus === "succeeded";
  const isAccessLoading = permissionsStatus === "loading" && permissionGroupsStatus === "loading" && rolesStatus === "loading";

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
    isAccessLoading
  };
};
