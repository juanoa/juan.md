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
import type {
  Exercise,
  ExerciseDeleteResult,
  ExerciseInput,
  PerformedSet,
  Session,
  SessionDraft,
} from "../../lib/gym/types";

export type GymStatus = "loading" | "ready" | "error";

export interface GymContextValue {
  sessions: Session[];
  exercises: Exercise[];
  status: GymStatus;
  error: string | null;
  getSession: (id: string) => Session | undefined;
  getSessionsByDate: (date: string) => Session[];
  moveSession: (id: string, newDate: string) => void;
  recordSet: (
    sessionId: string,
    plannedExerciseId: string,
    setIndex: number,
    set: PerformedSet,
  ) => void;
  recordExerciseNotes: (
    sessionId: string,
    plannedExerciseId: string,
    notes: string,
  ) => void;
  finishSession: (id: string) => void;
  deleteSession: (id: string) => Promise<void>;
  createExercise: (input: ExerciseInput) => Promise<Exercise>;
  updateExercise: (id: string, input: ExerciseInput) => Promise<Exercise>;
  deleteExercise: (id: string) => Promise<ExerciseDeleteResult>;
  createSession: (draft: SessionDraft) => Promise<Session>;
  updateSession: (id: string, draft: SessionDraft) => Promise<Session>;
}

const GymContext = createContext<GymContextValue | undefined>(undefined);

interface GymContextProviderProps {
  children: ReactNode;
}

function sortSessions(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => {
    const dateOrder = a.date.localeCompare(b.date);
    if (dateOrder !== 0) return dateOrder;
    return a.id.localeCompare(b.id);
  });
}

function sortExercises(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => a.name.localeCompare(b.name));
}

export function GymContextProvider({ children }: GymContextProviderProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [status, setStatus] = useState<GymStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    Promise.all([repository.fetchSessions(), repository.fetchExercises()]).then(
      ([sessionsData, exercisesData]) => {
        setSessions(sessionsData);
        setExercises(exercisesData);
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

  const getSessionsByDate = useCallback(
    (date: string) => sessions.filter((session) => session.date === date),
    [sessions],
  );

  const moveSession = useCallback(
    (id: string, newDate: string) => {
      let rolledBack = false;
      setSessions((prev) => {
        const moving = prev.find((session) => session.id === id);
        if (!moving) return prev;
        if (moving.date === newDate) return prev;
        return sortSessions(
          prev.map((session) =>
            session.id === id ? { ...session, date: newDate } : session,
          ),
        );
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
            performed: [...others, { plannedExerciseId, sets: existingSets }],
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

  const recordExerciseNotes = useCallback(
    (sessionId: string, plannedExerciseId: string, notes: string) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;
          return {
            ...session,
            status:
              session.status === "planned" ? "in_progress" : session.status,
            exercises: session.exercises.map((exercise) =>
              exercise.id === plannedExerciseId
                ? { ...exercise, notes }
                : exercise,
            ),
          };
        }),
      );
      void repository
        .recordExerciseNotes(sessionId, plannedExerciseId, notes)
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

  const deleteSession = useCallback(async (id: string) => {
    await repository.deleteSession(id);
    setSessions((prev) => prev.filter((session) => session.id !== id));
  }, []);

  const createExercise = useCallback(async (input: ExerciseInput) => {
    const exercise = await repository.createExercise(input);
    setExercises((prev) => sortExercises([...prev, exercise]));
    return exercise;
  }, []);

  const updateExercise = useCallback(
    async (id: string, input: ExerciseInput) => {
      const exercise = await repository.updateExercise(id, input);
      setExercises((prev) =>
        sortExercises(
          prev.map((entry) => (entry.id === id ? exercise : entry)),
        ),
      );
      setSessions((prev) =>
        prev.map((session) => ({
          ...session,
          exercises: session.exercises.map((entry) =>
            entry.exerciseId === id
              ? {
                  ...entry,
                  name: exercise.name,
                  weightType: exercise.weightType,
                  targetWeight:
                    exercise.weightType === "weighted"
                      ? entry.targetWeight
                      : null,
                }
              : entry,
          ),
        })),
      );
      return exercise;
    },
    [],
  );

  const deleteExercise = useCallback(async (id: string) => {
    const result = await repository.deleteExercise(id);
    setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
    return result;
  }, []);

  const createSession = useCallback(async (draft: SessionDraft) => {
    const session = await repository.createSession(draft);
    setSessions((prev) => sortSessions([...prev, session]));
    return session;
  }, []);

  const updateSession = useCallback(async (id: string, draft: SessionDraft) => {
    const session = await repository.updateSession(id, draft);
    setSessions((prev) =>
      prev
        .map((entry) => (entry.id === id ? session : entry))
        .sort((a, b) => a.date.localeCompare(b.date)),
    );
    return session;
  }, []);

  const value = useMemo<GymContextValue>(
    () => ({
      sessions,
      exercises,
      status,
      error,
      getSession,
      getSessionsByDate,
      moveSession,
      recordSet,
      recordExerciseNotes,
      finishSession,
      deleteSession,
      createExercise,
      updateExercise,
      deleteExercise,
      createSession,
      updateSession,
    }),
    [
      sessions,
      exercises,
      status,
      error,
      getSession,
      getSessionsByDate,
      moveSession,
      recordSet,
      recordExerciseNotes,
      finishSession,
      deleteSession,
      createExercise,
      updateExercise,
      deleteExercise,
      createSession,
      updateSession,
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
