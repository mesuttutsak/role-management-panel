import { useCallback, useMemo } from "react";
import { useAppSelector } from "../../app/hooks";

const normalizeRequirement = (requirement) => {
  if (!requirement) {
    return null;
  }

  if (typeof requirement === "string") {
    const value = String(requirement);
    if (!value) {
      return null;
    }
    return {
      group: undefined,
      permissions: [value],
    };
  }

  const group =
    typeof requirement?.group === "string"
      ? requirement.group.toUpperCase()
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
    .map((permission) =>
      permission === undefined || permission === null
        ? ""
        : String(permission)
    )
    .filter(Boolean);

  return {
    group,
    permissions,
  };
};

export const useHasPermission = () => {
  const user = useAppSelector((state) => state.auth.user);

  const permissionContext = useMemo(() => {
    if (!user || !Array.isArray(user.permissionGroups)) {
      return {
        ready: false,
        groupsInfo: {},
      };
    }

    const groups = user.permissionGroups;

    const groupsInfo = {};

    groups.forEach((group) => {
      const rawGroupKey =
        typeof group?.key === "string" ? group.key : group?.id;
      const groupKey = String(rawGroupKey || "").toUpperCase();

      if (!groupKey) {
        return;
      }

      const permissions = Array.isArray(group.permissions)
        ? group.permissions
        : [];

      const keys = new Set();

      permissions.forEach((permission) => {
        if (!permission) {
          return;
        }

        if (typeof permission === "string") {
          if (permission) {
            keys.add(permission);
          }
          return;
        }

        const id =
          (typeof permission.id === "string" && permission.id) || null;
        const key =
          (typeof permission.key === "string" && permission.key) ||
          (typeof permission.name === "string" && permission.name) ||
          id;

        if (key) {
          keys.add(key);
        }
      });

      groupsInfo[groupKey] = {
        keys: Array.from(keys),
      };
    });

    return {
      ready: true,
      groupsInfo,
    };
  }, [user]);

  const evaluatePermissions = useCallback(
    (requirements = []) => {
      const normalizedRequirements = (Array.isArray(requirements) ? requirements : [requirements]).map(normalizeRequirement).filter(Boolean);

      if (normalizedRequirements.length === 0) {
        return true;
      }

      if (!permissionContext.ready) {
        return false;
      }

      return normalizedRequirements.every(({ group, permissions }) => {
        if (!permissions || permissions.length === 0) {
          return true;
        }

        if (!group) {
          return permissions.every((permission) =>
            Object.values(permissionContext.groupsInfo).some((entry) =>
              (entry?.keys || []).includes(permission)
            )
          );
        }

        const upperCaseGroup = group.toUpperCase();
        const groupEntry = permissionContext.groupsInfo[upperCaseGroup];
        if (!groupEntry) {
          return false;
        }

        const availableKeys = new Set(groupEntry.keys || []);
        return permissions.every((permission) =>
          availableKeys.has(permission)
        );
      });
    },
    [permissionContext]
  );

  const hasPermission = useCallback(
    (requirements) => evaluatePermissions(requirements),
    [evaluatePermissions]
  );

  return hasPermission;
};
