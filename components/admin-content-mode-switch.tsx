import Link from "next/link";

type AdminContentMode = "list" | "new";

type AdminContentModeSwitchProps = {
  listHref: string;
  newHref: string;
  mode: AdminContentMode;
  listLabel: string;
  newLabel: string;
};

export function AdminContentModeSwitch({
  listHref,
  newHref,
  mode,
  listLabel,
  newLabel
}: AdminContentModeSwitchProps) {
  return (
    <section className="admin-panel rounded-[32px] p-3">
      <div className="grid gap-2 md:grid-cols-2">
        <Link
          href={listHref}
          aria-current={mode === "list" ? "page" : undefined}
          className={[
            "rounded-[24px] border px-4 py-4 transition",
            mode === "list"
              ? "border-transparent bg-[color:var(--foreground)] text-white"
              : "border-[color:var(--line)] bg-[color:var(--card-strong)] text-[color:var(--foreground)]"
          ].join(" ")}
        >
          <p className="text-sm font-semibold">{listLabel}</p>
          <p className={mode === "list" ? "mt-1 text-sm text-white/72" : "mt-1 text-sm text-[color:var(--muted)]"}>
            Mevcut kayıtları tarayın ve hızlı işlem yapın.
          </p>
        </Link>

        <Link
          href={newHref}
          aria-current={mode === "new" ? "page" : undefined}
          className={[
            "rounded-[24px] border px-4 py-4 transition",
            mode === "new"
              ? "border-transparent bg-[color:var(--foreground)] text-white"
              : "border-[color:var(--line)] bg-[color:var(--card-strong)] text-[color:var(--foreground)]"
          ].join(" ")}
        >
          <p className="text-sm font-semibold">{newLabel}</p>
          <p className={mode === "new" ? "mt-1 text-sm text-white/72" : "mt-1 text-sm text-[color:var(--muted)]"}>
            Yeni kayıt eklemek için sade form görünümünü açın.
          </p>
        </Link>
      </div>
    </section>
  );
}
