import { Fragment, useMemo, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { classNames } from "../../../utils/general";
import styles from "./DashboardLayout.module.css";
import { Sidebar } from "./Sidebar";
import { Icon } from "../../Icon";

const mergeClasses = (...values) => classNames(values.filter(Boolean));

export function DashboardLayout({
  menuItems,
  activeItemId,
  onNavigate,
  onLogout,
  title = "Dashboard",
  user,
  children,
  footer,
  className,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const items = useMemo(
    () => (Array.isArray(menuItems) && menuItems.length ? menuItems : []),
    [menuItems]
  );

  const handleNavigate = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.assign("/");
    }
    setMobileSidebarOpen(false);
  };

  return (
    <>
      <div className={mergeClasses(styles.root, className)}>
        <aside className="hidden md:flex">
          <Sidebar
            items={items}
            collapsed={isCollapsed}
            activeItemId={activeItemId}
            onNavigate={handleNavigate}
            onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
            onLogout={handleLogout}
            user={user}
          />
        </aside>

        <div className={styles.main}>
          <div className={styles.mobileHeader}>
            <button
              type="button"
              className={styles.mobileButton}
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Icon
                icon="FiMenu"
                wrapperClassName="flex h-5 w-5 items-center justify-center"
                className="h-5 w-5"
                label="Open menu"
              />
            </button>
            <span className={styles.mobileTitle}>{title}</span>
          </div>
          <div className={styles.contentWrapper}>{children}</div>
          {footer ? <footer className={styles.footer}>{footer}</footer> : null}
        </div>
      </div>

      <Transition show={isMobileSidebarOpen} as={Fragment} unmount>
        <Dialog
          as="div"
          className={styles.mobileDialog}
          onClose={() => setMobileSidebarOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogBackdrop className={styles.mobileOverlay} />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-200 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-200 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className={styles.mobilePanelContainer}>
              <DialogPanel className={styles.mobilePanel}>
                <div className={styles.mobilePanelInner}>
                  <Sidebar
                    items={items}
                    collapsed={false}
                    activeItemId={activeItemId}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    onClose={() => setMobileSidebarOpen(false)}
                    user={user}
                    isMobile
                  />
                </div>
              </DialogPanel>
            </div>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}
