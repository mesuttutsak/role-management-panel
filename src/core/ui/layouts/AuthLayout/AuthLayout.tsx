import { PropsWithChildren } from "react";
import { Surface } from "../../Surface";
import styles from "./AuthLayout.module.css";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className={`${styles.wrapper} min-h-screen bg-slate-100`}>
      <Surface className={styles.card}>{children}</Surface>
    </div>
  );
}
