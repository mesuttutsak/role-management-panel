import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import styles from "./Button.module.css";

type HeadlessButtonProps = ComponentPropsWithoutRef<typeof HeadlessButton>;
type HeadlessButtonRef = ElementRef<typeof HeadlessButton>;

export const Button = forwardRef<HeadlessButtonRef, HeadlessButtonProps>(
  function ButtonComponent({ className, ...props }, ref) {
    const composedClassName = [styles.button, className]
      .filter(Boolean)
      .join(" ");

    return (
      <HeadlessButton ref={ref} className={composedClassName} {...props} />
    );
  }
);
