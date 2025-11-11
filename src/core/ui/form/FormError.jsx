import styles from "./Form.module.css";

export function FormError({ children }) {
  if (!children) {
    return null;
  }
  return <p className={styles.error}>{children}</p>;
}
