export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 text-center px-6">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-slate-800 mb-1">Something went wrong</p>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
