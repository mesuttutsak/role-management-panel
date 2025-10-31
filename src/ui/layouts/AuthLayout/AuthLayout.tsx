import { PropsWithChildren } from "react";
import styles from "./AuthLayout.module.css";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className={`${styles.wrapper} min-h-screen bg-slate-100`}>
      <main className={`${styles.card} bg-white shadow-lg`}>
        {children}
      </main>
    </div>
  );
}
