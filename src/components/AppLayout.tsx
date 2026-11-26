import { NavLink, Outlet } from "react-router";
import { Car, CalendarDays, UserRound, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/garage", label: "Гараж", icon: Car },
  { to: "/events", label: "События", icon: CalendarDays },
  { to: "/profile", label: "Профиль", icon: UserRound },
] as const;

function Wordmark() {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-sm font-bold uppercase tracking-[0.25em]">
        AI Гараж
      </span>
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 xl:inline">
        Retro club
      </span>
    </div>
  );
}

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-dvh bg-white text-neutral-900">
      {/* Desktop: чёрная колонка слева */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-black text-white md:flex">
        <div className="border-b border-white/20 px-6 py-6">
          <Wordmark />
        </div>
        <nav className="flex flex-1 flex-col py-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex min-h-11 items-center gap-3 px-6 font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-200",
                  isActive
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="size-4" strokeWidth={1.5} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="flex min-h-11 cursor-pointer items-center gap-3 border-t border-white/20 px-6 font-mono text-xs uppercase tracking-[0.2em] text-white/70 transition-colors duration-200 hover:bg-white hover:text-black"
        >
          <LogOut className="size-4" strokeWidth={1.5} aria-hidden />
          Выйти
        </button>
      </aside>

      {/* Mobile: верхняя полоса */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-12 items-center justify-between border-b border-white/20 bg-black px-4 text-white md:hidden">
        <Wordmark />
        <button
          type="button"
          onClick={logout}
          aria-label="Выйти"
          className="flex size-11 cursor-pointer items-center justify-center text-white/70 transition-colors duration-200 hover:text-white"
        >
          <LogOut className="size-4" strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <main className="min-w-0 flex-1 px-4 pb-24 pt-16 md:px-10 md:py-10">
        <div className="mx-auto w-full max-w-4xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile: нижняя навигация, safe-area aware */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-white/20 bg-black text-white md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex min-h-14 flex-col items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors duration-200",
                isActive ? "bg-white text-black" : "text-white/70",
              ].join(" ")
            }
          >
            <Icon className="size-5" strokeWidth={1.5} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
