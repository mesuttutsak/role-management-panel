import APP_CONFIG from "../config";

const DEFAULT_SESSION_CONFIG = APP_CONFIG.loggedSession || {};

export const isBrowser = typeof window !== "undefined";

export const sessionManager = (
  {
    durationMs = DEFAULT_SESSION_CONFIG.durationMs,
    key = DEFAULT_SESSION_CONFIG.key,
  } = {}
) => {
  const save = (value) => {
    if (!isBrowser) return;
    try {
      if (!value) {
        window.localStorage.removeItem(key);
        return;
      }
      window.localStorage.setItem(
        key,
        JSON.stringify({ value, expiresAt: Date.now() + durationMs })
      );
    } catch (error) { }
  };

  const load = () => {
    if (!isBrowser) return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    } catch (error) {
      return null;
    }
  };

  const clear = () => {
    if (!isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) { }
  };

  return { save, load, clear };
};
