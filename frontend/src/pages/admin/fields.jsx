export function Field({ label, wide, children }) {
  return (
    <label className={`field${wide ? " wide" : ""}`}>
      {label ? <span>{label}</span> : null}
      {children}
    </label>
  );
}

export function FormSection({ title, cols = 2, children }) {
  return (
    <section className={`form-section cols-${cols}`}>
      {title ? <h4>{title}</h4> : null}
      <div className="form-section-grid">{children}</div>
    </section>
  );
}
