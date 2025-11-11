import { useEffect, useState } from "react";
import { Button } from "../../../../../core/ui/Button";
import { Input } from "../../../../../core/ui/Input";
import { Modal } from "../../../../../core/ui/Modal";
import { FormField, FormLabel } from "../../../../../core/ui/form";
import styles from "./UserForm.module.css";

const INITIAL_FORM = {
  firstname: "",
  lastname: "",
  username: "",
  password: "1234",
  roleId: "",
};

export function AddUserForm({ open, onClose, roles = [], onSubmit }) {
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormState(INITIAL_FORM);
      setErrors({});
      setFormError(null);
      setSubmitting(false);
    }
  }, [open]);

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

  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New User"
      bodyClassName={styles.modalBody}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <FormField className={[styles.field]} error={errors.firstname}>
          <FormLabel htmlFor="firstname" className={[styles.label]}>
            First name
          </FormLabel>
          <Input
            id="firstname"
            value={formState.firstname}
            onChange={(event) => updateField("firstname", event.target.value)}
            disabled={submitting}
          />
        </FormField>
        <FormField className={[styles.field]} error={errors.lastname}>
          <FormLabel htmlFor="lastname" className={[styles.label]}>
            Last name
          </FormLabel>
          <Input
            id="lastname"
            value={formState.lastname}
            onChange={(event) => updateField("lastname", event.target.value)}
            disabled={submitting}
          />
        </FormField>
        <FormField className={[styles.field]} error={errors.username}>
          <FormLabel htmlFor="username" className={[styles.label]}>
            Username
          </FormLabel>
          <Input
            id="username"
            value={formState.username}
            onChange={(event) => updateField("username", event.target.value)}
            disabled={submitting}
            autoComplete="off"
          />
        </FormField>
        <FormField className={[styles.field]} error={errors.password}>
          <FormLabel htmlFor="password" className={[styles.label]}>
            Password <i>**şifre standart "1234" olarak belirlenmiştir.</i>
          </FormLabel>
          <Input
            id="password"
            type="password"
            value={formState.password}
            onChange={(event) => updateField("password", event.target.value)}
            disabled
          />
        </FormField>
        <FormField className={[styles.field]} error={errors.roleId}>
          <FormLabel htmlFor="role" className={[styles.label]}>
            Role
          </FormLabel>
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
        </FormField>
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
    </Modal>
  );
}
