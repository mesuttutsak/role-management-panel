import { Field as HeadlessField } from "@headlessui/react";
import { classNames } from "../../utils/general";
import styles from "./Form.module.css";
import { FormError } from "./FormError";

export function FormField({ className = [], error, children, ...props }) {
  return (
    <HeadlessField className={classNames([styles.field, ...className])} {...props}>
      {typeof children === "function" ? children({ error }) : children}
      <FormError>{error}</FormError>
    </HeadlessField>
  );
}
