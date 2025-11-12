import { Surface } from "../../../core/ui/Surface";
import { Icon } from "../../../core/ui/Icon";
import styles from "./DashboardOverview.module.css";

const CONTACT = {
  name: "Mesut Tutsak",
  email: "ttsk.mesut@gmail.com",
  phone: "+90 536 563 31 46",
};

const LINKS = [
  {
    href: "https://github.com/mesuttutsak",
    icon: "FiGithub",
    label: "GitHub profile",
  },
  {
    href: "https://mesuttutsak.dev",
    icon: "FiGlobe",
    label: "Personal website",
  },
  {
    href: "https://www.linkedin.com/in/mesut-tutsak-a82a25148/",
    icon: "FiLinkedin",
    label: "LinkedIn profile",
  },
];

export function DashboardOverview() {
  return (
    <div className={styles.container}>
    <Surface fullWidth className={styles.infoCard}>
      <div className={styles.contactBlock}>
        <span className={styles.name}>Role Management Panel</span>
        <span className={styles.meta}><strong>{CONTACT.name}</strong></span>
        <span className={styles.meta}>{CONTACT.email}</span>
        <span className={styles.meta}>{CONTACT.phone}</span>
      </div>

      <div className={styles.links}>
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={styles.linkButton}
            title={link.label}
          >
            <Icon icon={link.icon} label={link.label} />
          </a>
        ))}
      </div>
    </Surface>
    <Surface fullWidth className={styles.readmeCard}>
    </Surface>
    </div>
  );
}
