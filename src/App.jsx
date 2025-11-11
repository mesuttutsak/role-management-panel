import { Suspense } from "react";
import { Spinner } from "./core/ui/Spinner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ROUTES from "./routes/routeList";
import { RequireAuth } from "./routes/RequireAuth";

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner fullPage message="Loading..." />}>
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
