export const AUTH_STORAGE_KEY = "tijaruk-auth";
export const AUTH_CHANGED_EVENT = "tijaruk-auth-changed";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  role_type?: "GUEST" | "USER" | string;
  full_name?: string;
  username?: string;
  photo?: string;
};

export type AuthSession = {
  access: string;
  refresh: string;
  user: AuthUser;
};

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value =
      window.localStorage.getItem(AUTH_STORAGE_KEY) ||
      window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession, remember = false) {
  const storage = remember ? window.localStorage : window.sessionStorage;
  const otherStorage = remember ? window.sessionStorage : window.localStorage;

  otherStorage.removeItem(AUTH_STORAGE_KEY);
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
