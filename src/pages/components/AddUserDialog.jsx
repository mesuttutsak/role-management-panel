import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../core/ui/Button";
import { Input } from "../../core/ui/Input";
import styles from "./AddUserDialog.module.css";

const INITIAL_FORM = {
  firstname: "",
  lastname: "",
  username: "",
  password: "1234",
  roleId: "",
};

export function AddUserDialog({ open, onClose, roles = [], onSubmit }) {
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [portalNode, setPortalNode] = useState(null);

  useEffect(() => {
    if (!open) {
      setFormState(INITIAL_FORM);
      setErrors({});
      setFormError(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    setPortalNode(document.body);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
    if (!formState.password.trim()) {
      nextErrors.password = "Password is required";
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
        firstname: formState.firstname.trim(),
        lastname: formState.lastname.trim(),
        username: formState.username.trim(),
        password: formState.password,
        roleId: formState.roleId,
      });
      onClose();
    } catch (error) {
      setFormError(error?.message || error || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !portalNode) {
    return null;
  }

  return createPortal(
    <div className={styles.dialogRoot} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.wrapper}>
        <div className={styles.panel}>
          <h2 className={styles.title}>Add New User</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label htmlFor="firstname" className={styles.label}>
                    First name
                  </label>
                  <Input
                    id="firstname"
                    value={formState.firstname}
                    onChange={(event) => updateField("firstname", event.target.value)}
                    disabled={submitting}
                  />
                  {errors.firstname ? (
                    <p className={styles.errorText}>{errors.firstname}</p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="lastname" className={styles.label}>
                    Last name
                  </label>
                  <Input
                    id="lastname"
                    value={formState.lastname}
                    onChange={(event) => updateField("lastname", event.target.value)}
                    disabled={submitting}
                  />
                  {errors.lastname ? (
                    <p className={styles.errorText}>{errors.lastname}</p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="username" className={styles.label}>
                    Username
                  </label>
                  <Input
                    id="username"
                    value={formState.username}
                    onChange={(event) => updateField("username", event.target.value)}
                    disabled={submitting}
                    autoComplete="off"
                  />
                  {errors.username ? (
                    <p className={styles.errorText}>{errors.username}</p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="password" className={styles.label}>
                    Password   <i>**şifre standart "1234" olarak belirlenmiştir.</i>
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={formState.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    disabled={true}
                  />
                  {errors.password ? (
                    <p className={styles.errorText}>{errors.password}</p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="role" className={styles.label}>
                    Role
                  </label>
                  <select
                    id="role"
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
                  {errors.roleId ? (
                    <p className={styles.errorText}>{errors.roleId}</p>
                  ) : null}
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
                {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    portalNode
  );
}
