"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAtelier } from "@/components/atelier-provider";
import { Icon } from "@/components/icon";
import { RequireAuth } from "@/components/shell";
import { Button, controlClass } from "@/components/ui";
import { personName } from "@/lib/text";

export function SkillsView() {
  return (
    <RequireAuth>
      <SkillsContent />
    </RequireAuth>
  );
}

function SkillsContent() {
  const { skills, characters, createSkill, deleteSkill } = useAtelier();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [pendingId, setPendingId] = useState("");
  const ordered = skills.slice().sort((a, b) => a.name.localeCompare(b.name, "fr"));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await createSkill(name);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl text-burgundy">Compétences</h1>
        <p className="mt-1 text-sm text-muted">Catalogue libre, à relier ensuite sur chaque fiche.</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-semibold">
          Nouvelle compétence
          <input
            value={name}
            maxLength={60}
            onChange={(event) => setName(event.target.value)}
            className={`${controlClass} mt-1.5`}
            placeholder="Nom libre"
            required
          />
        </label>
        <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
          <Icon name="add" className="size-5" />
          Créer
        </Button>
      </form>
      {error ? (
        <p className="text-sm font-semibold text-adtp" role="alert">
          {error}
        </p>
      ) : null}
      {ordered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">Le catalogue est vide.</p>
      ) : (
        <ul className="space-y-3">
          {ordered.map((skill) => {
            const users = characters.filter((character) => character.skills.some((item) => item.skillId === skill.id));
            return (
              <li key={skill.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="break-words font-display text-xl text-burgundy">{skill.name}</h2>
                  <button
                    type="button"
                    className="grid size-11 shrink-0 place-items-center rounded-lg text-adtp disabled:opacity-40"
                    aria-label={`Supprimer ${skill.name}`}
                    disabled={users.length > 0 || pendingId === skill.id}
                    onClick={async () => {
                      setPendingId(skill.id);
                      await deleteSkill(skill.id);
                      setPendingId("");
                    }}
                  >
                    <Icon name="delete" />
                  </button>
                </div>
                {users.length === 0 ? (
                  <p className="mt-1 text-sm text-muted">Pas encore reliée.</p>
                ) : (
                  <p className="mt-2 text-sm">
                    Reliée à{" "}
                    {users.map((character, index) => (
                      <span key={character.id}>
                        {index > 0 ? ", " : null}
                        <Link href={`/fiches/detail?id=${encodeURIComponent(character.id)}`} className="font-semibold text-adtp">
                          {personName(character.firstName, character.lastName)}
                        </Link>
                      </span>
                    ))}
                    . Retirez-la des fiches pour pouvoir la supprimer.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
