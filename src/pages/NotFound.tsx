import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-6 text-neutral-900">
      <p className="font-mono text-6xl font-bold tracking-tight">404</p>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
        Страница не найдена
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex h-11 items-center border border-neutral-900 bg-neutral-900 px-8 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-neutral-900"
      >
        На главную
      </Link>
    </main>
  );
}
