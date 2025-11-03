import { Link } from "react-router-dom";
import { Info } from "../core/ui/Info";

export function DashboardUnauthorized({ message = "Bu sayfaya erişim izniniz bulunmuyor." }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100%" }}>
      <div style={{ maxWidth: 480, width: "100%", padding: "1.5rem" }}>
        <Info status="danger" text={message} align="center" />
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/dashbord">Kontrol paneline geri dön</Link>
        </p>
      </div>
    </div>
  );
}
