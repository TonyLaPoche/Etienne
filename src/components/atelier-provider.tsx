"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as backend from "@/lib/backend";
import { signIn, signOutSession, watchSession } from "@/lib/firebase";
import type { Character, CharacterInput, Result, SessionUser, Skill } from "@/lib/types";

type AtelierValue = {
  ready: boolean;
  syncError: string | null;
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
  const [authReady, setAuthReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    return watchSession((session) => {
      setUser(session);
      setAuthReady(true);
      if (!session) {
        setCharacters([]);
        setSkills([]);
        setDataReady(true);
        setSyncError(null);
      }
    });
  }, []);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    setDataReady(false);
    return backend.watchDatabase(
      (db) => {
        setCharacters(db.characters);
        setSkills(db.skills);
        setDataReady(true);
        setSyncError(null);
      },
      (message) => {
        setSyncError(message);
        setDataReady(true);
      },
    );
  }, [userId]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.ok) setUser(result.data);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOutSession();
    setUser(null);
    setCharacters([]);
    setSkills([]);
  }, []);

  const value = useMemo<AtelierValue>(
    () => ({
      ready: authReady && (!user || dataReady),
      syncError,
      user,
      characters,
      skills,
      login,
      logout,
      resetDemo: backend.resetDemo,
      createSkill: backend.createSkill,
      deleteSkill: backend.deleteSkill,
      createCharacter: backend.createCharacter,
      updateCharacter: backend.updateCharacter,
      deleteCharacter: backend.deleteCharacter,
    }),
    [authReady, dataReady, syncError, user, characters, skills, login, logout],
  );

  return <AtelierContext.Provider value={value}>{children}</AtelierContext.Provider>;
}

export function useAtelier() {
  const value = useContext(AtelierContext);
  if (!value) throw new Error("useAtelier doit être utilisé dans AtelierProvider");
  return value;
}
