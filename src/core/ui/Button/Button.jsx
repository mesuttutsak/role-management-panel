import { Button as HeadlessButton } from "@headlessui/react";
import { classNames } from "../../utils/general";
import styles from "./Button.module.css";

const VARIANT_CLASSNAMES = {
  positive: styles.buttonPositive,
  negative: styles.buttonNegative,
  secondary: styles.buttonSecondary,
};

export const Button = ({ className, variant = "positive", ...props }) => {
  const resolvedClassName = Array.isArray(className)
    ? className
    : className
    ? [className]
    : [];

  const variantClass = VARIANT_CLASSNAMES[variant] || VARIANT_CLASSNAMES.positive;

  return (
    <HeadlessButton
      className={classNames([styles.button, variantClass, ...resolvedClassName])}
      {...props}
    />
  );
};
