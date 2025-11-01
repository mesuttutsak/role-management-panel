import { classNames } from "../../helpers/general";
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
