import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export function SessionRedirect() {
  const user = useAppSelector((state) => state.auth.user);

  return <Navigate to={user ? "/dashbord" : "/login"} replace />;
}
