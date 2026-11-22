import { createSeed } from "@/lib/seed";
import { fold } from "@/lib/text";
import {
  APPRECIATIONS,
  type Appreciation,
  type Character,
  type CharacterInput,
  type Database,
  type Result,
  type SessionUser,
  type Skill,
} from "@/lib/types";

/**
 * Service backend du POC.
 * Deux administrateurs et les fiches sont en dur : la session et les données
 * vivent dans le navigateur, parce que GitHub Pages ne fournit pas de serveur.
 * Les fonctions sont asynchrones pour pouvoir les brancher plus tard sur une API.
 */

const DB_KEY = "adtp-fiches.db.v1";
const SESSION_KEY = "adtp-fiches.session.v1";
const SESSION_MS = 1000 * 60 * 60 * 24 * 14;

const ADMINS = [
  {
    id: "admin",
    email: "admin@adtp.local",
    password: "Admin123!",
    name: "Admin ADTP",
    role: "admin" as const,
  },
  {
    id: "etienne",
    email: "etienne@adtp.local",
    password: "Etienne123!",
    name: "Étienne",
    role: "admin" as const,
  },
];

const APPRECIATION_IDS = new Set<Appreciation>(APPRECIATIONS.map((item) => item.id));

function browserStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function storageAvailable() {
  const store = browserStorage();
  if (!store) return false;
  try {
    const key = "__adtp_fiches_probe";
    store.setItem(key, "1");
    store.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function writeDb(db: Database) {
  const store = browserStorage();
  if (!store) throw new Error("storage");
  store.setItem(DB_KEY, JSON.stringify(db));
}

function readDb(): Database {
  const store = browserStorage();
  if (!store) return createSeed();
  const raw = store.getItem(DB_KEY);
  if (!raw) {
    const seeded = createSeed();
    writeDb(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Database;
    if (parsed.version !== 1 || !Array.isArray(parsed.skills) || !Array.isArray(parsed.characters)) {
      const seeded = createSeed();
      writeDb(seeded);
      return seeded;
    }
    return parsed;
  } catch {
    const seeded = createSeed();
    writeDb(seeded);
    return seeded;
  }
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
    if (seen.has(skill.skillId)) {
      return fail("Une compétence est reliée deux fois.", "skills");
    }
    seen.add(skill.skillId);
    if (!db.skills.some((item) => item.id === skill.skillId)) {
      return fail("Une compétence reliée n'existe plus dans le catalogue.", "skills");
    }
    if (!Number.isInteger(skill.note) || skill.note < 0 || skill.note > 10) {
      return fail("Chaque note doit être un entier entre 0 et 10.", "skills");
    }
    if (!APPRECIATION_IDS.has(skill.appreciation)) {
      return fail("Choisissez une appréciation.", "skills");
    }
    const commentaire = skill.commentaire.trim();
    if (commentaire.length > 400) {
      return fail("Le commentaire est limité à 400 caractères.", "skills");
    }
    skills.push({ ...skill, commentaire });
  }
  return { ok: true, data: { firstName, lastName, age: input.age, skills }, db };
}

export function demoAccounts() {
  return ADMINS.map(({ name, email, password }) => ({ name, email, password }));
}

export async function currentSession(): Promise<SessionUser | null> {
  const store = browserStorage();
  if (!store) return null;
  const raw = store.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: string; exp?: number };
    if (!parsed.id || !parsed.exp || parsed.exp < Date.now()) {
      store.removeItem(SESSION_KEY);
      return null;
    }
    const admin = ADMINS.find((item) => item.id === parsed.id);
    if (!admin) return null;
    return { id: admin.id, email: admin.email, name: admin.name, role: "admin" };
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<Result<SessionUser>> {
  const store = browserStorage();
  const admin = ADMINS.find((item) => item.email === email.trim().toLowerCase());
  const passwordOk = admin ? admin.password === password : false;
  if (!admin || !passwordOk) {
    return { ok: false, error: "Identifiant ou mot de passe incorrect." };
  }
  if (!store) {
    return { ok: false, error: "Ce navigateur ne peut pas garder la session." };
  }
  const user: SessionUser = { id: admin.id, email: admin.email, name: admin.name, role: "admin" };
  store.setItem(SESSION_KEY, JSON.stringify({ ...user, exp: Date.now() + SESSION_MS }));
  return { ok: true, data: user, db: readDb() };
}

export async function logout() {
  browserStorage()?.removeItem(SESSION_KEY);
}

export async function load(): Promise<Database> {
  return readDb();
}

export async function resetDemo(): Promise<Result<Database>> {
  try {
    const db = createSeed();
    writeDb(db);
    return { ok: true, data: db, db };
  } catch {
    return { ok: false, error: "Impossible de réinitialiser les données dans ce navigateur." };
  }
}

export async function createSkill(name: string): Promise<Result<Skill>> {
  try {
    const db = readDb();
    const clean = cleanName(name);
    if (clean.length < 2 || clean.length > 60) {
      return { ok: false, error: "Le nom de la compétence doit contenir de 2 à 60 caractères." };
    }
    if (db.skills.some((skill) => fold(skill.name) === fold(clean))) {
      return { ok: false, error: "Cette compétence existe déjà." };
    }
    const skill: Skill = { id: crypto.randomUUID(), name: clean, createdAt: new Date().toISOString() };
    const next: Database = {
      ...db,
      skills: [...db.skills, skill].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    };
    writeDb(next);
    return { ok: true, data: skill, db: next };
  } catch {
    return { ok: false, error: "Impossible d'enregistrer la compétence dans ce navigateur." };
  }
}

export async function deleteSkill(id: string): Promise<Result<null>> {
  try {
    const db = readDb();
    const used = db.characters.some((character) => character.skills.some((skill) => skill.skillId === id));
    if (used) {
      return { ok: false, error: "Retirez cette compétence des fiches avant de la supprimer." };
    }
    const next: Database = { ...db, skills: db.skills.filter((skill) => skill.id !== id) };
    writeDb(next);
    return { ok: true, data: null, db: next };
  } catch {
    return { ok: false, error: "Impossible de supprimer la compétence." };
  }
}

export async function createCharacter(input: CharacterInput): Promise<Result<Character>> {
  try {
    const db = readDb();
    const valid = validateCharacter(input, db);
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
    const next: Database = { ...db, characters: [...db.characters, character] };
    writeDb(next);
    return { ok: true, data: character, db: next };
  } catch {
    return { ok: false, error: "Impossible d'enregistrer la fiche dans ce navigateur." };
  }
}

export async function updateCharacter(id: string, input: CharacterInput): Promise<Result<Character>> {
  try {
    const db = readDb();
    const index = db.characters.findIndex((character) => character.id === id);
    if (index < 0) return { ok: false, error: "Cette fiche est introuvable." };
    const valid = validateCharacter(input, db);
    if (!valid.ok) return valid;
    const now = new Date().toISOString();
    const current = db.characters[index];
    const character: Character = {
      ...current,
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
    const characters = db.characters.slice();
    characters[index] = character;
    const next: Database = { ...db, characters };
    writeDb(next);
    return { ok: true, data: character, db: next };
  } catch {
    return { ok: false, error: "Impossible d'enregistrer la fiche dans ce navigateur." };
  }
}

export async function deleteCharacter(id: string): Promise<Result<null>> {
  try {
    const db = readDb();
    if (!db.characters.some((character) => character.id === id)) {
      return { ok: false, error: "Cette fiche est introuvable." };
    }
    const next: Database = { ...db, characters: db.characters.filter((character) => character.id !== id) };
    writeDb(next);
    return { ok: true, data: null, db: next };
  } catch {
    return { ok: false, error: "Impossible de supprimer la fiche." };
  }
}
