import clsx from "clsx";

export function Button({ variant = "primary", className, ...props }) {
  return (
    <button
      className={clsx("btn", `btn-${variant}`, className)}
      {...props}
    />
  );
}
