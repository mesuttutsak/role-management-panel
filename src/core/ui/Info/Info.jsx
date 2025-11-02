import { classNames } from "../../utils/general";
import styles from "./Info.module.css";

const VARIANT_CLASSNAMES = {
  info: {
    container: styles.infoInfo,
    icon: styles.iconInfo,
    title: styles.titleInfo,
    text: styles.textInfo,
  },
  warning: {
    container: styles.infoWarning,
    icon: styles.iconWarning,
    title: styles.titleWarning,
    text: styles.textWarning,
  },
  danger: {
    container: styles.infoDanger,
    icon: styles.iconDanger,
    title: styles.titleDanger,
    text: styles.textDanger,
  },
  success: {
    container: styles.infoSuccess,
    icon: styles.iconSuccess,
    title: styles.titleSuccess,
    text: styles.textSuccess,
  },
};

const ALIGN_CLASSNAMES = {
  left: styles.alignLeft,
  center: styles.alignCenter,
  right: styles.alignRight,
};

const mergeClasses = (...values) =>
  classNames(values.filter(Boolean));

export function Info({
  icon, 
  title,
  text,
  status = "info",
  align = "left",
  className,
}) {
  const variant = VARIANT_CLASSNAMES[status] || VARIANT_CLASSNAMES.info;
  const alignment = ALIGN_CLASSNAMES[align] || ALIGN_CLASSNAMES.left;

  return (
    <div
      className={mergeClasses(
        styles.info,
        variant.container,
        alignment,
        className
      )}
    >
      {icon ? (
        <div className={mergeClasses(styles.icon, variant.icon)}>{icon}</div>
      ) : null}
      <div className={styles.content}>
        {title ? (
          <strong className={mergeClasses(styles.title, variant.title)}>
            {title}
          </strong>
        ) : null}
        <span className={mergeClasses(styles.text, variant.text)}>{text}</span>
      </div>
    </div>
  );
}
