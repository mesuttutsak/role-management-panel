import { Field as HeadlessField } from "@headlessui/react";
import { classNames } from "../../helpers/general";
import styles from "./Form.module.css";

export function FormField({ className = [], ...props }) {
  return <HeadlessField className={classNames([styles.field, ...className])} {...props} />;
}
