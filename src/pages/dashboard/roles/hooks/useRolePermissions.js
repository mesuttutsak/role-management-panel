import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { useHasPermission } from "../../../../core/hooks/useHasPermission";
import {
  fetchRoles,
  selectRoles,
  selectRolesStatus,
  selectRolesError,
  updateRole,
  selectRoleUpdateStatus,
  selectRoleUpdateError,
} from "../../../../features/roles/rolesSlice";
import {
  fetchPermissions,
  selectPermissions,
  selectPermissionsStatus,
  selectPermissionsError,
} from "../../../../features/permissions/permissionsSlice";
import {
  fetchPermissionGroups,
  selectPermissionGroups,
  selectPermissionGroupsStatus,
  selectPermissionGroupsError,
} from "../../../../features/permissionGroups/permissionGroupsSlice";

const buildPermissionsMap = (role, permissionGroups) => {
  const map = {};
  permissionGroups.forEach((group) => {
    const assigned = Array.isArray(role?.permissions?.[group.id])
      ? role.permissions[group.id]
      : [];
    map[group.id] = [...assigned];
  });
  Object.entries(role?.permissions || {}).forEach(([groupId, ids]) => {
    if (!map[groupId]) {
      map[groupId] = Array.isArray(ids) ? [...ids] : [];
    }
  });
  return map;
};

const haveDifferentIds = (first = [], second = []) => {
  const firstSet = new Set(first);
  const secondSet = new Set(second);
  if (firstSet.size !== secondSet.size) {
    return true;
  }
  for (const value of firstSet) {
    if (!secondSet.has(value)) {
      return true;
    }
  }
  return false;
};

export const useRolePermissions = () => {
  const dispatch = useAppDispatch();
  const hasPermission = useHasPermission();
  const canReadRoles = hasPermission({ group: "ROLES", permissions: "read" });
  const canWriteRoles = hasPermission({ group: "ROLES", permissions: "write" });

  const roles = useAppSelector(selectRoles);
  const rolesStatus = useAppSelector(selectRolesStatus);
  const rolesError = useAppSelector(selectRolesError);
  const permissions = useAppSelector(selectPermissions);
  const permissionsStatus = useAppSelector(selectPermissionsStatus);
  const permissionsError = useAppSelector(selectPermissionsError);
  const permissionGroups = useAppSelector(selectPermissionGroups);
  const permissionGroupsStatus = useAppSelector(selectPermissionGroupsStatus);
  const permissionGroupsError = useAppSelector(selectPermissionGroupsError);
  const roleUpdateStatus = useAppSelector(selectRoleUpdateStatus);
  const roleUpdateError = useAppSelector(selectRoleUpdateError);

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    permissionsByGroup: {},
  });

  const aggregatedError = rolesError || permissionsError || permissionGroupsError;

  useEffect(() => {
    if (rolesStatus === "idle" && canReadRoles) {
      dispatch(fetchRoles());
    }
  }, [dispatch, rolesStatus, canReadRoles]);

  useEffect(() => {
    if (permissionsStatus === "idle" && canReadRoles) {
      dispatch(fetchPermissions());
    }
  }, [dispatch, permissionsStatus, canReadRoles]);

  useEffect(() => {
    if (permissionGroupsStatus === "idle" && canReadRoles) {
      dispatch(fetchPermissionGroups());
    }
  }, [dispatch, permissionGroupsStatus, canReadRoles]);

  useEffect(() => {
    if (!selectedRoleId && roles.length) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const activeRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const originalPermissions = useMemo(() => {
    if (!activeRole) {
      return {};
    }
    return buildPermissionsMap(activeRole, permissionGroups);
  }, [activeRole, permissionGroups]);

  useEffect(() => {
    if (!activeRole || permissionGroups.length === 0) {
      return;
    }
    setFormState({
      name: activeRole.name || "",
      permissionsByGroup: buildPermissionsMap(activeRole, permissionGroups),
    });
  }, [activeRole, permissionGroups]);

  const isBootstrapping =
    rolesStatus === "idle" ||
    permissionsStatus === "idle" ||
    permissionGroupsStatus === "idle";

  const isLoading =
    rolesStatus === "loading" ||
    permissionsStatus === "loading" ||
    permissionGroupsStatus === "loading";

  const hasNameChange = (formState.name || "").trim() !== (activeRole?.name || "");

  const hasPermissionChanges = useMemo(() => {
    if (!activeRole) {
      return false;
    }
    return permissionGroups.some((group) => {
      const next = formState.permissionsByGroup[group.id] || [];
      const original = originalPermissions[group.id] || [];
      return haveDifferentIds(next, original);
    });
  }, [permissionGroups, formState.permissionsByGroup, originalPermissions, activeRole]);

  const hasChanges = hasNameChange || hasPermissionChanges;
  const disableSubmit =
    !activeRole || !hasChanges || roleUpdateStatus === "loading" || !canWriteRoles;

  const handleNameChange = (event) => {
    const { value } = event.target;
    setFormState((prev) => ({ ...prev, name: value }));
  };

  const handlePermissionToggle = useCallback(
    (groupId, permissionId) => {
      if (!canWriteRoles) {
        return;
      }
      setFormState((prev) => {
        const current = prev.permissionsByGroup[groupId] || [];
        const exists = current.includes(permissionId);
        const nextList = exists
          ? current.filter((id) => id !== permissionId)
          : [...current, permissionId];
        return {
          ...prev,
          permissionsByGroup: {
            ...prev.permissionsByGroup,
            [groupId]: nextList,
          },
        };
      });
    },
    [canWriteRoles]
  );

  const handleSelectAll = useCallback(
    (groupId) => {
      if (!canWriteRoles) {
        return;
      }
      const allPermissions = permissions.map((permission) => permission.id);
      setFormState((prev) => ({
        ...prev,
        permissionsByGroup: {
          ...prev.permissionsByGroup,
          [groupId]: allPermissions,
        },
      }));
    },
    [permissions, canWriteRoles]
  );

  const handleClearGroup = useCallback(
    (groupId) => {
      if (!canWriteRoles) {
        return;
      }
      setFormState((prev) => ({
        ...prev,
        permissionsByGroup: {
          ...prev.permissionsByGroup,
          [groupId]: [],
        },
      }));
    },
    [canWriteRoles]
  );

  const handleReset = useCallback(() => {
    if (!activeRole || !canWriteRoles) {
      return;
    }
    setFormState({
      name: activeRole.name || "",
      permissionsByGroup: buildPermissionsMap(activeRole, permissionGroups),
    });
  }, [activeRole, permissionGroups, canWriteRoles]);

  const buildPayload = () => {
    const payload = {};
    permissionGroups.forEach((group) => {
      const ids = formState.permissionsByGroup[group.id] || [];
      payload[group.id] = Array.from(new Set(ids));
    });
    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeRole || !canWriteRoles) {
      return;
    }
    try {
      await dispatch(
        updateRole({
          id: activeRole.id,
          name: formState.name.trim() || activeRole.name,
          permissions: buildPayload(),
        })
      ).unwrap();
    } catch (error) {
      // error handled via slice state
    }
  };

  return {
    aggregatedError,
    isBootstrapping,
    isLoading,
    canReadRoles,
    canWriteRoles,
    roles,
    selectedRoleId,
    setSelectedRoleId,
    activeRole,
    formState,
    handleNameChange,
    permissionGroups,
    permissions,
    handleSelectAll,
    handleClearGroup,
    handlePermissionToggle,
    roleUpdateStatus,
    roleUpdateError,
    hasChanges,
    handleReset,
    disableSubmit,
    handleSubmit,
  };
};
