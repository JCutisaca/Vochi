"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { initializeFirebaseAuth, subscribeToAuthState } from "@/lib/auth-client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    void initializeFirebaseAuth()
      .then(() => {
        unsubscribe = subscribeToAuthState((nextUser) => {
          if (!mounted) {
            return;
          }

          setUser(nextUser);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error("No se pudo inicializar Firebase Auth", error);
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de Providers");
  }

  return context;
}
