import { isValidElement } from "react";
import { classNames } from "../../helpers/general";
import * as FiIcons from "react-icons/fi";

const ICON_LIBRARIES = {
  fi: FiIcons,
};

export function Icon({ icon, label, wrapperClassName, className, library = "fi" }) {
  let content = label?.charAt(0)?.toUpperCase() ?? "•";
  let iconName = null;
  let iconLibrary = library;

  if (icon) {
    if (isValidElement(icon)) {
      content = icon;
    } else if (typeof icon === "function") {
      const IconComponent = icon;
      content = <IconComponent className={className} aria-hidden="true" />;
    } else if (typeof icon === "string") {
      iconName = icon;
    } else if (typeof icon === "object") {
      iconName = icon.name;
      iconLibrary = icon.library || iconLibrary;
    }
  }

  if (iconName) {
    const libraryIcons = ICON_LIBRARIES[iconLibrary];
    if (libraryIcons && libraryIcons[iconName]) {
      const IconComponent = libraryIcons[iconName];
      content = <IconComponent className={className} aria-hidden="true" />;
    }
  }

  return (
    <span className={classNames([wrapperClassName])} aria-hidden="true">
      {content}
    </span>
  );
}
