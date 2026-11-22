"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/shell";
import { CharacterEditor } from "@/components/views/character-editor";
import { useAtelier } from "@/components/atelier-provider";

export function CreateFicheView() {
  return (
    <RequireAuth>
      <CreateForm />
    </RequireAuth>
  );
}

function CreateForm() {
  const router = useRouter();
  const { createCharacter } = useAtelier();
  return (
    <CharacterEditor
      title="Nouvelle fiche"
      submitLabel="Créer la fiche"
      cancelHref="/fiches"
      initial={{ firstName: "", lastName: "", age: "", skills: [] }}
      onSubmit={async (input) => {
        const result = await createCharacter(input);
        if (result.ok) router.push(`/fiches/detail?id=${encodeURIComponent(result.data.id)}`);
        return result;
      }}
    />
  );
}

export function EditFicheView() {
  const id = useSearchParams().get("id") ?? "";
  return (
    <RequireAuth>
      <EditForm id={id} />
    </RequireAuth>
  );
}

function EditForm({ id }: { id: string }) {
  const router = useRouter();
  const { characters, updateCharacter } = useAtelier();
  const character = characters.find((item) => item.id === id);
  if (!character) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-3xl text-burgundy">Fiche introuvable</h1>
        <Link href="/fiches" className="font-semibold text-adtp">
          Retour aux fiches
        </Link>
      </div>
    );
  }
  return (
    <CharacterEditor
      key={character.id}
      title="Modifier la fiche"
      submitLabel="Enregistrer"
      cancelHref={`/fiches/detail?id=${encodeURIComponent(character.id)}`}
      initial={{
        firstName: character.firstName,
        lastName: character.lastName,
        age: String(character.age),
        skills: character.skills,
      }}
      onSubmit={async (input) => {
        const result = await updateCharacter(character.id, input);
        if (result.ok) router.push(`/fiches/detail?id=${encodeURIComponent(character.id)}`);
        return result;
      }}
    />
  );
}
