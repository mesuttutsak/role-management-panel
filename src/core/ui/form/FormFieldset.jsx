import { Fieldset as HeadlessFieldset } from "@headlessui/react";
import { classNames } from "../../utils/general";
import styles from "./Form.module.css";

export function FormFieldset({ className = [], ...props }) {
  return <HeadlessFieldset className={classNames([styles.fieldset, ...className])} {...props} />;
}
