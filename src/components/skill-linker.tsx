"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Button, controlClass } from "@/components/ui";
import { useAtelier } from "@/components/atelier-provider";
import { APPRECIATIONS, type Appreciation, type CharacterSkill, type Skill } from "@/lib/types";

function NotePicker({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (note: number) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
      {Array.from({ length: 11 }, (_, note) => (
        <button
          key={note}
          type="button"
          aria-pressed={value === note}
          onClick={() => onChange(note)}
          className={`min-h-11 rounded-lg text-sm font-semibold ${
            value === note ? "bg-adtp text-white" : "bg-mist text-ink"
          }`}
        >
          {note}
        </button>
      ))}
    </div>
  );
}

function LevelPicker({
  value,
  onChange,
}: {
  value: Appreciation | "";
  onChange: (value: Appreciation) => void;
}) {
  return (
    <div role="group" aria-label="Appréciation" className="grid grid-cols-2 gap-2">
      {APPRECIATIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
          className={`min-h-11 rounded-lg px-2 text-sm font-semibold ${
            value === item.id ? "bg-burgundy text-white" : "border border-line bg-white text-ink"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function SkillLinker({
  catalog,
  value,
  onChange,
}: {
  catalog: Skill[];
  value: CharacterSkill[];
  onChange: (skills: CharacterSkill[]) => void;
}) {
  const { createSkill } = useAtelier();
  const [creating, setCreating] = useState(false);
  const [skillId, setSkillId] = useState("");
  const [newName, setNewName] = useState("");
  const [note, setNote] = useState<number | null>(null);
  const [appreciation, setAppreciation] = useState<Appreciation | "">("");
  const [commentaire, setCommentaire] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const available = catalog
    .filter((skill) => !value.some((item) => item.skillId === skill.id))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  function patch(id: string, partial: Partial<CharacterSkill>) {
    onChange(
      value.map((item) =>
        item.skillId === id ? { ...item, ...partial, updatedAt: new Date().toISOString() } : item,
      ),
    );
  }

  async function link() {
    setError("");
    setStatus("");
    let id = skillId;
    if (creating) {
      const result = await createSkill(newName);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      id = result.data.id;
      setStatus("Compétence ajoutée au catalogue, puis reliée à la fiche.");
    }
    if (!id) {
      setError("Choisissez une compétence ou créez-en une.");
      return;
    }
    if (note === null || !appreciation) {
      setError("Indiquez une note et une appréciation.");
      return;
    }
    if (value.some((item) => item.skillId === id)) {
      setError("Cette compétence est déjà reliée.");
      return;
    }
    onChange([
      ...value,
      {
        skillId: id,
        note,
        appreciation,
        commentaire: commentaire.trim(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    setSkillId("");
    setNewName("");
    setCreating(false);
    setNote(null);
    setAppreciation("");
    setCommentaire("");
  }

  return (
    <div className="space-y-4">
      {value.length === 0 ? (
        <p className="text-sm text-muted">Aucune compétence reliée pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {value.map((item) => {
            const skill = catalog.find((entry) => entry.id === item.skillId);
            return (
              <li key={item.skillId} className="space-y-3 rounded-2xl border border-line bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="break-words font-display text-xl text-burgundy">{skill?.name ?? "Compétence retirée"}</h3>
                  <button
                    type="button"
                    className="grid size-11 shrink-0 place-items-center rounded-lg text-adtp"
                    aria-label={`Retirer ${skill?.name ?? "cette compétence"}`}
                    onClick={() => onChange(value.filter((entry) => entry.skillId !== item.skillId))}
                  >
                    <Icon name="delete" />
                  </button>
                </div>
                <NotePicker value={item.note} label={`Note de ${skill?.name ?? "la compétence"}`} onChange={(next) => patch(item.skillId, { note: next })} />
                <LevelPicker value={item.appreciation} onChange={(next) => patch(item.skillId, { appreciation: next })} />
                <label className="block text-sm font-semibold">
                  Commentaire
                  <textarea
                    value={item.commentaire}
                    maxLength={400}
                    rows={2}
                    onChange={(event) => patch(item.skillId, { commentaire: event.target.value })}
                    className={`${controlClass} mt-1.5 py-2`}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <section className="space-y-3 rounded-2xl bg-mist p-3">
        <h3 className="font-display text-lg text-burgundy">Relier une compétence</h3>
        {creating ? (
          <label className="block text-sm font-semibold">
            Nouvelle compétence
            <input
              value={newName}
              maxLength={60}
              onChange={(event) => setNewName(event.target.value)}
              className={`${controlClass} mt-1.5`}
              placeholder="Nom libre"
            />
          </label>
        ) : (
          <label className="block text-sm font-semibold">
            Compétence du catalogue
            <select
              value={skillId}
              onChange={(event) => setSkillId(event.target.value)}
              className={`${controlClass} mt-1.5`}
            >
              <option value="">Choisir</option>
              {available.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          className="min-h-11 text-sm font-semibold text-adtp"
          onClick={() => {
            setCreating((current) => !current);
            setError("");
          }}
        >
          {creating ? "Choisir dans le catalogue" : "Créer une compétence"}
        </button>
        <div>
          <p className="mb-1.5 text-sm font-semibold">Note sur 10</p>
          <NotePicker value={note} onChange={setNote} label="Note de la nouvelle liaison" />
        </div>
        <LevelPicker value={appreciation} onChange={setAppreciation} />
        <label className="block text-sm font-semibold">
          Commentaire
          <textarea
            value={commentaire}
            maxLength={400}
            rows={2}
            onChange={(event) => setCommentaire(event.target.value)}
            className={`${controlClass} mt-1.5 py-2`}
          />
        </label>
        {error ? (
          <p className="text-sm font-semibold text-adtp" role="alert">
            {error}
          </p>
        ) : null}
        {status ? <p className="text-sm text-leaf">{status}</p> : null}
        <Button type="button" onClick={link} className="w-full sm:w-auto">
          <Icon name="link" className="size-5" />
          {creating ? "Créer et relier" : "Relier"}
        </Button>
      </section>
    </div>
  );
}
