import { Legend as HeadlessLegend } from "@headlessui/react";
import { classNames } from "../../utils/general";
import styles from "./Form.module.css";

export function FormLegend({ className = [], ...props }) {
  return <HeadlessLegend className={classNames([styles.title, ...className])} {...props} />;
}
