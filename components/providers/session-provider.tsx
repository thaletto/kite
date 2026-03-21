"use client";
import { createContext, useContext } from "react";
import type { FullSession } from "@/types/auth";

const SessionContext = createContext<FullSession | null>(null);

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: FullSession | null;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
