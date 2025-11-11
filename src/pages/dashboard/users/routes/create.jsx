import { useNavigate, useOutletContext } from "react-router-dom";
import { AddUserForm } from "../components/forms/AddUserForm";

export function DashboardUsersCreate() {
  const navigate = useNavigate();
  const context = useOutletContext();

  const handleClose = () => {
    navigate("..", { replace: true });
  };

  if (!context) {
    handleClose();
    return null;
  }

  const { roles = [], canCreateUsers, onCreateUser } = context;

  return (
    <AddUserForm
      open={Boolean(canCreateUsers)}
      onClose={handleClose}
      roles={roles}
      onSubmit={onCreateUser}
    />
  );
}
