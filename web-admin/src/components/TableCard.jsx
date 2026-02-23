export default function TableCard({ title, actions, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {actions ? <div>{actions}</div> : null}
      </header>
      <div className="overflow-x-auto p-4">{children}</div>
    </section>
  );
}
