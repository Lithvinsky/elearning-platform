import clsx from "clsx";

export function Input({ className, ...props }) {
  return <input className={clsx("input", className)} {...props} />;
}
