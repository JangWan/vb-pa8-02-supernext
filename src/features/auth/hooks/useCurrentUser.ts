"use client";

import { useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import type { CurrentUserContextValue } from "../types";

export const useCurrentUser = (): CurrentUserContextValue => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  return useMemo(() => {
    const isLoaded = authLoaded && userLoaded;

    if (!isLoaded) {
      return {
        status: "loading",
        user: null,
        isAuthenticated: false,
        isLoading: true,
        refresh: async () => {},
      };
    }

    if (!isSignedIn || !user) {
      return {
        status: "unauthenticated",
        user: null,
        isAuthenticated: false,
        isLoading: false,
        refresh: async () => {},
      };
    }

    const currentUser = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? null,
      appMetadata: {},
      userMetadata: (user.publicMetadata as Record<string, unknown>) ?? {},
    };

    return {
      status: "authenticated",
      user: currentUser,
      isAuthenticated: true,
      isLoading: false,
      refresh: async () => {
        await user.reload();
      },
    };
  }, [authLoaded, userLoaded, isSignedIn, user]);
};
