import {
  APPRECIATIONS,
  appreciationLabel,
  type Appreciation,
  type Character,
  type Skill,
} from "@/lib/types";

export type Slice = { label: string; value: number };

export function formatScore(value: number) {
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function averageNote(skills: { note: number }[]) {
  if (skills.length === 0) return null;
  const total = skills.reduce((sum, skill) => sum + skill.note, 0);
  return total / skills.length;
}

export function globalAverage(characters: Character[]) {
  return averageNote(characters.flatMap((character) => character.skills));
}

export function sortCharacters(characters: Character[]) {
  return characters.slice().sort((a, b) => {
    const byLast = a.lastName.localeCompare(b.lastName, "fr");
    return byLast === 0 ? a.firstName.localeCompare(b.firstName, "fr") : byLast;
  });
}

export function noteSlices(character: Character, skills: Skill[]): Slice[] {
  const names = new Map(skills.map((skill) => [skill.id, skill.name]));
  return character.skills
    .filter((skill) => skill.note > 0)
    .map((skill) => ({
      label: names.get(skill.skillId) ?? "Compétence",
      value: skill.note,
    }));
}

export function appreciationSlices(characters: Character[]): Slice[] {
  const counts = new Map<Appreciation, number>(APPRECIATIONS.map((item) => [item.id, 0]));
  for (const character of characters) {
    for (const skill of character.skills) {
      counts.set(skill.appreciation, (counts.get(skill.appreciation) ?? 0) + 1);
    }
  }
  return APPRECIATIONS.map((item) => ({
    label: appreciationLabel(item.id),
    value: counts.get(item.id) ?? 0,
  })).filter((slice) => slice.value > 0);
}

export function skillTotalSlices(characters: Character[], skills: Skill[]): Slice[] {
  const totals = new Map<string, number>();
  for (const character of characters) {
    for (const skill of character.skills) {
      totals.set(skill.skillId, (totals.get(skill.skillId) ?? 0) + skill.note);
    }
  }
  return skills
    .map((skill) => ({ label: skill.name, value: totals.get(skill.id) ?? 0 }))
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "fr"));
}

export function skillAverageRows(characters: Character[], skills: Skill[]) {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const character of characters) {
    for (const skill of character.skills) {
      const current = totals.get(skill.skillId) ?? { sum: 0, count: 0 };
      current.sum += skill.note;
      current.count += 1;
      totals.set(skill.skillId, current);
    }
  }
  return skills
    .flatMap((skill) => {
      const value = totals.get(skill.id);
      if (!value) return [];
      return [{ name: skill.name, average: value.sum / value.count, total: value.sum, count: value.count }];
    })
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
