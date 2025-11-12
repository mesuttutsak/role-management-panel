const APP_CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
  loggedSession: {
    key: process.env.REACT_APP_SESSION_KEY || "loggedUser",
    durationMs: Number(process.env.REACT_APP_SESSION_DURATION_MS) || 30 * 60 * 1000,
  },
};

export default APP_CONFIG;
