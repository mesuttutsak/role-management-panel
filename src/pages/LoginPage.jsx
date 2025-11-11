import { useEffect, useState } from "react";
import { AuthLayout } from "../core/ui/layouts/AuthLayout/AuthLayout";
import { Button } from "../core/ui/Button";
import { Input } from "../core/ui/Input";
import { useNavigate } from "react-router-dom";
import {
  FormField,
  FormFieldset,
  FormLabel,
  FormLegend,
} from "../core/ui/form";
import { loginLiterals } from "./login.literals";
import styles from "./LoginPage.module.css";
import { Info } from "../core/ui/Info";
import { Surface } from "../core/ui/Surface";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  clearLoginError,
  fetchAdminUser,
  login,
} from "../features/auth/authSlice";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    loginStatus,
    loginError,
    user,
    adminHint,
    hintStatus,
  } = useAppSelector((state) => state.auth);
  
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username || !password || loginStatus === "loading") {
      return;
    }

    dispatch(clearLoginError());
    dispatch(login({ username, password }));
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
        <Info
          text={`username: "${adminHint.username}", password: "${adminHint.password}"`}
          align="center"
        />
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
              <FormField>
                <FormLabel>{loginLiterals.usernameLabel}</FormLabel>
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                />
              </FormField>
              <FormField>
                <FormLabel>{loginLiterals.passwordLabel}</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </FormField>
            </FormFieldset>
            {loginError ? (
              <Info status="danger" text={loginError} align="left" />
            ) : null}
            <Button
              type="submit"
              disabled={!username || !password || loginStatus === "loading"}
            >
              {loginLiterals.submitLabel}
            </Button>
          </form>
        </Surface>
      </div>
    </AuthLayout>
  );
}
