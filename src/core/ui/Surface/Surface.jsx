import { classNames } from "../../utils/general";
import styles from "./Surface.module.css";

const mergeClasses = (...values) =>
  classNames(values.filter(Boolean));

export function Surface({ className, children, ...props }) {
  return (
    <div className={mergeClasses(styles.surface, className)} {...props}>
      {children}
    </div>
  );
}
