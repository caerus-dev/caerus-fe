"use client";

import { useState, useEffect, useCallback } from "react";
import { UserResponse } from "@/types/billing";

const USER_UPDATED_EVENT = "caerus:user-updated";

export function triggerUserRefresh(updatedUser?: UserResponse) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: updatedUser }));
  }
}

export function useUser() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/me", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          return null;
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || "Failed to fetch user");
      }
      const data: UserResponse = await res.json();
      setUser(data);
      return data;
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Error al cargar perfil de usuario");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const handleRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<UserResponse | undefined>;
      if (customEvent.detail) {
        setUser(customEvent.detail);
      }
      fetchUser();
    };

    window.addEventListener(USER_UPDATED_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, handleRefresh);
    };
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    refreshUser: fetchUser,
    hasValidPaymentMethod: Boolean(user?.hasValidPaymentMethod),
  };
}
