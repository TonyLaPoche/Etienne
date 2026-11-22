"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAtelier } from "@/components/atelier-provider";
import { Icon } from "@/components/icon";
import { RequireAuth } from "@/components/shell";
import { buttonClass } from "@/components/ui";
import { averageNote, formatScore, globalAverage, sortCharacters } from "@/lib/stats";
import { fold, personName } from "@/lib/text";

export function FichesView() {
  return (
    <RequireAuth>
      <FichesContent />
    </RequireAuth>
  );
}

function FichesContent() {
  const { characters, skills } = useAtelier();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const names = useMemo(() => new Map(skills.map((skill) => [skill.id, skill.name])), [skills]);
  const average = globalAverage(characters);
  const folded = fold(query.trim());
  const visible = sortCharacters(characters).filter((character) => {
    if (!folded) return true;
    const skillNames = character.skills.map((skill) => names.get(skill.skillId) ?? "").join(" ");
    return fold(`${character.firstName} ${character.lastName} ${character.age} ${skillNames}`).includes(folded);
  });

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-burgundy">Fiches personnages</h1>
          <p className="mt-1 text-sm text-muted">Retrouver, ouvrir et préparer un export.</p>
        </div>
        <Link href="/fiches/nouvelle" className={buttonClass("primary", "w-full sm:w-auto")}>
          <Icon name="add" className="size-5" />
          Nouvelle fiche
        </Link>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Fiches</dt>
          <dd className="font-display text-2xl text-burgundy">{characters.length}</dd>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Compétences</dt>
          <dd className="font-display text-2xl text-sea">{skills.length}</dd>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Moyenne</dt>
          <dd className="font-display text-2xl text-leaf">{average === null ? "–" : formatScore(average)}</dd>
        </div>
      </dl>

      <label className="relative block">
        <span className="sr-only">Rechercher une fiche</span>
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, prénom ou compétence"
          className="min-h-12 w-full rounded-xl border border-line bg-white pr-3 pl-11 text-base outline-none focus:border-adtp"
        />
      </label>

      {folded ? (
        <p className="text-sm text-muted">
          {visible.length} fiche{visible.length > 1 ? "s" : ""} affichée{visible.length > 1 ? "s" : ""}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-10 text-center">
          <Icon name="assignment-ind" className="mx-auto size-8 text-adtp" />
          <p className="mt-3 font-display text-xl text-burgundy">Aucune fiche</p>
          <p className="mt-1 text-sm text-muted">
            {characters.length === 0 ? "Créez la première fiche personnage." : "Aucun résultat pour cette recherche."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((character) => {
            const name = personName(character.firstName, character.lastName);
            const score = averageNote(character.skills);
            const checked = selected.includes(character.id);
            return (
              <li key={character.id} className="rounded-2xl border border-line bg-white p-3">
                <div className="flex items-start gap-1">
                  <label className="grid size-11 shrink-0 place-items-center">
                    <input
                      type="checkbox"
                      className="size-5 accent-adtp"
                      checked={checked}
                      onChange={() => toggle(character.id)}
                    />
                    <span className="sr-only">Sélectionner {name}</span>
                  </label>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/fiches/detail?id=${encodeURIComponent(character.id)}`} className="break-words font-display text-xl text-burgundy">
                          {name}
                        </Link>
                        <p className="text-sm text-muted">{character.age} ans</p>
                      </div>
                      <p className="text-right">
                        <span className="block font-display text-2xl leading-none text-adtp tabular-nums">
                          {score === null ? "–" : formatScore(score)}
                        </span>
                        <span className="text-xs text-muted">/10</span>
                      </p>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {character.skills.slice(0, 3).map((skill) => (
                        <li key={skill.skillId} className="max-w-full truncate rounded-full bg-mist px-2 py-1 text-xs">
                          {names.get(skill.skillId) ?? "Compétence"}
                        </li>
                      ))}
                      {character.skills.length > 3 ? (
                        <li className="rounded-full bg-mist px-2 py-1 text-xs">+{character.skills.length - 3}</li>
                      ) : null}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selected.length > 0 ? (
        <div className="above-nav fixed inset-x-4 z-20 lg:static">
          <Link
            href={`/export?ids=${selected.map(encodeURIComponent).join(",")}`}
            className={buttonClass("primary", "w-full shadow-lg")}
          >
            <Icon name="picture-as-pdf" className="size-5" />
            Exporter la sélection ({selected.length})
          </Link>
        </div>
      ) : null}
    </div>
  );
}
