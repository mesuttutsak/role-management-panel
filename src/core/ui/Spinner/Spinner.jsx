export function Spinner({ fullPage = false, message = "Yükleniyor..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: fullPage ? "100vh" : "auto",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "4px solid #e5e7eb",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      {message ? (
        <span style={{ marginTop: "1rem", color: "#4b5563" }}>{message}</span>
      ) : null}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
