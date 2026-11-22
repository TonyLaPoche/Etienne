import type { SessionUser } from "@/lib/types";

export const STAFF = [
  {
    email: "admin@adtp.com",
    password: "admin123",
    name: "Admin ADTP",
    role: "admin" as const,
  },
  {
    email: "etienne@adtp.com",
    password: "etienne123",
    name: "Étienne",
    role: "operateur" as const,
  },
];

export function staffByEmail(email: string | null | undefined) {
  if (!email) return undefined;
  return STAFF.find((account) => account.email === email.trim().toLowerCase());
}

export function roleLabel(role: SessionUser["role"]) {
  return role === "admin" ? "Administrateur" : "Opérateur";
}
