import { FormEvent, useState } from "react";
import {
  Description,
  Field,
  Fieldset,
  Label,
  Legend,
} from "@headlessui/react";
import { AuthLayout } from "../core/ui/layouts/AuthLayout/AuthLayout";
import { Button } from "../core/ui/Button";
import { Input } from "../core/ui/Input";
import { loginLiterals } from "./login.literals";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <AuthLayout>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Fieldset className={styles.fieldset}>
            <Legend className={styles.title}>{loginLiterals.title}</Legend>
            <Description className={styles.subtitle}>
              {loginLiterals.subtitle}
            </Description>
            <Field className={styles.field}>
              <Label className={styles.label}>
                {loginLiterals.usernameLabel}
              </Label>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </Field>
            <Field className={styles.field}>
              <Label className={styles.label}>
                {loginLiterals.passwordLabel}
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
          </Fieldset>
          <Button type="submit" disabled={!username || !password}>
            {loginLiterals.submitLabel}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
