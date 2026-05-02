import clsx from "clsx";

export function Card({ title, children, action, className }) {
  return (
    <section className={clsx("card", className)}>
      {(title || action) && (
        <header className="card-header">
          {title ? <h3>{title}</h3> : <span />}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
