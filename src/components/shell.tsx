"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAtelier } from "@/components/atelier-provider";
import { BootScreen } from "@/components/boot-screen";
import { Icon } from "@/components/icon";
import type { MaterialIconName } from "@/components/material-icons";
import { buttonClass } from "@/components/ui";
import { roleLabel } from "@/lib/accounts";

const NAV: { href: string; label: string; icon: MaterialIconName }[] = [
  { href: "/fiches", label: "Fiches", icon: "assignment-ind" },
  { href: "/competences", label: "Compétences", icon: "workspace-premium" },
  { href: "/export", label: "Export", icon: "picture-as-pdf" },
];

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function isActive(pathname: string, href: string) {
  const current = normalize(pathname);
  return current === href || current.startsWith(`${href}/`);
}

function AccountActions({ onDone }: { onDone?: () => void }) {
  const { user, logout, resetDemo } = useAtelier();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    await logout();
    onDone?.();
    router.replace("/");
  }

  async function handleReset() {
    const result = await resetDemo();
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirmReset(false);
    onDone?.();
    router.push("/fiches");
  }

  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className="block font-semibold">{user?.name}</span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-adtp">
          {user ? roleLabel(user.role) : ""}
        </span>
        <span className="break-all text-muted">{user?.email}</span>
      </p>
      {user?.role === "admin" ? (
        confirmReset ? (
          <div className="space-y-2 rounded-xl bg-mist p-3">
            <p className="text-sm">Les fiches et les compétences de Firestore seront remplacées par le jeu de démonstration.</p>
            {error ? <p className="text-sm font-semibold text-adtp">{error}</p> : null}
            <button type="button" className={buttonClass("danger", "w-full")} onClick={handleReset}>
              Confirmer
            </button>
            <button type="button" className={buttonClass("ghost", "w-full")} onClick={() => setConfirmReset(false)}>
              Annuler
            </button>
          </div>
        ) : (
          <button type="button" className={buttonClass("ghost", "w-full")} onClick={() => setConfirmReset(true)}>
            <Icon name="restart-alt" className="size-5" />
            Réinitialiser la démo
          </button>
        )
      ) : null}
      <button type="button" className={buttonClass("secondary", "w-full")} onClick={handleLogout}>
        <Icon name="logout" className="size-5" />
        Se déconnecter
      </button>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { syncError } = useAtelier();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialogOpen && !dialog.open) dialog.showModal();
    if (!dialogOpen && dialog.open) dialog.close();
  }, [dialogOpen]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Aller au contenu
      </a>
      <aside className="hidden border-r border-line bg-white lg:flex lg:min-h-dvh lg:flex-col lg:px-4 lg:py-6">
        <Link href="/fiches" className="flex items-center gap-3 rounded-xl px-2 py-1">
          <span className="grid size-11 place-items-center rounded-xl bg-adtp font-display text-2xl text-white">A</span>
          <span>
            <span className="block font-display text-2xl leading-none text-burgundy">ADTP</span>
            <span className="text-sm text-muted">Fiches personnages</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1" aria-label="Navigation principale">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-base font-semibold ${
                  active ? "bg-adtp text-white" : "text-ink hover:bg-mist"
                }`}
              >
                <Icon name={item.icon} className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-4 pt-8">
          <AccountActions />
          <p className="px-1 text-xs leading-relaxed text-muted">
            POC pro bono réalisé par Antoine Terrade pour Étienne et ADTP.
          </p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <Link href="/fiches" className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-lg bg-adtp font-display text-xl text-white">A</span>
            <span className="font-display text-2xl leading-none text-burgundy">ADTP</span>
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg border border-line"
            aria-label="Compte et déconnexion"
            onClick={() => setDialogOpen(true)}
          >
            <Icon name="person" />
          </button>
        </header>
        {syncError ? (
          <p className="bg-burgundy px-4 py-2 text-sm text-white" role="status">
            {syncError}
          </p>
        ) : null}
        <main id="contenu" className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
          aria-label="Navigation principale"
        >
          <ul className="grid grid-cols-3">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                      active ? "text-adtp" : "text-muted"
                    }`}
                  >
                    <Icon name={item.icon} className="size-6" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <dialog
        ref={dialogRef}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="compte-titre"
      >
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="compte-titre" className="font-display text-2xl text-burgundy">
              Compte
            </h2>
            <button type="button" className="grid size-11 place-items-center" aria-label="Fermer" onClick={() => setDialogOpen(false)}>
              <Icon name="close" />
            </button>
          </div>
          <AccountActions onDone={() => setDialogOpen(false)} />
        </div>
      </dialog>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, user } = useAtelier();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) return <BootScreen />;
  return <Shell>{children}</Shell>;
}
