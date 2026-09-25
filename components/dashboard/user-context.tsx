"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserResponse } from "@/types/billing";

const USER_UPDATED_EVENT = "caerus:user-updated";

export function triggerUserRefresh(updatedUser?: UserResponse) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: updatedUser }));
  }
}

export interface Auth0User {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  nickname?: string;
}

export interface UserContextType {
  user: UserResponse | null;
  sessionUser: Auth0User | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<UserResponse | null>;
  hasValidPaymentMethod: boolean;
}

export const defaultContext: UserContextType = {
  user: null,
  sessionUser: null,
  isLoading: false,
  error: null,
  refreshUser: async () => null,
  hasValidPaymentMethod: false,
};

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [sessionUser, setSessionUser] = useState<Auth0User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionUser = useCallback(async (checkMounted?: () => boolean) => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        if ((!checkMounted || checkMounted()) && data && data.user) {
          setSessionUser(data.user);
        }
      }
    } catch (err) {
      console.error("Error fetching session user:", err);
    }
  }, []);

  const fetchUser = useCallback(async (checkMounted?: () => boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/me", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          if (!checkMounted || checkMounted()) {
            setUser(null);
          }
          return null;
        }
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.message || errJson.error || "Failed to fetch user";
        if (!checkMounted || checkMounted()) {
          setUser(null);
          setError(errMsg);
        }
        return null;
      }
      const data: UserResponse = await res.json();
      if (!checkMounted || checkMounted()) {
        setUser(data);
      }
      return data;
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      if (!checkMounted || checkMounted()) {
        setError(err.message || "Error al cargar perfil de usuario");
      }
      return null;
    } finally {
      if (!checkMounted || checkMounted()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkMounted = () => isMounted;

    fetchUser(checkMounted);
    fetchSessionUser(checkMounted);

    const handleRefresh = (event: Event) => {
      if (!isMounted) return;
      const customEvent = event as CustomEvent<UserResponse | undefined>;
      if (customEvent.detail) {
        setUser(customEvent.detail);
      }
      fetchUser(checkMounted);
      fetchSessionUser(checkMounted);
    };

    window.addEventListener(USER_UPDATED_EVENT, handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener(USER_UPDATED_EVENT, handleRefresh);
    };
  }, [fetchUser, fetchSessionUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        sessionUser,
        isLoading,
        error,
        refreshUser: () => fetchUser(),
        hasValidPaymentMethod: Boolean(user?.hasValidPaymentMethod),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context !== null) {
    return context;
  }
  return defaultContext;
}
