type AdminLoginPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

function getStatusMessage(status: string | undefined) {
  switch (status) {
    case "invalid":
      return "E-posta veya sifre hatali.";
    default:
      return "";
  }
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const status = (await searchParams)?.status;
  const statusMessage = getStatusMessage(status);

  return (
    <main className="min-h-screen px-4 py-8 text-[color:var(--foreground)]">
      <div className="admin-shell mx-auto w-full max-w-md rounded-[32px] p-6">
        <p className="admin-kicker">Admin girişi</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl">Panel Girişi</h1>
        <p className="admin-copy mt-3 text-sm leading-6">
          Giris bilgileri veritabanindaki aktif admin kullanicisindan dogrulanir.
        </p>

        {statusMessage ? (
          <div className="admin-feedback mt-4 rounded-[24px] px-4 py-3 text-sm" role="alert">
            {statusMessage}
          </div>
        ) : null}

        <form action="/api/admin/auth/login" method="post" className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">E-posta</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              placeholder="admin@example.com"
              className="admin-input rounded-2xl px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Şifre</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Sifrenizi girin"
              className="admin-input rounded-2xl px-4 py-3"
            />
          </label>

          <button type="submit" className="admin-cta-primary w-full">
            Giriş yap
          </button>
        </form>
      </div>
    </main>
  );
}
