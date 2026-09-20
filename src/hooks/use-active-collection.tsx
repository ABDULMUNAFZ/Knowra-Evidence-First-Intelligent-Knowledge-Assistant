import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCollections } from "@/lib/collections.functions";

const KEY = "knowra.activeCollection";

export type CollectionSummary = Awaited<ReturnType<typeof listCollections>>[number];

interface Ctx {
  collections: CollectionSummary[];
  activeId: string | null;
  active: CollectionSummary | null;
  setActiveId: (id: string | null) => void;
  isLoading: boolean;
  refetch: () => void;
}

const CollectionContext = createContext<Ctx | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["collections"],
    queryFn: () => listCollections(),
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored) setActiveIdState(stored);
  }, []);

  const collections = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    if (collections.length === 0) return;
    if (!activeId || !collections.some((c) => c.id === activeId)) {
      setActiveIdState(collections[0]!.id);
    }
  }, [collections, activeId]);

  const setActiveId = (id: string | null) => {
    setActiveIdState(id);
    if (id) window.localStorage.setItem(KEY, id);
    else window.localStorage.removeItem(KEY);
  };

  const value: Ctx = {
    collections,
    activeId,
    active: collections.find((c) => c.id === activeId) ?? null,
    setActiveId,
    isLoading,
    refetch: () => void refetch(),
  };

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useActiveCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error("useActiveCollection must be used inside CollectionProvider");
  return ctx;
}
