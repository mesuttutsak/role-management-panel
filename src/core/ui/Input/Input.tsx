import { forwardRef, type ElementRef } from "react";
import {
  Input as HeadlessInput,
  type InputProps as HeadlessInputProps,
} from "@headlessui/react";
import styles from "./Input.module.css";

type HeadlessInputRef = ElementRef<typeof HeadlessInput>;

export const Input = forwardRef<
  HeadlessInputRef,
  HeadlessInputProps<"input">
>(
  function InputComponent({ className, ...props }, ref) {
    const composedClassName = [styles.input, className]
      .filter(Boolean)
      .join(" ");

    return (
      <HeadlessInput ref={ref} className={composedClassName} {...props} />
    );
  }
);
