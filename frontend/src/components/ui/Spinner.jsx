export default function Spinner({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
      <p className="text-sm text-slate-500 font-medium">{message}</p>
    </div>
  );
}
