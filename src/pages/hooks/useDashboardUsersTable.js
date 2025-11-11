import { useEffect, useMemo, useState, useCallback } from "react";
import APP_CONFIG from "../../config";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchUsers,
  fetchUsersTotalCount,
  selectUsersState,
  setPage,
  setPageSize,
  setSearchFilters,
} from "../../features/users/usersSlice";
import {
  selectRolesById,
  selectRoles,
  fetchRolesByIds,
  fetchRoles,
} from "../../features/roles/rolesSlice";

const { API_BASE_URL } = APP_CONFIG;

export function useDashboardUsersTable({ enabled = true, canDelete = true } = {}) {
  const dispatch = useAppDispatch();
  const {
    records: data,
    status,
    page,
    pageSize,
    totalCount,
    hasMore,
    totalStatus,
    filters,
  } = useAppSelector(selectUsersState);
  const rolesById = useAppSelector(selectRolesById);
  const roles = useAppSelector(selectRoles);
  const currentUser = useAppSelector((state) => state.auth?.user);
  const currentUserId = currentUser?.id ?? null;

  const [deletingId, setDeletingId] = useState(null);

  const decoratedData = useMemo(
    () =>
      data.map((record) => ({
        ...record,
        roleName: rolesById[record.roleId]?.name || "Role not found",
      })),
    [data, rolesById]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (!roles.length) {
      dispatch(fetchRoles());
    }
  }, [dispatch, roles.length, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    dispatch(fetchUsers({ page, pageSize, filters }));
    dispatch(fetchUsersTotalCount({ filters }));
  }, [dispatch, page, pageSize, filters, enabled]);

  useEffect(() => {
    if (!enabled || !data.length) {
      return;
    }
    const missingRoleIds = Array.from(
      new Set(
        data
          .map((record) => record.roleId)
          .filter(
            (roleId) =>
              typeof roleId === "string" && roleId && !rolesById[roleId]
          )
      )
    );

    if (missingRoleIds.length > 0) {
      dispatch(fetchRolesByIds(missingRoleIds));
    }
  }, [dispatch, data, rolesById, enabled]);

  const recordCount = data.length;

  const handleDelete = useCallback(
    async (user) => {
      if (!canDelete) {
        window.alert("You do not have permission to delete users.");
        return;
      }
      if (!user || user.systemUser || (currentUserId && user.id === currentUserId)) {
        if (currentUserId && user?.id === currentUserId) {
          window.alert("You cannot delete your own account.");
        }
        return;
      }

      const fullName = [user.firstname, user.lastname]
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
        .join(" ");

      const confirmed = window.confirm(
        `Are you sure you want to delete "${fullName || user.username}"?`
      );
      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(user.id);
        const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("User could not be deleted");
        }

        const shouldGoPrevPage = recordCount === 1 && page > 1;
        if (shouldGoPrevPage) {
          dispatch(setPage(page - 1));
        } else {
          dispatch(fetchUsers({ page, pageSize, filters }));
        }
      } catch (deleteError) {
        window.alert(deleteError.message || "User deletion failed.");
      } finally {
        setDeletingId(null);
      }
    },
    [dispatch, page, pageSize, recordCount, filters, currentUserId, canDelete]
  );

  const totalLoading = totalStatus === "loading";

  const handlePrev = useCallback(() => {
    if (page > 1) {
      dispatch(setPage(page - 1));
    }
  }, [dispatch, page]);

  const handleNext = useCallback(() => {
    if (hasMore) {
      dispatch(setPage(page + 1));
    }
  }, [dispatch, hasMore, page]);

  const handleDirectPageChange = useCallback(
    (nextPage) => {
      if (!Number.isFinite(nextPage)) {
        return;
      }
      const safePage = Math.max(1, nextPage);
      if (safePage !== page) {
        dispatch(setPage(safePage));
      }
    },
    [dispatch, page]
  );

  const handlePageSizeChange = useCallback(
    (nextSize) => {
      if (!Number.isNaN(nextSize)) {
        dispatch(setPageSize(nextSize));
      }
    },
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (field, value) => {
      dispatch(
        setSearchFilters({
          ...filters,
          [field]: value,
        })
      );
    },
    [dispatch, filters]
  );

  return {
    data,
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
  };
}
