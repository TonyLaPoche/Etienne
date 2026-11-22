"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAtelier } from "@/components/atelier-provider";
import { BootScreen } from "@/components/boot-screen";
import { Icon } from "@/components/icon";
import { Button, Field, controlClass } from "@/components/ui";
import { staffAccounts } from "@/lib/firebase";
import { roleLabel } from "@/lib/accounts";

const ACCOUNTS = staffAccounts();

export function LoginView() {
  const { ready, user, login } = useAtelier();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/fiches");
  }, [ready, user, router]);

  async function signIn(nextEmail: string, nextPassword: string) {
    setPending(true);
    setError("");
    const result = await login(nextEmail, nextPassword);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/fiches");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await signIn(email, password);
  }

  if (!ready || user) return <BootScreen />;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <section className="bg-adtp px-4 pb-12 pt-8 text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14">
        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">POC interne</p>
          <h1 className="mt-2 font-display text-4xl leading-none sm:text-5xl">ADTP Fiches</h1>
          <p className="mt-4 max-w-sm text-base leading-snug">
            Créez les fiches personnages, reliez les compétences, évaluez-les, puis exportez une fiche ou un groupe en PDF.
          </p>
        </div>
        <p className="mt-8 hidden max-w-sm text-sm leading-relaxed text-white/85 lg:block">
          Pour les équipes ADTP en Haute-Savoie. POC pro bono réalisé par Antoine Terrade pour Étienne et ADTP.
        </p>
      </section>
      <section className="px-4 py-6 lg:grid lg:place-items-center lg:px-10">
        <div className="mx-auto w-full max-w-md -mt-6 rounded-2xl bg-white p-4 shadow-sm lg:mt-0 lg:p-6">
          <h2 className="font-display text-2xl text-burgundy">Connexion</h2>
          <p className="mt-1 text-sm text-muted">
            Compte Firebase, e-mail et mot de passe. Les fiches et les compétences sont enregistrées dans Firestore.
          </p>
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <Field label="Identifiant" htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={controlClass}
                required
              />
            </Field>
            <Field label="Mot de passe" htmlFor="password">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={controlClass}
                required
              />
            </Field>
            {error ? (
              <p className="text-sm font-semibold text-adtp" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              <Icon name="person" className="size-5" />
              {pending ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
          <div className="mt-6 space-y-2 border-t border-line pt-4">
            <p className="text-sm font-semibold">Comptes ADTP</p>
            {ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-mist px-3 py-2 text-left"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  void signIn(account.email, account.password);
                }}
                disabled={pending}
              >
                <span>
                  <span className="block font-semibold">{account.name}</span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-adtp">{roleLabel(account.role)}</span>
                  <span className="block break-all text-sm text-muted">
                    {account.email} · {account.password}
                  </span>
                </span>
                <Icon name="arrow-back" className="size-5 rotate-180 text-adtp" />
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            POC pro bono réalisé par Antoine Terrade pour Étienne et ADTP.
          </p>
        </div>
      </section>
    </div>
  );
}
