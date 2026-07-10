import { useNavigate } from "react-router-dom";
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-200 mb-4">404</p>
        <h1 className="font-bold text-xl text-slate-800 mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 mb-6">The page you are looking for doesn't exist.</p>
        <button onClick={() => navigate("/")} className="px-5 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
          Go home
        </button>
      </div>
    </div>
  );
}
