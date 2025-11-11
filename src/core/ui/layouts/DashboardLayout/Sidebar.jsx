import { Disclosure } from "@headlessui/react";
import { classNames } from "../../../utils/general";
import styles from "./Sidebar.module.css";
import { Button } from "../../Button";
import { Icon } from "../../Icon";
import { useAppSelector } from "../../../../app/hooks";

const mergeClasses = (...values) => classNames(values.filter(Boolean));

export function Sidebar({
  items,
  collapsed = true,
  activeItemId,
  onNavigate,
  onToggleCollapse,
  onLogout,
  onClose,
  isMobile = false,
  className,
}) {

  const { user } = useAppSelector((state) => state.auth);

  const { firstname, lastname, roleName } = user;
  const avatarLetters = firstname?.charAt(0) + lastname?.charAt(0);

  const handleSelect = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }
  };


  const renderChild = (child) => {
    const isActive = child.id === activeItemId;
    return (
      <button
        key={child.id}
        type="button"
        className={mergeClasses(
          styles.childButton,
          isActive && styles.childButtonActive
        )}
        onClick={() => handleSelect(child)}
      >
        <span>{child.label}</span>
      </button>
    );
  };

  const renderItem = (item) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const childActive = hasChildren
      ? item.children.some((child) => child.id === activeItemId)
      : false;
    const isActive = item.id === activeItemId || childActive;

    if (hasChildren && !collapsed) {
      return (
        <Disclosure key={item.id} defaultOpen={childActive}>
          {({ open }) => (
            <div>
              <Disclosure.Button
                type="button"
                className={mergeClasses(
                  styles.navButton,
                  isActive && styles.navButtonActive
                )}
                aria-expanded={open}
              >
                <Icon
                  icon={item.icon}
                  label={item.label}
                  wrapperClassName={styles.iconBox}
                  className={styles.iconSvg}
                />
                <span className={styles.label}>{item.label}</span>
                <Icon
                  icon="FiChevronDown"
                  wrapperClassName={mergeClasses(styles.chevronWrapper, open && styles.chevronOpen)}
                  className={styles.iconSmall}
                  label="Submenu"
                />
              </Disclosure.Button>
              <Disclosure.Panel className={styles.childList}>
                {item.children.map(renderChild)}
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        className={mergeClasses(
          styles.navButton,
          isActive && styles.navButtonActive
        )}
        onClick={() => handleSelect(item)}
        title={collapsed ? item.label : undefined}
      >
        <Icon
          icon={item.icon}
          label={item.label}
          wrapperClassName={styles.iconBox}
          className={styles.iconSvg}
        />
        <span className={styles.label}>{item.label}</span>
      </button>
    );
  };

  return (
    <div
      className={mergeClasses(
        styles.sidebar,
        collapsed && !isMobile && styles.collapsed,
        className
      )}
    >
      {!isMobile && (
        <button
          type="button"
          className={styles.toggle}
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          <Icon
            icon={collapsed ? "FiChevronRight" : "FiChevronLeft"}
            wrapperClassName={styles.toggleIconWrapper}
            className={styles.iconSmall}
            label="Menu width"
          />
        </button>
      )}

      {isMobile ? (
        <button
          type="button"
          className={styles.mobileClose}
          onClick={onClose}
          aria-label="Close menu"
        >
          <Icon
            icon="FiX"
            wrapperClassName={styles.mobileCloseIconWrapper}
            className={styles.iconSmall}
            label="Close menu"
          />
        </button>
      ) : null}

      <div
        className={styles.profile}
      >
        <span className={styles.avatar}>{avatarLetters || 'U'}</span>
        <div className={styles.profileText}>
          {
            user && (
              <>
                <span className={styles.profileName}>{firstname} {lastname}</span>
                <span className={styles.profileRole}>{roleName}</span>
              </>
            )
          }
        </div>
      </div>

      <nav className={styles.menu}>{items.map(renderItem)}</nav>

      <Button
        type="button"
        variant="negative"
        className={[styles.logout]}
        onClick={onLogout}
      >
        <span className={styles.logoutContent}>
          <Icon
            icon="FiLogOut"
            wrapperClassName={styles.logoutIconWrapper}
            className={styles.logoutIcon}
            label="Oturumu kapat"
          />
          <span className={styles.logoutLabel}>Oturumu kapat</span>
        </span>
      </Button>
    </div>
  );
}
