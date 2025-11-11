import { Link } from "react-router-dom";
import { Info } from "../../../core/ui/Info";
import styles from "./DashboardUnauthorized.module.css";

export function DashboardUnauthorized({ message = "You do not have permission to access this page." }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Info status="danger" text={message} align="center" />
        <p className={styles.linkWrapper}>
          <Link to="/dashbord" className={styles.link}>
            Return to overview panel
          </Link>
        </p>
      </div>
    </div>
  );
}
