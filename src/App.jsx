import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardShell } from "./pages/DashboardShell";
import { DashboardOverview } from "./pages/DashboardOverview";
import { DashboardUsers } from "./pages/DashboardUsers";
import { DashboardRoles } from "./pages/DashboardRoles";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashbord" element={<DashboardShell />}>
          <Route index element={<DashboardOverview />} />
          <Route path="users" element={<DashboardUsers />} />
          <Route path="roles" element={<DashboardRoles />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
