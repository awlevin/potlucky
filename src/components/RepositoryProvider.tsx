"use client";

import { createContext, useContext, useMemo } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { SupabaseRoomRepository } from "@/lib/data/supabase-repository";
import type { RoomRepository } from "@/lib/data";

const RepositoryContext = createContext<RoomRepository | null>(null);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const repository = useMemo<RoomRepository>(() => {
    const supabase = createBrowserSupabase();
    return new SupabaseRoomRepository(supabase);
  }, []);

  return (
    <RepositoryContext.Provider value={repository}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository(): RoomRepository {
  const repo = useContext(RepositoryContext);
  if (!repo) {
    throw new Error("useRepository must be used inside <RepositoryProvider>");
  }
  return repo;
}
