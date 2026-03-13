import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { brandThemeToCssVariables } from "@/lib/brand-theme";
import { hasDatabaseUrl } from "@/lib/prisma";
import { getAdminBrandSettings } from "@/lib/server/admin-data";
import { AdminPageShell } from "@/components/admin-page-shell";
import { updateBrandSettingsAction } from "../actions";

type SearchParams = Promise<{
  status?: string | string[];
}>;

function asSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getMessage(status: string) {
  switch (status) {
    case "updated":
      return "Marka ayarları kaydedildi.";
    case "invalid":
      return "Marka adı, slogan, rozet ve tüm renk alanları zorunlu. Renkleri `#RRGGBB` formatında gir.";
    case "error":
      return "Marka ayarları kaydedilemedi. Veritabanı bağlantısını kontrol et.";
    default:
      return "";
  }
}

export default async function AdminBrandingPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const status = asSingle(resolvedSearchParams.status);
  const settings = await getAdminBrandSettings();
  const isDemo = !hasDatabaseUrl();

  return (
    <AdminPageShell
      currentPath="/admin/branding"
      title="Marka Ayarları"
      sessionEmail={session.email}
      actions={
        <>
          <Link href="/" className="admin-cta-primary whitespace-nowrap">
            Mobil görünüm
          </Link>
          <Link href="/admin" className="admin-cta-secondary whitespace-nowrap">
            Özet
          </Link>
        </>
      }
    >
      <section className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="admin-panel rounded-[32px] p-5">
          <p className="admin-kicker">Marka katmanı</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Logo, metin ve renk paleti</h2>
          <p className="admin-copy mt-3 text-sm leading-6">
            Bu ekran public menüde görünen marka adı, slogan, rozet, logo ve ana renk paletini yönetir.
            Kaydettiğinde ana sayfa ve şube sayfaları yeni görünümü kullanır.
          </p>
        </article>

        <article className="admin-panel rounded-[32px] p-5">
          <p className="admin-kicker">Canlı kapsam</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Public shell güncellenir</h2>
          <p className="admin-copy mt-3 text-sm leading-6">
            Hero gradient, aktif chipler, CTA rengi ve kart arka planı bu paletten türetilir. En güvenli sonuç
            için açık bir arka plan ve koyu marka renkleri kullan.
          </p>
        </article>
      </section>

      {isDemo ? (
        <section className="admin-notice rounded-[24px] px-4 py-3 text-sm">
          Demo fallback aktif. Kaydetme için `DATABASE_URL` gerekir.
        </section>
      ) : null}

      {getMessage(status) ? (
        <section className="admin-feedback rounded-[24px] px-4 py-3 text-sm">
          {getMessage(status)}
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <form action={updateBrandSettingsAction} className="admin-panel rounded-[32px] p-4">
          <input type="hidden" name="returnTo" value="/admin/branding" />

          <div className="grid gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl">İçerik</h2>
              <p className="admin-copy mt-2 text-sm">
                Public ekranda görünen temel marka alanlarını burada güncelle.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Marka adı</span>
              <input
                name="name"
                defaultValue={settings.name}
                placeholder="Ocakbaşı Sofrası"
                className="admin-input rounded-2xl px-4 py-3"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Logo URL</span>
              <input
                name="logoUrl"
                defaultValue={settings.logoUrl}
                placeholder="https://..."
                className="admin-input rounded-2xl px-4 py-3"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Rozet metni</span>
              <input
                name="badge"
                defaultValue={settings.badge}
                placeholder="QR ve bio-link için hızlı mobil deneyim"
                className="admin-input rounded-2xl px-4 py-3"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Slogan</span>
              <textarea
                name="tagline"
                defaultValue={settings.tagline}
                rows={4}
                placeholder="Şube seç, menüyü gör, tek dokunuşla ara veya yol tarifi al."
                className="admin-input rounded-2xl px-4 py-3"
              />
            </label>

            <div className="border-t border-[color:var(--line)] pt-4">
              <h3 className="font-semibold">SEO</h3>
              <p className="admin-copy mt-2 text-sm">
                Link önizlemelerinde görünen başlık ve açıklamayı buradan yönet. Boş bırakırsan içerikten türetilir.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">SEO title</span>
              <input
                name="seoTitle"
                defaultValue={settings.seoTitle}
                placeholder="Ocakbaşı Sofrası"
                className="admin-input rounded-2xl px-4 py-3"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">SEO description</span>
              <textarea
                name="seoDescription"
                defaultValue={settings.seoDescription}
                rows={3}
                placeholder="Şube seç, menüyü gör, tek dokunuşla ara veya yol tarifi al."
                className="admin-input rounded-2xl px-4 py-3"
              />
            </label>

            <div className="border-t border-[color:var(--line)] pt-4">
              <h3 className="font-semibold">Renk paleti</h3>
              <p className="admin-copy mt-2 text-sm">
                Hex renk kullan. `#RRGGBB` formatındaki değerler public temaya uygulanır.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Ana renk</span>
                <input
                  type="color"
                  name="primaryColor"
                  defaultValue={settings.theme.primaryColor}
                  className="h-14 w-full cursor-pointer rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--card-strong)] p-2"
                />
                <input
                  defaultValue={settings.theme.primaryColor}
                  readOnly
                  className="admin-input rounded-2xl px-4 py-3 text-sm"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">İkincil renk</span>
                <input
                  type="color"
                  name="secondaryColor"
                  defaultValue={settings.theme.secondaryColor}
                  className="h-14 w-full cursor-pointer rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--card-strong)] p-2"
                />
                <input
                  defaultValue={settings.theme.secondaryColor}
                  readOnly
                  className="admin-input rounded-2xl px-4 py-3 text-sm"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Arka plan</span>
                <input
                  type="color"
                  name="backgroundColor"
                  defaultValue={settings.theme.backgroundColor}
                  className="h-14 w-full cursor-pointer rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--card-strong)] p-2"
                />
                <input
                  defaultValue={settings.theme.backgroundColor}
                  readOnly
                  className="admin-input rounded-2xl px-4 py-3 text-sm"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isDemo}
              className="admin-cta-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Marka ayarlarını kaydet
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <section className="admin-panel rounded-[32px] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="admin-kicker">Önizleme</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">Public kart</h2>
              </div>
              <div className="flex gap-2">
                <span
                  className="h-6 w-6 rounded-full border border-black/10"
                  style={{ backgroundColor: settings.theme.primaryColor }}
                />
                <span
                  className="h-6 w-6 rounded-full border border-black/10"
                  style={{ backgroundColor: settings.theme.secondaryColor }}
                />
                <span
                  className="h-6 w-6 rounded-full border border-black/10"
                  style={{ backgroundColor: settings.theme.backgroundColor }}
                />
              </div>
            </div>

            <article
              style={brandThemeToCssVariables(settings.theme)}
              className="overflow-hidden rounded-[36px] border border-[color:var(--line)] bg-[color:var(--card)] p-3 shadow-[0_24px_60px_rgba(38,22,15,0.14)]"
            >
              <div className="rounded-[32px] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.38))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                <div className="rounded-[28px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-background)_84%,white_16%),color-mix(in_srgb,var(--brand-background)_90%,black_10%))] p-3">
                  <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-[rgba(42,26,18,0.08)]" />

                  <div className="rounded-[28px] bg-[linear-gradient(135deg,var(--hero-start),var(--hero-end))] px-4 py-5 text-white shadow-[0_20px_40px_rgba(42,26,18,0.22)]">
                    <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-white/78">
                      <span>9:41</span>
                      <span>5G 100%</span>
                    </div>
                    <div className="mt-4 inline-flex rounded-full border border-white/20 bg-[color:var(--hero-glow)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/84">
                      {settings.badge}
                    </div>
                    <div className="mt-4 flex items-start gap-3">
                      {settings.logoUrl ? (
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[20px] border border-white/16 bg-white/10 p-2 backdrop-blur">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.logoUrl}
                            alt={`${settings.name} logosu`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : null}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/72">Kadıköy</p>
                        <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-none">
                          {settings.name}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/84">{settings.tagline}</p>
                  </div>

                  <div className="mt-3 rounded-[30px] border border-white/55 bg-[rgba(255,255,255,0.62)] p-2 shadow-[0_10px_30px_rgba(38,22,15,0.08)] backdrop-blur">
                    <div className="grid grid-cols-2 gap-2 rounded-[24px] bg-[color:var(--accent-soft)] p-1">
                      <span className="inline-flex min-h-14 items-center justify-center rounded-[20px] bg-[color:var(--foreground)] px-4 py-3 text-center text-base font-semibold text-white shadow-[0_10px_24px_rgba(42,26,18,0.18)]">
                        İletişim
                      </span>
                      <span className="inline-flex min-h-14 items-center justify-center rounded-[20px] px-4 py-3 text-center text-base font-semibold text-[color:var(--foreground)]">
                        Menü
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 rounded-[28px] border border-[color:var(--line)] bg-[rgba(255,255,255,0.56)] p-4 shadow-[0_12px_28px_rgba(38,22,15,0.06)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Aktif Şube</p>
                        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[color:var(--foreground)]">
                          Kadıköy
                        </p>
                      </div>
                      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium text-[color:var(--accent-strong)]">
                        Bugün açık
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                      Sekme yapısı ve kart düzeni modern mobil uygulama hissini güçlendirecek şekilde önceliklendirildi.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </aside>
      </section>
    </AdminPageShell>
  );
}
