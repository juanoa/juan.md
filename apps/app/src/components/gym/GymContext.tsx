import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import * as repository from "../../lib/gym/repository";
import type { PerformedSet, Session } from "../../lib/gym/types";

export type GymStatus = "loading" | "ready" | "error";

export interface GymContextValue {
  sessions: Session[];
  status: GymStatus;
  error: string | null;
  getSession: (id: string) => Session | undefined;
  getSessionByDate: (date: string) => Session | undefined;
  moveSession: (id: string, newDate: string) => void;
  recordSet: (
    sessionId: string,
    plannedExerciseId: string,
    setIndex: number,
    set: PerformedSet,
  ) => void;
  finishSession: (id: string) => void;
}

const GymContext = createContext<GymContextValue | undefined>(undefined);

interface GymContextProviderProps {
  children: ReactNode;
}

export function GymContextProvider({ children }: GymContextProviderProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [status, setStatus] = useState<GymStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    repository.fetchSessions().then(
      (data) => {
        setSessions(data);
        setStatus("ready");
        setError(null);
      },
      (e: unknown) => {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Failed to load sessions");
      },
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getSession = useCallback(
    (id: string) => sessions.find((session) => session.id === id),
    [sessions],
  );

  const getSessionByDate = useCallback(
    (date: string) => sessions.find((session) => session.date === date),
    [sessions],
  );

  const moveSession = useCallback(
    (id: string, newDate: string) => {
      let rolledBack = false;
      setSessions((prev) => {
        const moving = prev.find((session) => session.id === id);
        if (!moving) return prev;
        const oldDate = moving.date;
        if (oldDate === newDate) return prev;
        const occupant = prev.find(
          (session) => session.date === newDate && session.id !== id,
        );
        return prev.map((session) => {
          if (session.id === id) return { ...session, date: newDate };
          if (occupant && session.id === occupant.id) {
            return { ...session, date: oldDate };
          }
          return session;
        });
      });
      void repository.moveSession(id, newDate).catch(() => {
        if (rolledBack) return;
        rolledBack = true;
        void refresh();
      });
    },
    [refresh],
  );

  const recordSet = useCallback(
    (
      sessionId: string,
      plannedExerciseId: string,
      setIndex: number,
      set: PerformedSet,
    ) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;
          const existing = session.performed.find(
            (entry) => entry.plannedExerciseId === plannedExerciseId,
          );
          const others = session.performed.filter(
            (entry) => entry.plannedExerciseId !== plannedExerciseId,
          );
          const existingSets = existing ? [...existing.sets] : [];
          while (existingSets.length <= setIndex) {
            existingSets.push({ reps: 0, weight: 0 });
          }
          existingSets[setIndex] = set;
          return {
            ...session,
            status:
              session.status === "planned" ? "in_progress" : session.status,
            performed: [
              ...others,
              { plannedExerciseId, sets: existingSets },
            ],
          };
        }),
      );
      void repository
        .recordSet(sessionId, plannedExerciseId, setIndex, set)
        .catch(() => {
          void refresh();
        });
    },
    [refresh],
  );

  const finishSession = useCallback(
    (id: string) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, status: "completed" } : session,
        ),
      );
      void repository.finishSession(id).catch(() => {
        void refresh();
      });
    },
    [refresh],
  );

  const value = useMemo<GymContextValue>(
    () => ({
      sessions,
      status,
      error,
      getSession,
      getSessionByDate,
      moveSession,
      recordSet,
      finishSession,
    }),
    [
      sessions,
      status,
      error,
      getSession,
      getSessionByDate,
      moveSession,
      recordSet,
      finishSession,
    ],
  );

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}

export function useGymContext() {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error("useGymContext must be used within a GymContextProvider");
  }
  return context;
}
