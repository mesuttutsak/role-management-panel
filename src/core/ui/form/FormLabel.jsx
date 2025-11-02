import { Label as HeadlessLabel } from "@headlessui/react";
import { classNames } from "../../utils/general";
import styles from "./Form.module.css";

export function FormLabel({ className = [], ...props }) {
  return <HeadlessLabel className={classNames([styles.label, ...className])} {...props} />;
}
