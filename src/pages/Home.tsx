import { Link, Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import PlateChip from "@/components/PlateChip";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/garage" replace />;
  }

  return (
    <main className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-900 px-6 py-5">
        <span className="font-mono text-sm font-bold uppercase tracking-[0.25em]">
          AI Гараж
        </span>
      </header>

      <div className="flex flex-1 flex-col items-start justify-center gap-8 px-6 py-16 md:px-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">
          Клуб владельцев ретро-автомобилей
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
          Ваш гараж.
          <br />
          Ваш город.
          <br />
          Ваши события.
        </h1>
        <p className="max-w-md text-base leading-relaxed text-neutral-500">
          Личный кабинет владельца классики: список автомобилей с госномерами
          и историей, плюс календарь встреч, выставок и ралли в вашем городе.
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <Link
            to="/login"
            className="inline-flex h-12 items-center border border-neutral-900 bg-neutral-900 px-10 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-white hover:text-neutral-900"
          >
            Войти через Kimi
          </Link>
          <PlateChip value="А123БВ77" />
        </div>
      </div>

      <footer className="border-t border-neutral-200 px-6 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
          Москва · Санкт-Петербург · Казань · Нижний Новгород
        </p>
      </footer>
    </main>
  );
}
