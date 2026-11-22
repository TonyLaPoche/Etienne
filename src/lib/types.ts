export const APPRECIATIONS = [
  { id: "a-accompagner", label: "À accompagner" },
  { id: "en-progression", label: "En progression" },
  { id: "operationnel", label: "Opérationnel" },
  { id: "referent", label: "Référent" },
] as const;

export type Appreciation = (typeof APPRECIATIONS)[number]["id"];

export type Skill = {
  id: string;
  name: string;
  createdAt: string;
};

export type CharacterSkill = {
  skillId: string;
  note: number;
  appreciation: Appreciation;
  commentaire: string;
  updatedAt: string;
};

export type Character = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  skills: CharacterSkill[];
  createdAt: string;
  updatedAt: string;
};

export type Database = {
  version: 1;
  skills: Skill[];
  characters: Character[];
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin";
};

export type CharacterInput = {
  firstName: string;
  lastName: string;
  age: number;
  skills: Array<{
    skillId: string;
    note: number;
    appreciation: Appreciation;
    commentaire: string;
    updatedAt?: string;
  }>;
};

export type FieldName = "firstName" | "lastName" | "age" | "skills";

export type Result<T> =
  | { ok: true; data: T; db: Database }
  | { ok: false; error: string; field?: FieldName };

export function appreciationLabel(id: Appreciation) {
  return APPRECIATIONS.find((item) => item.id === id)?.label ?? id;
}
