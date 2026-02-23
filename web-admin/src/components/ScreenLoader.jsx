export default function ScreenLoader({ label = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-xl bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow">
        {label}
      </div>
    </div>
  );
}
