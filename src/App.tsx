import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Garage from "./pages/Garage";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-400">
          Загрузка…
        </p>
      </div>
    );
  }
  if (!isAuthenticated) return null; // редирект выполняет useAuth
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/garage" element={<Garage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}
