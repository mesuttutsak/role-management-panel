import styles from "./AuthLayout.module.css";

export function AuthLayout({ children }) {
  return <div className={styles.wrapper}>{children}</div>;
}
