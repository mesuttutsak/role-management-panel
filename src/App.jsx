import { useEffect, cloneElement, isValidElement, Suspense } from "react";
import { Spinner } from "./core/ui/Spinner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { fetchPermissions, selectPermissionsStatus } from "./features/permissions/permissionsSlice";
import { fetchPermissionGroups, selectPermissionGroupsStatus } from "./features/permissionGroups/permissionGroupsSlice";
import { fetchRoles, selectRolesStatus } from "./features/roles/rolesSlice";
import ROUTES from "./routes/routeList";
import { RequireAuth } from "./routes/RequireAuth";

export function App() {
  const dispatch = useAppDispatch();
  const permissionsStatus = useAppSelector(selectPermissionsStatus);
  const permissionGroupsStatus = useAppSelector(selectPermissionGroupsStatus);
  const rolesStatus = useAppSelector(selectRolesStatus);

  useEffect(() => {
    if (permissionsStatus === "idle") {
      dispatch(fetchPermissions());
    }
    if (permissionGroupsStatus === "idle") {
      dispatch(fetchPermissionGroups());
    }
    if (rolesStatus === "idle") {
      dispatch(fetchRoles());
    }
  }, [dispatch, permissionsStatus, permissionGroupsStatus, rolesStatus]);

  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner fullPage message="Yükleniyor..." />}>
        <Routes>
        {ROUTES.map(({ key, path, element, children, requiresAuth, requiredPermissions }) => {
          let routeElement = element;

          if (requiresAuth || requiredPermissions) {
            routeElement = (
              <RequireAuth requiredPermissions={requiredPermissions}>
                {routeElement}
              </RequireAuth>
            );
          }

          return (
            <Route key={key} path={path} element={routeElement}>
              {children?.map((child) => {
                const childElement = child.requiredPermissions ? (
                  <RequireAuth requiredPermissions={child.requiredPermissions}>
                    {child.element}
                  </RequireAuth>
                ) : (
                  child.element
                );

                if (child.index) {
                  return <Route key={child.key} index element={childElement} />;
                }

                return (
                  <Route
                    key={child.key}
                    path={child.path}
                    element={childElement}
                  />
                );
              })}
            </Route>
          );
        })}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
