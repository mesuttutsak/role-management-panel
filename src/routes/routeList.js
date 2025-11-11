import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { SessionRedirect } from "./SessionRedirect";

const LoginPage = lazy(() => import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardShell = lazy(() =>
  import("../pages/DashboardShell").then((m) => ({ default: m.DashboardShell }))
);
const DashboardOverview = lazy(() =>
  import("../pages/DashboardOverview").then((m) => ({
    default: m.DashboardOverview,
  }))
);
const DashboardUsers = lazy(() =>
  import("../pages/DashboardUsers").then((m) => ({ default: m.DashboardUsers }))
);
const DashboardRoles = lazy(() =>
  import("../pages/DashboardRoles").then((m) => ({ default: m.DashboardRoles }))
);

const ROUTES = [
  {
    key: "root-redirect",
    path: "/",
    element: <SessionRedirect />,
  },
  {
    key: "login",
    path: "/login",
    element: <LoginPage />,
  },
  {
    key: "dashboard",
    path: "/dashbord",
    element: <DashboardShell />,
    requiresAuth: true,
    navigation: { id: "overview", label: "Overview", icon: "FiHome" },
    children: [
      {
        key: "dashboard-overview",
        index: true,
        element: <DashboardOverview />,
        navigation: { id: "overview", label: "Overview", icon: "FiHome" },
        isMenuItem: true,
      },
      {
        key: "dashboard-users",
        path: "users/*",
        element: <DashboardUsers />,
        requiredPermissions: { group: "USERS", permissions: "navigate" },
        navigation: { id: "users", label: "Users", icon: "FiUser" },
        isMenuItem: true,
      },
      {
        key: "dashboard-roles",
        path: "roles",
        element: <DashboardRoles />,
        requiredPermissions: { group: "ROLES", permissions: "navigate" },
        navigation: { id: "roles", label: "Roles", icon: "FiShield" },
        isMenuItem: true,
      },
    ],
  },
  {
    key: "fallback",
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default ROUTES;
