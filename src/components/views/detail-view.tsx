"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAtelier } from "@/components/atelier-provider";
import { Icon } from "@/components/icon";
import { PieChart } from "@/components/pie-chart";
import { RequireAuth } from "@/components/shell";
import { buttonClass } from "@/components/ui";
import { averageNote, formatDate, formatScore, noteSlices } from "@/lib/stats";
import { personName } from "@/lib/text";
import { appreciationLabel } from "@/lib/types";

export function DetailView() {
  const id = useSearchParams().get("id") ?? "";
  return (
    <RequireAuth>
      <DetailContent id={id} />
    </RequireAuth>
  );
}

function DetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { characters, skills, deleteCharacter } = useAtelier();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const character = characters.find((item) => item.id === id);
  const names = new Map(skills.map((skill) => [skill.id, skill.name]));

  if (!id || !character) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-3xl text-burgundy">Fiche introuvable</h1>
        <Link href="/fiches" className="inline-flex min-h-11 items-center font-semibold text-adtp">
          Retour aux fiches
        </Link>
      </div>
    );
  }

  const name = personName(character.firstName, character.lastName);
  const average = averageNote(character.skills);

  async function download() {
    if (!character) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const pdf = await import("@/lib/pdf");
      await pdf.downloadCharacterPdf(character, skills);
      setMessage("Le PDF a été téléchargé.");
    } catch {
      setError("Le PDF n'a pas pu être généré.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!character) return;
    const result = await deleteCharacter(character.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/fiches");
  }

  return (
    <div className="space-y-5">
      <Link href="/fiches" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-adtp">
        <Icon name="arrow-back" className="size-5" />
        Toutes les fiches
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="break-words font-display text-3xl text-burgundy">{name}</h1>
          <p className="mt-1 text-sm text-muted">
            {character.age} ans · mis à jour le {formatDate(character.updatedAt)}
          </p>
        </div>
        <p className="text-left sm:text-right">
          <span className="block font-display text-4xl leading-none text-adtp tabular-nums">
            {average === null ? "–" : formatScore(average)}
          </span>
          <span className="text-sm text-muted">moyenne /10</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Link href={`/fiches/modifier?id=${encodeURIComponent(character.id)}`} className={buttonClass("primary", "w-full")}>
          <Icon name="edit" className="size-5" />
          Modifier
        </Link>
        <button type="button" className={buttonClass("secondary", "w-full")} onClick={download} disabled={busy}>
          <Icon name="picture-as-pdf" className="size-5" />
          {busy ? "PDF…" : "PDF"}
        </button>
        {confirming ? (
          <button type="button" className={buttonClass("danger", "w-full")} onClick={remove}>
            Confirmer
          </button>
        ) : (
          <button type="button" className={buttonClass("ghost", "w-full")} onClick={() => setConfirming(true)}>
            <Icon name="delete" className="size-5" />
            Supprimer
          </button>
        )}
      </div>
      {confirming ? (
        <button type="button" className="text-sm font-semibold text-muted" onClick={() => setConfirming(false)}>
          Annuler la suppression
        </button>
      ) : null}
      {message ? <p className="text-sm font-semibold text-leaf">{message}</p> : null}
      {error ? (
        <p className="text-sm font-semibold text-adtp" role="alert">
          {error}
        </p>
      ) : null}
      <PieChart title="Camembert des notes" slices={noteSlices(character, skills)} />
      <section className="space-y-3">
        <h2 className="font-display text-2xl text-burgundy">Tableau des compétences</h2>
        {character.skills.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
            Aucune compétence. Modifiez la fiche pour en relier.
          </p>
        ) : (
          <ul className="space-y-3">
            {character.skills.map((skill) => (
              <li key={skill.skillId} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="break-words font-display text-xl">{names.get(skill.skillId) ?? "Compétence"}</h3>
                  <p className="font-display text-2xl text-adtp tabular-nums">{skill.note}/10</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-burgundy">{appreciationLabel(skill.appreciation)}</p>
                {skill.commentaire ? <p className="mt-2 text-sm">{skill.commentaire}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
