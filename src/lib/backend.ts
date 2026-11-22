import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { clientDb } from "@/lib/firebase";
import { createSeed } from "@/lib/seed";
import { fold } from "@/lib/text";
import {
  APPRECIATIONS,
  type Appreciation,
  type Character,
  type CharacterInput,
  type CharacterSkill,
  type Database,
  type Result,
  type Skill,
} from "@/lib/types";

const SKILLS = "competences";
const CHARACTERS = "personnages";
const APPRECIATION_IDS = new Set<string>(APPRECIATIONS.map((item) => item.id));

function database() {
  const db = clientDb();
  if (!db) throw new Error("firestore-unavailable");
  return db;
}

function firestoreMessage(error: unknown, fallback: string) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code === "permission-denied") {
    return "Firestore refuse l'accès. Autorisez les utilisateurs connectés dans les règles de sécurité.";
  }
  if (code === "unavailable" || code === "firestore-unavailable") {
    return "Firestore est indisponible pour le moment.";
  }
  return fallback;
}

function asSkill(id: string, data: DocumentData): Skill {
  return {
    id,
    name: String(data.name ?? ""),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

function asCharacterSkill(value: unknown): CharacterSkill | null {
  if (!value || typeof value !== "object") return null;
  const skill = value as Partial<CharacterSkill>;
  if (!skill.skillId || !APPRECIATION_IDS.has(String(skill.appreciation))) return null;
  const note = Number(skill.note);
  if (!Number.isInteger(note)) return null;
  return {
    skillId: String(skill.skillId),
    note,
    appreciation: skill.appreciation as Appreciation,
    commentaire: String(skill.commentaire ?? ""),
    updatedAt: String(skill.updatedAt ?? new Date().toISOString()),
  };
}

function asCharacter(id: string, data: DocumentData): Character {
  const skills = Array.isArray(data.skills) ? data.skills.flatMap((item) => {
    const skill = asCharacterSkill(item);
    return skill ? [skill] : [];
  }) : [];
  return {
    id,
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    age: Number(data.age ?? 0),
    skills,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

function skillPayload(skill: Skill) {
  return { name: skill.name, createdAt: skill.createdAt };
}

function characterPayload(character: Character) {
  return {
    firstName: character.firstName,
    lastName: character.lastName,
    age: character.age,
    skills: character.skills,
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  };
}

async function readAll(): Promise<Database> {
  const db = database();
  const [skillsSnap, charactersSnap] = await Promise.all([
    getDocs(collection(db, SKILLS)),
    getDocs(collection(db, CHARACTERS)),
  ]);
  return {
    version: 1,
    skills: skillsSnap.docs.map((item) => asSkill(item.id, item.data())),
    characters: charactersSnap.docs.map((item) => asCharacter(item.id, item.data())),
  };
}

async function writeSeed() {
  const db = database();
  const seed = createSeed();
  const batch = writeBatch(db);
  for (const skill of seed.skills) {
    batch.set(doc(db, SKILLS, skill.id), skillPayload(skill));
  }
  for (const character of seed.characters) {
    batch.set(doc(db, CHARACTERS, character.id), characterPayload(character));
  }
  await batch.commit();
}

export function watchDatabase(onData: (db: Database) => void, onError: (message: string) => void) {
  const db = clientDb();
  if (!db) {
    onError("Firestore est indisponible dans ce navigateur.");
    return () => undefined;
  }

  let skills: Skill[] = [];
  let characters: Character[] = [];
  let skillsReady = false;
  let charactersReady = false;
  let seeded = false;

  const emit = () => {
    if (!skillsReady || !charactersReady) return;
    onData({ version: 1, skills, characters });
    if (skills.length === 0 && characters.length === 0 && !seeded) {
      seeded = true;
      void writeSeed().catch((error) => {
        seeded = false;
        onError(firestoreMessage(error, "Impossible de préparer les fiches de démonstration."));
      });
    }
  };

  const stopSkills = onSnapshot(
    collection(db, SKILLS),
    (snap) => {
      skills = snap.docs.map((item) => asSkill(item.id, item.data()));
      skillsReady = true;
      emit();
    },
    (error) => onError(firestoreMessage(error, "Impossible de lire les compétences.")),
  );
  const stopCharacters = onSnapshot(
    collection(db, CHARACTERS),
    (snap) => {
      characters = snap.docs.map((item) => asCharacter(item.id, item.data()));
      charactersReady = true;
      emit();
    },
    (error) => onError(firestoreMessage(error, "Impossible de lire les fiches.")),
  );

  return () => {
    stopSkills();
    stopCharacters();
  };
}

function cleanName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function fail(error: string, field?: "firstName" | "lastName" | "age" | "skills"): Result<never> {
  return field ? { ok: false, error, field } : { ok: false, error };
}

function validateCharacter(input: CharacterInput, db: Database): Result<CharacterInput> {
  const firstName = cleanName(input.firstName);
  const lastName = cleanName(input.lastName);
  if (lastName.length < 1 || lastName.length > 60) {
    return fail("Indiquez un nom de 1 à 60 caractères.", "lastName");
  }
  if (firstName.length < 1 || firstName.length > 60) {
    return fail("Indiquez un prénom de 1 à 60 caractères.", "firstName");
  }
  if (!Number.isInteger(input.age) || input.age < 16 || input.age > 99) {
    return fail("Indiquez un âge entre 16 et 99 ans.", "age");
  }
  const seen = new Set<string>();
  const skills: CharacterInput["skills"] = [];
  for (const skill of input.skills) {
    if (seen.has(skill.skillId)) return fail("Une compétence est reliée deux fois.", "skills");
    seen.add(skill.skillId);
    if (!db.skills.some((item) => item.id === skill.skillId)) {
      return fail("Une compétence reliée n'existe plus dans le catalogue.", "skills");
    }
    if (!Number.isInteger(skill.note) || skill.note < 0 || skill.note > 10) {
      return fail("Chaque note doit être un entier entre 0 et 10.", "skills");
    }
    if (!APPRECIATION_IDS.has(skill.appreciation)) return fail("Choisissez une appréciation.", "skills");
    const commentaire = skill.commentaire.trim();
    if (commentaire.length > 400) return fail("Le commentaire est limité à 400 caractères.", "skills");
    skills.push({ ...skill, commentaire });
  }
  return { ok: true, data: { firstName, lastName, age: input.age, skills } };
}

export async function resetDemo(): Promise<Result<null>> {
  try {
    const db = database();
    const current = await readAll();
    const batch = writeBatch(db);
    for (const skill of current.skills) batch.delete(doc(db, SKILLS, skill.id));
    for (const character of current.characters) batch.delete(doc(db, CHARACTERS, character.id));
    const seed = createSeed();
    for (const skill of seed.skills) batch.set(doc(db, SKILLS, skill.id), skillPayload(skill));
    for (const character of seed.characters) batch.set(doc(db, CHARACTERS, character.id), characterPayload(character));
    await batch.commit();
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: firestoreMessage(error, "Impossible de réinitialiser les fiches.") };
  }
}

export async function createSkill(name: string): Promise<Result<Skill>> {
  try {
    const current = await readAll();
    const clean = cleanName(name);
    if (clean.length < 2 || clean.length > 60) {
      return { ok: false, error: "Le nom de la compétence doit contenir de 2 à 60 caractères." };
    }
    if (current.skills.some((skill) => fold(skill.name) === fold(clean))) {
      return { ok: false, error: "Cette compétence existe déjà." };
    }
    const skill: Skill = { id: crypto.randomUUID(), name: clean, createdAt: new Date().toISOString() };
    const db = database();
    const batch = writeBatch(db);
    batch.set(doc(db, SKILLS, skill.id), skillPayload(skill));
    await batch.commit();
    return { ok: true, data: skill };
  } catch (error) {
    return { ok: false, error: firestoreMessage(error, "Impossible d'enregistrer la compétence.") };
  }
}

export async function deleteSkill(id: string): Promise<Result<null>> {
  try {
    const current = await readAll();
    const used = current.characters.some((character) => character.skills.some((skill) => skill.skillId === id));
    if (used) return { ok: false, error: "Retirez cette compétence des fiches avant de la supprimer." };
    await deleteDoc(doc(database(), SKILLS, id));
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: firestoreMessage(error, "Impossible de supprimer la compétence.") };
  }
}

export async function createCharacter(input: CharacterInput): Promise<Result<Character>> {
  try {
    const current = await readAll();
    const valid = validateCharacter(input, current);
    if (!valid.ok) return valid;
    const now = new Date().toISOString();
    const character: Character = {
      id: crypto.randomUUID(),
      firstName: valid.data.firstName,
      lastName: valid.data.lastName,
      age: valid.data.age,
      createdAt: now,
      updatedAt: now,
      skills: valid.data.skills.map((skill) => ({
        skillId: skill.skillId,
        note: skill.note,
        appreciation: skill.appreciation,
        commentaire: skill.commentaire,
        updatedAt: skill.updatedAt ?? now,
      })),
    };
    const db = database();
    const batch = writeBatch(db);
    batch.set(doc(db, CHARACTERS, character.id), characterPayload(character));
    await batch.commit();
    return { ok: true, data: character };
  } catch (error) {
    return { ok: false, error: firestoreMessage(error, "Impossible d'enregistrer la fiche.") };
  }
}

export async function updateCharacter(id: string, input: CharacterInput): Promise<Result<Character>> {
  try {
    const current = await readAll();
    const existing = current.characters.find((character) => character.id === id);
    if (!existing) return { ok: false, error: "Cette fiche est introuvable." };
    const valid = validateCharacter(input, current);
    if (!valid.ok) return valid;
    const now = new Date().toISOString();
    const character: Character = {
      ...existing,
      firstName: valid.data.firstName,
      lastName: valid.data.lastName,
      age: valid.data.age,
      updatedAt: now,
      skills: valid.data.skills.map((skill) => ({
        skillId: skill.skillId,
        note: skill.note,
        appreciation: skill.appreciation,
        commentaire: skill.commentaire,
        updatedAt: skill.updatedAt ?? now,
      })),
    };
    const db = database();
    const batch = writeBatch(db);
    batch.set(doc(db, CHARACTERS, character.id), characterPayload(character));
    await batch.commit();
    return { ok: true, data: character };
  } catch (error) {
    return { ok: false, error: firestoreMessage(error, "Impossible d'enregistrer la fiche.") };
  }
}

export async function deleteCharacter(id: string): Promise<Result<null>> {
  try {
    const current = await readAll();
    if (!current.characters.some((character) => character.id === id)) {
      return { ok: false, error: "Cette fiche est introuvable." };
    }
    await deleteDoc(doc(database(), CHARACTERS, id));
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: firestoreMessage(error, "Impossible de supprimer la fiche.") };
  }
}
