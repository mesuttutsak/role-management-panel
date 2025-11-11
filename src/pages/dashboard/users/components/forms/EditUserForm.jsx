import { useEffect, useState } from "react";
import { Button } from "../../../../../core/ui/Button";
import { Input } from "../../../../../core/ui/Input";
import { Modal } from "../../../../../core/ui/Modal";
import styles from "./UserForm.module.css";

export function EditUserForm({ open, user, onClose, roles = [], onSubmit }) {
  const [formState, setFormState] = useState({
    firstname: "",
    lastname: "",
    username: "",
    roleId: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormError(null);
      setSubmitting(false);
      return;
    }
    if (user) {
      setFormState({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        username: user.username || "",
        roleId: user.roleId || "",
      });
    }
  }, [open, user]);

  if (!open || !user) {
    return null;
  }

  const updateField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formState.firstname.trim()) {
      nextErrors.firstname = "First name is required";
    }
    if (!formState.lastname.trim()) {
      nextErrors.lastname = "Last name is required";
    }
    if (!formState.username.trim()) {
      nextErrors.username = "Username is required";
    }
    if (!formState.roleId) {
      nextErrors.roleId = "Role is required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: user.id,
        firstname: formState.firstname.trim(),
        lastname: formState.lastname.trim(),
        username: formState.username.trim(),
        roleId: formState.roleId,
      });
      onClose();
    } catch (error) {
      setFormError(error || "Failed to update user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update User"
      bodyClassName={styles.modalBody}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="edit-firstname" className={styles.label}>
            First name
          </label>
          <Input
            id="edit-firstname"
            value={formState.firstname}
            onChange={(event) => updateField("firstname", event.target.value)}
            disabled={submitting}
          />
          {errors.firstname ? <p className={styles.errorText}>{errors.firstname}</p> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="edit-lastname" className={styles.label}>
            Last name
          </label>
          <Input
            id="edit-lastname"
            value={formState.lastname}
            onChange={(event) => updateField("lastname", event.target.value)}
            disabled={submitting}
          />
          {errors.lastname ? <p className={styles.errorText}>{errors.lastname}</p> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="edit-username" className={styles.label}>
            Username
          </label>
          <Input
            id="edit-username"
            value={formState.username}
            onChange={(event) => updateField("username", event.target.value)}
            disabled={submitting}
          />
          {errors.username ? <p className={styles.errorText}>{errors.username}</p> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="edit-role" className={styles.label}>
            Role
          </label>
          <select
            id="edit-role"
            className={styles.select}
            value={formState.roleId}
            onChange={(event) => updateField("roleId", event.target.value)}
            disabled={submitting}
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name || "—"}
              </option>
            ))}
          </select>
          {errors.roleId ? <p className={styles.errorText}>{errors.roleId}</p> : null}
        </div>
        {formError ? <p className={styles.formError}>{formError}</p> : null}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
