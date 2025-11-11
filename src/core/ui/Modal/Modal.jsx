import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon";
import styles from "./Modal.module.css";
import { classNames } from "../../utils/general";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  closeOnBackdrop = true,
  className,
  panelClassName,
  bodyClassName,
}) {
  const [portalNode, setPortalNode] = useState(null);

  useEffect(() => {
    setPortalNode(document.body);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !portalNode) {
    return null;
  }

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose?.();
    }
  };

  return createPortal(
    <div className={styles.root} role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined}>
      <div className={styles.backdrop} onClick={handleBackdropClick} />
      <div className={styles.wrapper}>
        <div className={classNames([styles.panel, panelClassName, className])}>
          {(title || showCloseButton) && (
            <header className={styles.header}>
              {title ? <h2 className={styles.title}>{title}</h2> : <span />}
              {showCloseButton ? (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <Icon icon="FiX" className="h-4 w-4" />
                </button>
              ) : null}
            </header>
          )}
          <div className={classNames([styles.body, bodyClassName])}>{children}</div>
          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </div>
      </div>
    </div>,
    portalNode
  );
}
