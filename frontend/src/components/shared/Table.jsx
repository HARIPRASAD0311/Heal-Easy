/**
 * Table — reusable data table.
 *
 * Props:
 *   columns  — [{ key, label, width?, render? }]
 *   rows     — array of data objects
 *   onRowClick — optional row click handler
 *   emptyText — string shown when no rows
 *   loading  — shows skeleton rows
 */
export default function Table({
  columns = [],
  rows = [],
  onRowClick,
  emptyText = "No data found",
  loading = false,
  className = "",
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : {}}
                className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.length === 0
            ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">
                  {emptyText}
                </td>
              </tr>
            )
            : rows.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-slate-50 transition-colors
                    ${onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-slate-700">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
