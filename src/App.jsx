import { Suspense } from "react";
import { Spinner } from "./core/ui/Spinner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ROUTES from "./routes/routeList";
import { RequireAuth } from "./routes/RequireAuth";

const renderRoutes = (routes) =>
  routes.map(
    ({
      key,
      path,
      element,
      children,
      requiresAuth,
      requiredPermissions,
      index,
    }) => {
      let routeElement = element;

      if (requiresAuth || requiredPermissions) {
        routeElement = (
          <RequireAuth requiredPermissions={requiredPermissions}>
            {routeElement}
          </RequireAuth>
        );
      }

      const nestedRoutes = children?.length ? renderRoutes(children) : null;

      if (index) {
        return (
          <Route key={key} index element={routeElement}>
            {nestedRoutes}
          </Route>
        );
      }

      return (
        <Route key={key} path={path} element={routeElement}>
          {nestedRoutes}
        </Route>
      );
    }
  );

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner fullPage message="Loading..." />}>
        <Routes>{renderRoutes(ROUTES)}</Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
