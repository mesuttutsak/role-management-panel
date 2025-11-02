import { Field as HeadlessField } from "@headlessui/react";
import { classNames } from "../../utils/general";
import styles from "./Form.module.css";

export function FormField({ className = [], ...props }) {
  return <HeadlessField className={classNames([styles.field, ...className])} {...props} />;
}
