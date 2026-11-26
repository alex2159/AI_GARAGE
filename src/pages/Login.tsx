function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-white px-6 text-neutral-900">
      <div className="flex flex-col items-center gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
          Retro car owners club
        </p>
        <h1 className="font-mono text-3xl font-bold uppercase tracking-[0.2em]">
          AI Garage
        </h1>
      </div>
      <button
        type="button"
        onClick={() => {
          window.location.href = getOAuthUrl();
        }}
        className="inline-flex h-11 cursor-pointer items-center border border-neutral-900 bg-neutral-900 px-8 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-neutral-900"
      >
        Войти через Kimi
      </button>
    </main>
  );
}
