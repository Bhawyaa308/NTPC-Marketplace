// Mock client-side auth for the NTPC Marketplace frontend.
// Persists role in localStorage so guards work across reloads.

export type Role = "employee" | "admin" | "super";
export interface AuthData {
  token: string;
  user: {
  user_id: number;
  name: string;
  email: string;
  role_id: number;
};
  role: Role;
}
const KEY = "ntpc.auth";

export function getAuth(): AuthData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(data: AuthData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function isAuthenticated(): boolean {
  return getAuth() !== null;
}

export function roleFromEmail(email: string): Role {
  const e = email.toLowerCase();
  if (e.includes("super")) return "super";
  if (e.includes("admin")) return "admin";
  return "employee";
}

export function landingForRole(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "super") return "/super-admin";
  return "/marketplace";
}
