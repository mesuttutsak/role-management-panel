import { Fieldset } from "@headlessui/react";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./Surface.module.css";

type SurfaceProps = ComponentPropsWithoutRef<typeof Fieldset>;

export function Surface({ className, children, ...props }: SurfaceProps) {
  const composedClassName = [styles.surface, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Fieldset className={composedClassName} {...props}>
      {children}
    </Fieldset>
  );
}
