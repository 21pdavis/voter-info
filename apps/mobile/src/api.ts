import { useAuth } from "@clerk/expo";
import { useCallback } from "react";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export type Legislator = {
  id?: number;
  fullName: string;
  role: string;
  party: string | null;
  state: string;
  district: string | null;
};

export type Me = {
  userId: string;
  sessionId: string;
};

// Wraps fetch with the Clerk session token so the API can verify the caller.
// getToken() returns null when signed out, in which case we just omit the header.
export function useApi() {
  const { getToken } = useAuth();

  const request = useCallback(
    async <T,>(path: string): Promise<T> => {
      const token = await getToken();
      const res = await fetch(`${API_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    },
    [getToken],
  );

  const getLegislators = useCallback(
    () => request<{ data: Legislator[] }>("/api/legislators"),
    [request],
  );

  const getMe = useCallback(() => request<Me>("/api/me"), [request]);

  return { getLegislators, getMe };
}
