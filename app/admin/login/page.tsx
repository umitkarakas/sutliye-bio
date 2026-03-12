export default function AdminLoginPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-[color:var(--foreground)]">
      <div className="admin-shell mx-auto w-full max-w-md rounded-[32px] p-6">
        <p className="admin-kicker">Admin girişi</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl">Panel Girişi</h1>
        <p className="admin-copy mt-3 text-sm leading-6">
          Demo ortamındaki varsayılan bilgiler `.env` ile değiştirilebilir. Form doğrudan auth route&apos;una gider.
        </p>

        <form action="/api/admin/auth/login" method="post" className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">E-posta</span>
            <input
              type="email"
              name="email"
              defaultValue="owner@ocakbasisofrasi.test"
              className="admin-input rounded-2xl px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Şifre</span>
            <input
              type="password"
              name="password"
              defaultValue="demo12345"
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
