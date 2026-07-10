/**
 * LoadingSkeleton — animated placeholder for loading states.
 *
 * Props:
 *   variant — "text" | "card" | "avatar" | "table" | "stat" | "list"
 *   lines   — number of text lines (variant="text")
 *   rows    — number of table/list rows
 *   cols    — number of table columns
 */
function Bone({ className = "" }) {
  return <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />;
}

export default function LoadingSkeleton({ variant = "text", lines = 3, rows = 4, cols = 4 }) {
  if (variant === "avatar") {
    return (
      <div className="flex items-center gap-3">
        <Bone className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Bone className="h-4 w-3/4" />
          <Bone className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Bone className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Bone className="h-4 w-2/3" />
            <Bone className="h-3 w-1/3" />
          </div>
        </div>
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-4/5" />
        <Bone className="h-3 w-3/5" />
      </div>
    );
  }

  if (variant === "stat") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <Bone className="w-10 h-10 rounded-xl" />
            <Bone className="h-7 w-1/2" />
            <Bone className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Bone key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-4 border-b border-slate-50 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Bone key={c} className={`h-4 ${c === 0 ? "w-8" : "flex-1"}`} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex items-center gap-3">
            <Bone className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/2" />
              <Bone className="h-3 w-3/4" />
            </div>
            <Bone className="w-16 h-6 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // Default: text lines
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Bone key={i} className={`h-4 ${i === lines - 1 ? "w-3/5" : "w-full"}`} />
      ))}
    </div>
  );
}
