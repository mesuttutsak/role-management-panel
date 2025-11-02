import { useState } from "react";
import { AuthLayout } from "../core/ui/layouts/AuthLayout/AuthLayout";
import { Button } from "../core/ui/Button";
import { Input } from "../core/ui/Input";
import { Link } from "react-router-dom";
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

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <AuthLayout>
      <div className={styles.container}>
        <Info text={'username: "admin", password: "1234"'} align="center"/>
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
            <Button type="submit" disabled={!username || !password}>
              {loginLiterals.submitLabel}
            </Button>
          </form>
            <Link to="/dashbord" className={styles.link}>Panel</Link>
        </Surface>
      </div>
    </AuthLayout>
  );
}
