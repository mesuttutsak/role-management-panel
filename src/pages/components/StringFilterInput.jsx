import { useEffect, useRef, useState } from "react";
import styles from "./StringFilterInput.module.css";

const DEFAULT_DEBOUNCE_MS = 300;
const MIN_CHAR_LIMIT = 2;

export function StringFilterInput({
  filterKey,
  value,
  placeholder,
  onChange,
  disabled = false,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}) {
  const [internalValue, setInternalValue] = useState(value || "");
  const latestOnChangeRef = useRef(onChange);
  const lastEmittedValueRef = useRef(value || "");

  useEffect(() => {
    latestOnChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setInternalValue(value || "");
    lastEmittedValueRef.current = value || "";
  }, [value]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const handler = setTimeout(() => {
      const nextValue = internalValue || "";
      if (
        (nextValue.length === 0 || nextValue.length >= MIN_CHAR_LIMIT) &&
        nextValue !== lastEmittedValueRef.current
      ) {
        lastEmittedValueRef.current = nextValue;
        latestOnChangeRef.current?.(filterKey, nextValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, filterKey, debounceMs, disabled]);

  return (
    <input
      type="text"
      className={styles.input}
      value={internalValue}
      onChange={(event) => setInternalValue(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
