"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAtelier } from "@/components/atelier-provider";
import { Icon } from "@/components/icon";
import { PieChart } from "@/components/pie-chart";
import { RequireAuth } from "@/components/shell";
import { Button } from "@/components/ui";
import { appreciationSlices, skillTotalSlices, sortCharacters } from "@/lib/stats";
import { personName } from "@/lib/text";

export function ExportView() {
  const raw = useSearchParams().get("ids") ?? "";
  const initialIds = raw
    .split(",")
    .filter(Boolean)
    .map((id) => {
      try {
        return decodeURIComponent(id);
      } catch {
        return id;
      }
    });
  return (
    <RequireAuth>
      <ExportContent initialIds={initialIds} />
    </RequireAuth>
  );
}

function ExportContent({ initialIds }: { initialIds: string[] }) {
  const { characters, skills } = useAtelier();
  const ordered = sortCharacters(characters);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<"one" | "group" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const chosen = selected ?? initialIds.filter((id) => ordered.some((character) => character.id === id));
  const picked = useMemo(
    () => ordered.filter((character) => chosen.includes(character.id)),
    [ordered, chosen],
  );

  function toggle(id: string) {
    setSelected(chosen.includes(id) ? chosen.filter((item) => item !== id) : [...chosen, id]);
  }

  async function download(kind: "one" | "group") {
    setBusy(kind);
    setError("");
    setMessage("");
    try {
      const pdf = await import("@/lib/pdf");
      if (kind === "one" && picked.length === 1) await pdf.downloadCharacterPdf(picked[0], skills);
      else await pdf.downloadGroupPdf(picked, skills);
      setMessage("Le PDF a été téléchargé.");
    } catch {
      setError("Le PDF n'a pas pu être généré.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl text-burgundy">Export PDF</h1>
        <p className="mt-1 text-sm text-muted">Une fiche ou un groupe, avec tableaux et camemberts.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setSelected(ordered.map((item) => item.id))}>
          Tout sélectionner
        </Button>
        <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setSelected([])}>
          Tout retirer
        </Button>
      </div>
      <ul className="space-y-2">
        {ordered.map((character) => {
          const name = personName(character.firstName, character.lastName);
          const checked = chosen.includes(character.id);
          return (
            <li key={character.id}>
              <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white px-3">
                <input type="checkbox" className="size-5 accent-adtp" checked={checked} onChange={() => toggle(character.id)} />
                <span className="min-w-0 break-words font-semibold">{name}</span>
                <span className="ml-auto text-sm text-muted">{character.age} ans</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button type="button" className="w-full" disabled={picked.length === 0 || busy !== null} onClick={() => download("group")}>
          <Icon name="picture-as-pdf" className="size-5" />
          {busy === "group" ? "PDF…" : `Exporter le groupe (${picked.length})`}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={picked.length !== 1 || busy !== null}
          onClick={() => download("one")}
        >
          PDF de la fiche
        </Button>
      </div>
      {message ? <p className="text-sm font-semibold text-leaf">{message}</p> : null}
      {error ? (
        <p className="text-sm font-semibold text-adtp" role="alert">
          {error}
        </p>
      ) : null}
      {picked.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <PieChart title="Camembert des appréciations" slices={appreciationSlices(picked)} />
          <PieChart title="Camembert des notes cumulées" slices={skillTotalSlices(picked, skills)} />
        </div>
      ) : null}
    </div>
  );
}
