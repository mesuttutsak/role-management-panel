import { useMemo, useCallback } from "react";
import { Surface } from "../../../core/ui/Surface";
import { Icon } from "../../../core/ui/Icon";
import { PaginatedTable } from "../../../core/ui/PaginatedTable";
import { useUsersTable } from "./hooks/useUsersTable";
import { useHasPermission } from "../../../core/hooks/useHasPermission";
import { DashboardUnauthorized } from "../../shared/DashboardUnauthorized/DashboardUnauthorized";
import { Spinner } from "../../../core/ui/Spinner";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { createUser, updateUser } from "../../../features/users/usersSlice";
import { Outlet, useNavigate } from "react-router-dom";
import styles from "./UsersPage.module.css";

import { Button } from "../../../core/ui/Button";

const normalizeText = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const hasDuplicateFullName = (records, firstname, lastname, excludeId) => {
  const normalizedFirst = normalizeText(firstname);
  const normalizedLast = normalizeText(lastname);

  if (!normalizedFirst || !normalizedLast) {
    return false;
  }

  return records.some((record) => {
    if (excludeId && record.id === excludeId) {
      return false;
    }
    return (
      normalizeText(record.firstname) === normalizedFirst &&
      normalizeText(record.lastname) === normalizedLast
    );
  });
};

const buildRoleFilterOptions = (roles = []) => [
  { value: "", label: "All" },
  ...roles.map((role) => ({
    value: role.id,
    label: role.name || "—",
  })),
];

const tableColumns = (
  onDelete,
  deletingId,
  roles = [],
  currentUserId,
  canDeleteUsers,
  onEdit,
  canEditUsers
) => [
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
        const deleteDisabled = user.systemUser || deletingId === user.id || isSelf || !canDeleteUsers;
        const editDisabled = !canEditUsers;
        return (
          <div className={styles.actionButtons}>
            <Button
              type="Button"
              className={styles.editButton}
              onClick={() => onEdit(user)}
              disabled={editDisabled}
              aria-label={
                editDisabled
                  ? "You do not have permission to update users"
                  : `Edit ${user.username}`
              }
            >
              <Icon icon="FiEdit" className={styles.editIcon} />
            </Button>
            <Button
              type="Button"
              className={styles.deleteButton}
              onClick={() => onDelete(user)}
              disabled={deleteDisabled}
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
            </Button>
          </div>
        );
      },
    },
  ];

export function DashboardUsers() {
  const hasPermission = useHasPermission();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const loginStatus = useAppSelector((state) => state.auth.loginStatus);
  const permissionsReady = Boolean(user && Array.isArray(user.permissionGroups));
  const isAccessLoading = loginStatus === "loading" && !permissionsReady;
  const canReadUsers = permissionsReady && hasPermission({ group: "USERS", permissions: "read" });
  const canDeleteUsers = permissionsReady && hasPermission({ group: "USERS", permissions: "delete" });
  const canCreateUsers = permissionsReady && hasPermission({ group: "USERS", permissions: "write" });
  const canEditUsers = permissionsReady && hasPermission({ group: "USERS", permissions: "write" });
  const navigateToCreate = useCallback(() => {
    if (!canCreateUsers) {
      return;
    }
    navigate("/dashbord/users/create");
  }, [canCreateUsers, navigate]);

  const navigateToEdit = useCallback(
    (userId) => {
      if (!canEditUsers || !userId) {
        return;
      }
      navigate(`/dashbord/users/edit/${userId}`);
    },
    [canEditUsers, navigate]
  );

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
    refreshUsers,
  } = useUsersTable({ enabled: canReadUsers, canDelete: canDeleteUsers });

  const getUserById = useCallback(
    (id) => decoratedData.find((user) => user.id === id),
    [decoratedData]
  );

  const handleEdit = useCallback(
    (user) => {
      if (!user) {
        return;
      }
      navigateToEdit(user.id);
    },
    [navigateToEdit]
  );

  const columns = useMemo(
    () =>
      tableColumns(
        handleDelete,
        deletingId,
        roles,
        currentUserId,
        canDeleteUsers,
        handleEdit,
        canEditUsers
      ),
    [handleDelete, deletingId, roles, currentUserId, canDeleteUsers, handleEdit, canEditUsers]
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

      const duplicateFullName = hasDuplicateFullName(
        decoratedData,
        payload.firstname,
        payload.lastname
      );

      if (duplicateFullName) {
        throw new Error("This full name is already in use.");
      }

      await dispatch(createUser(payload)).unwrap();
      refreshUsers();
    },
    [dispatch, refreshUsers, decoratedData]
  );

  const handleUpdateUser = useCallback(
    async (payload) => {
      const duplicateFullName = hasDuplicateFullName(
        decoratedData,
        payload.firstname,
        payload.lastname,
        payload.id
      );

      if (duplicateFullName) {
        throw new Error("This full name is already in use.");
      }

      await dispatch(updateUser(payload)).unwrap();
      refreshUsers();
    },
    [dispatch, refreshUsers, decoratedData]
  );

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
            type="Button"
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

      <Outlet
        context={{
          roles,
          canCreateUsers,
          canEditUsers,
          onCreateUser: handleCreateUser,
          onEditUser: handleUpdateUser,
          getUserById,
          usersStatus: status,
        }}
      />
    </div>
  );
}
