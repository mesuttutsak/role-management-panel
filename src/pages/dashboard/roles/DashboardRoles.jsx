import { Surface } from "../../../core/ui/Surface";
import { Info } from "../../../core/ui/Info";
import { RolePermissionsBody } from "./components/RolePermissionsBody";
import { useRolePermissions } from "./hooks/useRolePermissions";
import styles from "./DashboardRoles.module.css";

export function DashboardRoles() {
  const rolePermissions = useRolePermissions();

  if (rolePermissions.aggregatedError) {
    return (
      <div className={styles.emptyState}>
        <Info status="danger" text={rolePermissions.aggregatedError} align="center" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Surface fullWidth className={styles.header}>
        <span className={styles.headerTitle}>Role Permissions</span>
      </Surface>

      <RolePermissionsBody
        isBootstrapping={rolePermissions.isBootstrapping}
        isLoading={rolePermissions.isLoading}
        canReadRoles={rolePermissions.canReadRoles}
        roles={rolePermissions.roles}
        selectedRoleId={rolePermissions.selectedRoleId}
        onSelectRole={rolePermissions.setSelectedRoleId}
        activeRole={rolePermissions.activeRole}
        formState={rolePermissions.formState}
        handleNameChange={rolePermissions.handleNameChange}
        permissionGroups={rolePermissions.permissionGroups}
        permissions={rolePermissions.permissions}
        handleSelectAll={rolePermissions.handleSelectAll}
        handleClearGroup={rolePermissions.handleClearGroup}
        handlePermissionToggle={rolePermissions.handlePermissionToggle}
        roleUpdateStatus={rolePermissions.roleUpdateStatus}
        canWriteRoles={rolePermissions.canWriteRoles}
        roleUpdateError={rolePermissions.roleUpdateError}
        hasChanges={rolePermissions.hasChanges}
        handleReset={rolePermissions.handleReset}
        disableSubmit={rolePermissions.disableSubmit}
        handleSubmit={rolePermissions.handleSubmit}
      />
    </div>
  );
}
