import { Legend as HeadlessLegend } from "@headlessui/react";
import { classNames } from "../../helpers/general";
import styles from "./Form.module.css";

export function FormLegend({ className = [], ...props }) {
  return <HeadlessLegend className={classNames([styles.title, ...className])} {...props} />;
}
