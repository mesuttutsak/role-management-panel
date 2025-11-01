import { forwardRef } from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import { classNames } from "../../helpers/general";
import styles from "./Button.module.css";

const baseClassName = styles.button;

const mergeClasses = (...values) =>
  classNames(values.filter(Boolean));

const resolveClassName = (className) => {
  if (typeof className === "function") {
    return (bag) => mergeClasses(baseClassName, className(bag));
  }

  return mergeClasses(baseClassName, className);
};

export const Button = forwardRef(function Button({ className, ...props }, ref) {
  const resolvedClassName = resolveClassName(className);

  return (
    <HeadlessButton ref={ref} className={resolvedClassName} {...props} />
  );
});
