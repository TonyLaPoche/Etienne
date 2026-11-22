"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as backend from "@/lib/backend";
import type { Character, CharacterInput, Result, SessionUser, Skill } from "@/lib/types";

type AtelierValue = {
  ready: boolean;
  storageOk: boolean;
  user: SessionUser | null;
  characters: Character[];
  skills: Skill[];
  login: (email: string, password: string) => Promise<Result<SessionUser>>;
  logout: () => Promise<void>;
  resetDemo: () => Promise<Result<unknown>>;
  createSkill: (name: string) => Promise<Result<Skill>>;
  deleteSkill: (id: string) => Promise<Result<null>>;
  createCharacter: (input: CharacterInput) => Promise<Result<Character>>;
  updateCharacter: (id: string, input: CharacterInput) => Promise<Result<Character>>;
  deleteCharacter: (id: string) => Promise<Result<null>>;
};

const AtelierContext = createContext<AtelierValue | null>(null);

export function AtelierProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  const applyDb = useCallback((db: { characters: Character[]; skills: Skill[] }) => {
    setCharacters(db.characters);
    setSkills(db.skills);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStorageOk(backend.storageAvailable());
    Promise.all([backend.currentSession(), backend.load()]).then(([session, db]) => {
      if (cancelled) return;
      setUser(session);
      applyDb(db);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [applyDb]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await backend.login(email, password);
      if (result.ok) {
        setUser(result.data);
        applyDb(result.db);
      }
      return result;
    },
    [applyDb],
  );

  const logout = useCallback(async () => {
    await backend.logout();
    setUser(null);
  }, []);

  const resetDemo = useCallback(async () => {
    const result = await backend.resetDemo();
    if (result.ok) applyDb(result.db);
    return result;
  }, [applyDb]);

  const createSkill = useCallback(
    async (name: string) => {
      const result = await backend.createSkill(name);
      if (result.ok) applyDb(result.db);
      return result;
    },
    [applyDb],
  );

  const deleteSkill = useCallback(
    async (id: string) => {
      const result = await backend.deleteSkill(id);
      if (result.ok) applyDb(result.db);
      return result;
    },
    [applyDb],
  );

  const createCharacter = useCallback(
    async (input: CharacterInput) => {
      const result = await backend.createCharacter(input);
      if (result.ok) applyDb(result.db);
      return result;
    },
    [applyDb],
  );

  const updateCharacter = useCallback(
    async (id: string, input: CharacterInput) => {
      const result = await backend.updateCharacter(id, input);
      if (result.ok) applyDb(result.db);
      return result;
    },
    [applyDb],
  );

  const deleteCharacter = useCallback(
    async (id: string) => {
      const result = await backend.deleteCharacter(id);
      if (result.ok) applyDb(result.db);
      return result;
    },
    [applyDb],
  );

  const value = useMemo<AtelierValue>(
    () => ({
      ready,
      storageOk,
      user,
      characters,
      skills,
      login,
      logout,
      resetDemo,
      createSkill,
      deleteSkill,
      createCharacter,
      updateCharacter,
      deleteCharacter,
    }),
    [
      ready,
      storageOk,
      user,
      characters,
      skills,
      login,
      logout,
      resetDemo,
      createSkill,
      deleteSkill,
      createCharacter,
      updateCharacter,
      deleteCharacter,
    ],
  );

  return <AtelierContext.Provider value={value}>{children}</AtelierContext.Provider>;
}

export function useAtelier() {
  const value = useContext(AtelierContext);
  if (!value) throw new Error("useAtelier doit être utilisé dans AtelierProvider");
  return value;
}
