import AppRoutes from "./routes/AppRoutes";
import GlobalLoadingBar from "./components/shared/GlobalLoadingBar";

export default function App() {
  return (
    <>
      <GlobalLoadingBar />
      <AppRoutes />
    </>
  );
}
