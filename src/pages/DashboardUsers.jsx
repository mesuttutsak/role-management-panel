import { useMemo, useCallback } from "react";
import { Surface } from "../core/ui/Surface";
import { Icon } from "../core/ui/Icon";
import { PaginatedTable } from "./components/PaginatedTable";
import { useDashboardUsersTable } from "./hooks/useDashboardUsersTable";
import { useHasPermission } from "../core/hooks/useHasPermission";
import { DashboardUnauthorized } from "./DashboardUnauthorized";
import { Spinner } from "../core/ui/Spinner";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { createUser, fetchUsers, fetchUsersTotalCount } from "../features/users/usersSlice";
import { useMatch, useNavigate } from "react-router-dom";
import styles from "./DashboardUsers.module.css";

import { Button } from "../core/ui/Button";
import { AddUserDialog } from "./components/AddUserDialog";

const buildRoleFilterOptions = (roles = []) => [
  { value: "", label: "All" },
  ...roles.map((role) => ({
    value: role.id,
    label: role.name || "—",
  })),
];

const tableColumns = (onDelete, deletingId, roles = [], currentUserId, canDeleteUsers) => [
  {
    header: "Firstname",
    accessorKey: "firstname",
    filter: {
      type: "string",
      placeholder: "Search first name...",
      filterKey: "firstname",
    },
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-slate-900">
        {row.original.firstname}
      </span>
    ),
  },
  {
    header: "Lastname",
    accessorKey: "lastname",
    filter: {
      type: "string",
      placeholder: "Search last name...",
      filterKey: "lastname",
    },
    cell: ({ row }) => (
      <span className="text-sm text-slate-700">{row.original.lastname}</span>
    ),
  },
  {
    header: "Username",
    accessorKey: "username",
    filter: {
      type: "string",
      placeholder: "Search username...",
      filterKey: "username",
    },
    cell: ({ row }) => (
      <span className="text-sm text-slate-700">{row.original.username}</span>
    ),
  },
  {
    header: "Role",
    accessorKey: "roleName",
    filter: {
      type: "select",
      filterKey: "roleId",
      options: buildRoleFilterOptions(roles),
    },
    cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.roleName}</span>,
  },
  {
    header: "Actions",
    id: "actions",
    size: 50,
    cell: ({ row }) => {
      const user = row.original;
      const isSelf = currentUserId && user.id === currentUserId;
      const disabled = user.systemUser || deletingId === user.id || isSelf || !canDeleteUsers;
      return (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => onDelete(user)}
          disabled={disabled}
          aria-label={
            deletingId === user.id
              ? "Deleting user"
              : isSelf
                ? "You cannot delete your own account"
                : !canDeleteUsers
                  ? "You do not have permission to delete users"
                  : `Delete ${user.username}`
          }
        >
          {deletingId === user.id ? (
            <span className={styles.deleteSpinner}>...</span>
          ) : (
            <Icon icon="FiTrash2" className={styles.deleteIcon} />
          )}
        </button>
      );
    },
  },
];

export function DashboardUsers() {
  const hasPermission = useHasPermission();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const createMatch = useMatch("/dashbord/users/create");
  const isCreateRoute = Boolean(createMatch);
  const user = useAppSelector((state) => state.auth.user);
  const loginStatus = useAppSelector((state) => state.auth.loginStatus);
  const permissionsReady = Boolean(user && Array.isArray(user.permissionGroups));
  const isAccessLoading = loginStatus === "loading" && !permissionsReady;
  const canReadUsers = permissionsReady && hasPermission({ group: "USERS", permissions: "read" });
  const canDeleteUsers = permissionsReady && hasPermission({ group: "USERS", permissions: "delete" });
  const canCreateUsers = permissionsReady && hasPermission({ group: "USERS", permissions: "write" });
  const navigateToCreate = useCallback(() => {
    if (!canCreateUsers) {
      return;
    }
    navigate("/dashbord/users/create");
  }, [canCreateUsers, navigate]);

  const {
    decoratedData,
    status,
    page,
    pageSize,
    totalCount,
    totalLoading,
    hasMore,
    filters,
    roles,
    currentUserId,
    deletingId,
    handleDelete,
    handlePrev,
    handleNext,
    handleDirectPageChange,
    handlePageSizeChange,
    handleFilterChange,
  } = useDashboardUsersTable({ enabled: canReadUsers, canDelete: canDeleteUsers });

  const columns = useMemo(
    () => tableColumns(handleDelete, deletingId, roles, currentUserId, canDeleteUsers),
    [handleDelete, deletingId, roles, currentUserId, canDeleteUsers]
  );

  const handleCreateUser = useCallback(
    async (payload) => {
      const normalizedUsername = (payload?.username || "").trim().toLowerCase();
      const duplicateExists = decoratedData.some(
        (user) => (user.username || "").trim().toLowerCase() === normalizedUsername
      );

      if (duplicateExists) {
        throw new Error("This username is already in use.");
      }

      await dispatch(createUser(payload)).unwrap();
      await Promise.all([
        dispatch(fetchUsers({ page, pageSize, filters })),
        dispatch(fetchUsersTotalCount({ filters })),
      ]);
    },
    [dispatch, page, pageSize, filters, decoratedData]
  );

  const handleCloseCreate = useCallback(() => {
    navigate("/dashbord/users", { replace: true });
  }, [navigate]);

  if (isAccessLoading) {
    return <Spinner fullPage message="Checking permissions..." />;
  }

  return (
    <div className={styles.container}>
      <Surface fullWidth className={styles.headerBar}>
        <span>
          <strong>USERS</strong>
        </span>
        <span>
          <Button
            type="button"
            onClick={navigateToCreate}
            disabled={!canCreateUsers}
            title={!canCreateUsers ? "You do not have permission to add users" : undefined}
          >
            Add New User
          </Button>
        </span>
      </Surface>

      {canReadUsers ? (
        <PaginatedTable
          columns={columns}
          data={decoratedData}
          filters={filters}
          onFilterChange={handleFilterChange}
          status={status}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalLoading={totalLoading}
          hasMore={hasMore}
          onPrev={handlePrev}
          onNext={handleNext}
          onPageSizeChange={handlePageSizeChange}
          onDirectPageChange={handleDirectPageChange}
        />
      ) : (
        <DashboardUnauthorized message="You do not have permission to view users." />
      )}

      <AddUserDialog
        open={isCreateRoute && canCreateUsers}
        onClose={handleCloseCreate}
        roles={roles}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}
