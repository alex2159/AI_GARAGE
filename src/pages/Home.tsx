export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-6 text-neutral-900">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
        Retro car owners club
      </p>
      <h1 className="font-mono text-3xl font-bold uppercase tracking-[0.2em]">
        AI Garage
      </h1>
      <p className="max-w-sm text-center text-sm text-neutral-500">
        Личный кабинет владельца ретро-автомобиля: гараж и календарь событий в
        вашем городе.
      </p>
      <a
        href="/login"
        className="mt-2 inline-flex h-11 items-center border border-neutral-900 bg-neutral-900 px-8 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-neutral-900"
      >
        Войти
      </a>
    </main>
  );
}
