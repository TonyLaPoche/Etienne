import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { staffByEmail, STAFF } from "@/lib/accounts";
import type { Result, SessionUser } from "@/lib/types";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0OaUGLPPr5JmunKMvuBdiJjyh5rT2F7c",
  authDomain: "manutio.firebaseapp.com",
  projectId: "manutio",
  storageBucket: "manutio.firebasestorage.app",
  messagingSenderId: "79928667667",
  appId: "1:79928667667:web:6d1207e63b6ff4d04219e6",
};

function firebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function clientAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  return getAuth(firebaseApp());
}

export function clientDb(): Firestore | null {
  if (typeof window === "undefined") return null;
  return getFirestore(firebaseApp());
}

export function sessionFromUser(user: User): SessionUser | null {
  const account = staffByEmail(user.email);
  if (!account || !user.email) return null;
  return {
    id: user.uid,
    email: account.email,
    name: account.name,
    role: account.role,
  };
}

export function watchSession(onChange: (user: SessionUser | null) => void) {
  const auth = clientAuth();
  if (!auth) return () => undefined;
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (!firebaseUser) {
      onChange(null);
      return;
    }
    const session = sessionFromUser(firebaseUser);
    if (!session) {
      void signOut(auth);
      onChange(null);
      return;
    }
    onChange(session);
  });
}

function authError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code === "auth/invalid-credential" || code === "auth/invalid-email" || code === "auth/user-not-found" || code === "auth/wrong-password") {
    return "Identifiant ou mot de passe incorrect.";
  }
  if (code === "auth/operation-not-allowed") {
    return "L'authentification par e-mail n'est pas encore activée dans Firebase.";
  }
  if (code === "auth/unauthorized-domain") {
    return "Ce site n'est pas autorisé dans Firebase. Ajoutez le domaine dans Authentication, puis Authorized domains.";
  }
  if (code === "auth/too-many-requests") {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }
  if (code === "auth/network-request-failed") {
    return "Impossible de joindre Firebase.";
  }
  return "La connexion a échoué.";
}

export async function signIn(email: string, password: string): Promise<Result<SessionUser>> {
  const auth = clientAuth();
  if (!auth) return { ok: false, error: "La connexion Firebase est indisponible." };
  const account = staffByEmail(email);
  if (!account) return { ok: false, error: "Ce compte n'est pas autorisé sur ADTP Fiches." };
  try {
    const credential = await signInWithEmailAndPassword(auth, account.email, password);
    const session = sessionFromUser(credential.user);
    if (!session) return { ok: false, error: "Ce compte n'est pas autorisé sur ADTP Fiches." };
    return { ok: true, data: session };
  } catch (error) {
    return { ok: false, error: authError(error) };
  }
}

export async function signOutSession() {
  const auth = clientAuth();
  if (auth) await signOut(auth);
}

export function staffAccounts() {
  return STAFF.map(({ name, email, password, role }) => ({ name, email, password, role }));
}
