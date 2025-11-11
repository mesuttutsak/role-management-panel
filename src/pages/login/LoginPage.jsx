import { useCallback, useEffect, useState } from "react";
import { AuthLayout } from "../../core/ui/layouts/AuthLayout/AuthLayout";
import { Button } from "../../core/ui/Button";
import { Input } from "../../core/ui/Input";
import { useNavigate } from "react-router-dom";
import {
  FormError,
  FormField,
  FormFieldset,
  FormLabel,
  FormLegend,
} from "../../core/ui/form";
import { loginLiterals } from "./login.literals";
import styles from "./LoginPage.module.css";
import { Info } from "../../core/ui/Info";
import { Surface } from "../../core/ui/Surface";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  clearLoginError,
  fetchAdminUser,
  login,
} from "../../features/auth/authSlice";

const INITIAL_FORM = {
  username: "",
  password: "",
};

export function LoginPage() {
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    loginStatus,
    loginError,
    user,
    adminHint,
    hintStatus,
  } = useAppSelector((state) => state.auth);

  const handleApplyHint = useCallback(() => {
    if (!adminHint) {
      return;
    }
    setFormState({
      username: adminHint.username || "",
      password: adminHint.password || "",
    });
    setErrors({});
  }, [adminHint]);
  
  useEffect(() => {
    if (hintStatus === "idle") {
      dispatch(fetchAdminUser());
    }
  }, [dispatch, hintStatus]);

  useEffect(() => {
    if (loginStatus === "succeeded" && user) {
      navigate("/dashbord", { replace: true });
    }
  }, [loginStatus, user, navigate]);

  const updateField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formState.username.trim()) {
      nextErrors.username = "Kullanıcı adı zorunludur.";
    }
    if (!formState.password.trim()) {
      nextErrors.password = "Şifre zorunludur.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loginStatus === "loading") {
      return;
    }
    if (!validate()) {
      return;
    }
    dispatch(clearLoginError());
    dispatch(
      login({
        username: formState.username.trim(),
        password: formState.password,
      })
    );
  };

  const renderInfo = () => {
    if (hintStatus === "loading") {
      return <Info text="Admin credentials are loading..." align="center" />;
    }

    if (hintStatus === "failed") {
      return (
        <Info
          status="danger"
          text="Admin credentials could not be loaded. Is json-server running?"
          align="center"
        />
      );
    }

    if (adminHint) {
      return (
        <button
          type="button"
          className={styles.hintButton}
          onClick={handleApplyHint}
          aria-label="Fill admin credentials"
        >
          <Info
            text={`username: "${adminHint.username}", password: "${adminHint.password}"`}
            align="center"
          />
        </button>
      );
    }

    return null;
  };

  return (
    <AuthLayout>
      <div className={styles.container}>
        {renderInfo()}
        <Surface>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <FormFieldset>
              <FormLegend>{loginLiterals.title}</FormLegend>
              <FormField error={errors.username}>
                <FormLabel>{loginLiterals.usernameLabel}</FormLabel>
                <Input
                  value={formState.username}
                  onChange={(event) => updateField("username", event.target.value)}
                  autoComplete="username"
                  required
                />
              </FormField>
              <FormField error={errors.password}>
                <FormLabel>{loginLiterals.passwordLabel}</FormLabel>
                <Input
                  type="password"
                  value={formState.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </FormField>
            </FormFieldset>
            {loginError ? (
              <FormError>{loginError}</FormError>
            ) : null}
            <Button
              type="submit"
            >
              {loginLiterals.submitLabel}
            </Button>
          </form>
        </Surface>
      </div>
    </AuthLayout>
  );
}
