"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserResponse } from "@/types/billing";

const USER_UPDATED_EVENT = "caerus:user-updated";

export function triggerUserRefresh(updatedUser?: UserResponse) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: updatedUser }));
  }
}

export interface UserContextType {
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<UserResponse | null>;
  hasValidPaymentMethod: boolean;
}

export const defaultContext: UserContextType = {
  user: null,
  isLoading: false,
  error: null,
  refreshUser: async () => null,
  hasValidPaymentMethod: false,
};

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

    const handleRefresh = (event: Event) => {
      if (!isMounted) return;
      const customEvent = event as CustomEvent<UserResponse | undefined>;
      if (customEvent.detail) {
        setUser(customEvent.detail);
      }
      fetchUser(checkMounted);
    };

    window.addEventListener(USER_UPDATED_EVENT, handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener(USER_UPDATED_EVENT, handleRefresh);
    };
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
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
