import { useCallback, useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectPermissionsStatus, selectPermissionsById } from "../../features/permissions/permissionsSlice";
import { selectPermissionGroupsStatus, selectPermissionGroupsById } from "../../features/permissionGroups/permissionGroupsSlice";
import { selectRolesStatus, selectRolesById } from "../../features/roles/rolesSlice";

const normalizeRequirement = (requirement) => {
  if (!requirement) {
    return null;
  }

  if (typeof requirement === "string") {
    return {
      group: undefined,
      permissions: [requirement.trim()].filter(Boolean),
    };
  }

  const group = requirement.group
    ? String(requirement.group).toUpperCase()
    : undefined;

  let rawPermissions = [];
  if (Array.isArray(requirement.permissions)) {
    rawPermissions = requirement.permissions;
  } else if (typeof requirement.permissions === "string") {
    rawPermissions = [requirement.permissions];
  } else if (requirement.permission) {
    rawPermissions = [requirement.permission];
  }

  const permissions = rawPermissions
    .map((permission) => String(permission).trim())
    .filter(Boolean);

  return {
    group,
    permissions,
  };
};

const buildRolePermissionMatrix = (
  rolesById,
  permissionGroupsById,
  permissionsById
) => {
  const matrix = {};

  Object.values(rolesById).forEach((role) => {
    const permissionMap = role.permissions || {};
    const groupMatrix = {};

    Object.entries(permissionMap).forEach(([groupId, permissionIds]) => {
      const normalizedGroup =
        permissionGroupsById[groupId]?.key || groupId.toUpperCase();
      const ids = Array.isArray(permissionIds)
        ? permissionIds.filter(Boolean)
        : [];

      const keys = ids
        .map((id) => permissionsById[id]?.key || permissionsById[id]?.name)
        .filter(Boolean);

      if (!groupMatrix[normalizedGroup]) {
        groupMatrix[normalizedGroup] = {
          ids: new Set(),
          keys: new Set(),
        };
      }

      ids.forEach((permissionId) => groupMatrix[normalizedGroup].ids.add(permissionId));
      keys.forEach((permissionKey) => groupMatrix[normalizedGroup].keys.add(permissionKey));
    });

    matrix[role.id] = Object.entries(groupMatrix).reduce(
      (acc, [groupKey, value]) => {
        acc[groupKey] = {
          ids: Array.from(value.ids),
          keys: Array.from(value.keys),
        };
        return acc;
      },
      {}
    );
  });

  return matrix;
};

export const useHasPermission = () => {
  const fallbackRoleId = useAppSelector((state) => state.auth.user?.roleId);

  const permissionsStatus = useAppSelector(selectPermissionsStatus);
  const permissionGroupsStatus = useAppSelector(selectPermissionGroupsStatus);
  const rolesStatus = useAppSelector(selectRolesStatus);

  const permissionsById = useAppSelector(selectPermissionsById);
  const permissionGroupsById = useAppSelector(selectPermissionGroupsById);
  const rolesById = useAppSelector(selectRolesById);

  const rolePermissionsByGroup = useMemo(
    () =>
      buildRolePermissionMatrix(
        rolesById,
        permissionGroupsById,
        permissionsById
      ),
    [rolesById, permissionGroupsById, permissionsById]
  );

  const evaluatePermissions = useCallback(
    (targetRoleId, requirements = []) => {
      const normalizedRequirements = (Array.isArray(requirements)
        ? requirements
        : [requirements]
      )
        .map(normalizeRequirement)
        .filter(Boolean);

      if (normalizedRequirements.length === 0) {
        return true;
      }

      if (!targetRoleId) {
        return false;
      }

      const roleMatrix = rolePermissionsByGroup[targetRoleId];

      if (!roleMatrix) {
        return false;
      }

      const flattenedKeys = new Set();
      Object.values(roleMatrix).forEach((group) => {
        (group.keys || []).forEach((key) => flattenedKeys.add(key));
      });

      return normalizedRequirements.every(({ group, permissions }) => {
        if (!permissions || permissions.length === 0) {
          return true;
        }

        if (!group) {
          return permissions.every((permission) => flattenedKeys.has(permission));
        }

        const groupEntry = roleMatrix[group];
        if (!groupEntry) {
          return false;
        }

        const availableKeys = new Set(groupEntry.keys || []);
        return permissions.every((permission) => availableKeys.has(permission));
      });
    },
    [rolePermissionsByGroup]
  );

  const hasPermission = useCallback(
    (roleOrRequirement, maybeRequirements) => {
      if (
        permissionsStatus !== "succeeded" ||
        permissionGroupsStatus !== "succeeded" ||
        rolesStatus !== "succeeded"
      ) {
        return false;
      }

      if (typeof roleOrRequirement === "string") {
        return evaluatePermissions(roleOrRequirement, maybeRequirements);
      }

      return evaluatePermissions(fallbackRoleId, roleOrRequirement);
    },
    [
      evaluatePermissions,
      fallbackRoleId,
      permissionsStatus,
      permissionGroupsStatus,
      rolesStatus,
    ]
  );

  return hasPermission;
};
