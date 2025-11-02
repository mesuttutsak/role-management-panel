export function classNames(values) {
  if (Array.isArray(values)) {
    return values.join(" ");
  }

  return typeof values === "string" ? values : "";
}
