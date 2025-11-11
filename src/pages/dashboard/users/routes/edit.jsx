import { useCallback, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { EditUserForm } from "../components/forms/EditUserForm";

export function DashboardUsersEdit() {
  const navigate = useNavigate();
  const params = useParams();
  const context = useOutletContext();
  const targetUserId = params?.id;

  const handleClose = useCallback(() => {
    navigate("..", { replace: true });
  }, [navigate]);

  const {
    roles = [],
    canEditUsers = false,
    onEditUser,
    getUserById,
    usersStatus = "idle",
  } = context || {};

  const targetUser =
    targetUserId && typeof getUserById === "function" ? getUserById(targetUserId) : null;

  const isUsersLoading = usersStatus === "loading" || usersStatus === "idle";

  useEffect(() => {
    if (!context) {
      handleClose();
    }
  }, [context, handleClose]);

  useEffect(() => {
    if (!isUsersLoading && !canEditUsers) {
      handleClose();
    }
  }, [canEditUsers, isUsersLoading, handleClose]);

  useEffect(() => {
    if (!targetUserId || isUsersLoading) {
      return;
    }
    if (!targetUser) {
      handleClose();
    }
  }, [targetUserId, targetUser, isUsersLoading, handleClose]);

  if (!canEditUsers || !targetUser) {
    return null;
  }

  return (
    <EditUserForm
      open={Boolean(canEditUsers)}
      onClose={handleClose}
      roles={roles}
      user={targetUser}
      onSubmit={onEditUser}
    />
  );
}
