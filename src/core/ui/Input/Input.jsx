import { forwardRef } from "react";
import { Input as HeadlessInput } from "@headlessui/react";
import { classNames } from "../../utils/general";
import styles from "./Input.module.css";

const baseClasses = [styles.input, "px-3", "py-2", "text-sm"];

const mergeClasses = (...values) =>
  classNames(values.filter(Boolean));

const resolveClassName = (className) => {
  if (typeof className === "function") {
    return (bag) => mergeClasses(...baseClasses, className(bag));
  }

  return mergeClasses(...baseClasses, className);
};

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  const resolvedClassName = resolveClassName(className);

  return <HeadlessInput ref={ref} className={resolvedClassName} {...props} />;
});
