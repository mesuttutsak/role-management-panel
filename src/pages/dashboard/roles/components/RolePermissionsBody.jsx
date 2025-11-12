import { DashboardUnauthorized } from "../../../shared/DashboardUnauthorized/DashboardUnauthorized";
import { Spinner } from "../../../../core/ui/Spinner";
import { Button } from "../../../../core/ui/Button";
import { FormField, FormLabel, FormError } from "../../../../core/ui/form";
import { Input } from "../../../../core/ui/Input";
import { classNames } from "../../../../core/utils/general";
import styles from "../DashboardRoles.module.css";

export function RolePermissionsBody({
  isBootstrapping,
  isLoading,
  canReadRoles,
  roles,
  selectedRoleId,
  onSelectRole,
  activeRole,
  formState,
  handleNameChange,
  permissionGroups,
  permissions,
  handleSelectAll,
  handleClearGroup,
  handlePermissionToggle,
  roleUpdateStatus,
  canWriteRoles,
  roleUpdateError,
  hasChanges,
  handleReset,
  disableSubmit,
  handleSubmit,
}) {
  const renderContent = () => {

    if (!canReadRoles) {
      return <DashboardUnauthorized message="You do not have permission to view roles." />;
    }

    return (
      <>
        {isBootstrapping || isLoading ? <Spinner fullPage message="Loading role permissions..." /> : <>
          <div className={styles.roleList}>
            {roles.map((role) => (
              <button
                type="button"
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={classNames([
                  styles.roleButton,
                  role.id === selectedRoleId ? styles.roleButtonActive : null,
                ].filter(Boolean))}
              >
                <span className="block text-sm font-semibold text-slate-900">{role.name}</span>
                <span className="text-xs text-slate-500">
                  {role.permissions ? Object.keys(role.permissions).length : 0} groups
                </span>
              </button>
            ))}
          </div>

          <div className={styles.detailsPane}>
            {activeRole ? (
              <form className={styles.form} onSubmit={handleSubmit}>
                <FormField>
                  <FormLabel htmlFor="role-name">Role name</FormLabel>
                  <Input
                    id="role-name"
                    value={formState.name}
                    onChange={handleNameChange}
                    disabled={roleUpdateStatus === "loading" || !canWriteRoles}
                  />
                </FormField>

                <div className={styles.permissionGroups}>
                  {permissionGroups.map((group) => (
                    <div key={group.id} className={styles.permissionGroupCard}>
                      <div className={styles.groupHeader}>
                        <span>{group.name}</span>
                        <div className="flex gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => handleSelectAll(group.id)}
                            className="text-primary-600 hover:text-primary-700"
                            disabled={roleUpdateStatus === "loading" || !canWriteRoles}
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearGroup(group.id)}
                            className="text-slate-500 hover:text-slate-700"
                            disabled={roleUpdateStatus === "loading" || !canWriteRoles}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className={styles.checkboxList}>
                        {permissions.map((permission) => {
                          const checked = (formState.permissionsByGroup[group.id] || []).includes(permission.id);
                          return (
                            <label key={permission.id} className={styles.checkboxRow}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handlePermissionToggle(group.id, permission.id)}
                                disabled={roleUpdateStatus === "loading" || !canWriteRoles}
                              />
                              <span>{permission.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {roleUpdateError ? <FormError>{roleUpdateError}</FormError> : null}

                <div className={styles.actions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={!hasChanges || roleUpdateStatus === "loading" || !canWriteRoles}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={disableSubmit}>
                    {roleUpdateStatus === "loading" ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className={styles.emptyState}>Select a role to manage permissions.</div>
            )}
          </div>
        </>}
      </>
    );
  };

  return <div className={styles.body}>{renderContent()}</div>;
}
