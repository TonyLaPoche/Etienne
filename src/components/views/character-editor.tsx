"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAtelier } from "@/components/atelier-provider";
import { Icon } from "@/components/icon";
import { SkillLinker } from "@/components/skill-linker";
import { Button, Field, buttonClass, controlClass } from "@/components/ui";
import type { CharacterInput, CharacterSkill, Result } from "@/lib/types";

export type Draft = {
  firstName: string;
  lastName: string;
  age: string;
  skills: CharacterSkill[];
};

export function CharacterEditor({
  title,
  submitLabel,
  cancelHref,
  initial,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  cancelHref: string;
  initial: Draft;
  onSubmit: (input: CharacterInput) => Promise<Result<unknown>>;
}) {
  const { skills } = useAtelier();
  const [draft, setDraft] = useState<Draft>(() => ({
    firstName: initial.firstName,
    lastName: initial.lastName,
    age: initial.age,
    skills: initial.skills.map((skill) => ({ ...skill })),
  }));
  const [pending, setPending] = useState(false);
  const [field, setField] = useState<string>("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setField("");
    const age = Number(draft.age);
    const result = await onSubmit({
      firstName: draft.firstName,
      lastName: draft.lastName,
      age,
      skills: draft.skills.map(({ skillId, note, appreciation, commentaire, updatedAt }) => ({
        skillId,
        note,
        appreciation,
        commentaire,
        updatedAt,
      })),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      setField(result.field ?? "");
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <Link href={cancelHref} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-adtp">
          <Icon name="arrow-back" className="size-5" />
          Retour
        </Link>
        <h1 className="font-display text-3xl text-burgundy">{title}</h1>
      </div>
      <div className="space-y-4 rounded-2xl border border-line bg-white p-4">
        <Field label="Nom" htmlFor="lastName" error={field === "lastName" ? error : undefined}>
          <input
            id="lastName"
            value={draft.lastName}
            maxLength={60}
            onChange={(event) => setDraft((current) => ({ ...current, lastName: event.target.value }))}
            className={controlClass}
            autoComplete="family-name"
            required
          />
        </Field>
        <Field label="Prénom" htmlFor="firstName" error={field === "firstName" ? error : undefined}>
          <input
            id="firstName"
            value={draft.firstName}
            maxLength={60}
            onChange={(event) => setDraft((current) => ({ ...current, firstName: event.target.value }))}
            className={controlClass}
            autoComplete="given-name"
            required
          />
        </Field>
        <Field label="Âge" htmlFor="age" error={field === "age" ? error : undefined} hint="Entre 16 et 99 ans">
          <input
            id="age"
            inputMode="numeric"
            value={draft.age}
            onChange={(event) => setDraft((current) => ({ ...current, age: event.target.value.replace(/[^\d]/g, "") }))}
            className={controlClass}
            required
          />
        </Field>
      </div>
      <section className="space-y-3">
        <h2 className="font-display text-2xl text-burgundy">Compétences</h2>
        <SkillLinker catalog={skills} value={draft.skills} onChange={(next) => setDraft((current) => ({ ...current, skills: next }))} />
        {field === "skills" ? (
          <p className="text-sm font-semibold text-adtp" role="alert">
            {error}
          </p>
        ) : null}
      </section>
      {error && !field ? (
        <p className="text-sm font-semibold text-adtp" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
          <Icon name="save" className="size-5" />
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonClass("ghost", "w-full sm:w-auto")}>
          Annuler
        </Link>
      </div>
    </form>
  );
}
