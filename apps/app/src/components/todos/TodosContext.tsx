import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import * as repository from "../../lib/todos/repository";
import { parseRecurringTodoTitle } from "../../lib/todos/recurrence";
import type {
  CreateTodoTaskInput,
  TodoData,
  TodoList,
  TodoPreferences,
  TodoRecurringSeries,
  TodoScope,
  TodoTask,
  UpdateRecurringTodoInput,
} from "../../lib/todos/types";

export type TodosStatus = "loading" | "ready" | "error";

export interface TodosContextValue extends TodoData {
  status: TodosStatus;
  error: string | null;
  lastDeletedTask: TodoTask | null;
  refresh: () => void;
  getTasksForDate: (date: string) => TodoTask[];
  getTasksForList: (listId: string) => TodoTask[];
  createTask: (input: CreateTodoTaskInput) => Promise<TodoTask>;
  updateTask: (
    id: string,
    updates: Partial<
      Pick<TodoTask, "title" | "notes" | "dueDate" | "listId" | "position">
    >,
  ) => Promise<TodoTask>;
  toggleTask: (id: string, completed: boolean) => void;
  deleteTask: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  moveTask: (id: string, target: TodoScope) => Promise<TodoTask>;
  placeTask: (
    id: string,
    target: TodoScope,
    overTaskId?: string,
  ) => Promise<void>;
  createList: (name: string) => Promise<TodoList>;
  updateList: (
    id: string,
    updates: Partial<Pick<TodoList, "name" | "sharedNote" | "shareToken">>,
  ) => Promise<TodoList>;
  moveList: (id: string, direction: -1 | 1) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  updatePreferences: (
    updates: Partial<TodoPreferences>,
  ) => Promise<TodoPreferences>;
  updateRecurringTodo: (
    id: string,
    updates: UpdateRecurringTodoInput,
  ) => Promise<TodoRecurringSeries>;
  deleteRecurringTodo: (id: string) => Promise<void>;
}

const TodosContext = createContext<TodosContextValue | undefined>(undefined);

const DEFAULT_PREFERENCES: TodoPreferences = {
  columnCount: 5,
  bulletStyle: "none",
  focusMinutes: 25,
};

function sortTasks(tasks: TodoTask[]): TodoTask[] {
  return [...tasks].sort((a, b) => {
    const aScope = a.dueDate ?? a.listId ?? "";
    const bScope = b.dueDate ?? b.listId ?? "";
    const scopeOrder = aScope.localeCompare(bScope);
    if (scopeOrder !== 0) return scopeOrder;
    const positionOrder = a.position - b.position;
    if (positionOrder !== 0) return positionOrder;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function sortLists(lists: TodoList[]): TodoList[] {
  return [...lists].sort((a, b) => {
    const positionOrder = a.position - b.position;
    if (positionOrder !== 0) return positionOrder;
    return a.name.localeCompare(b.name);
  });
}

function sortSeries(series: TodoRecurringSeries[]): TodoRecurringSeries[] {
  return [...series].sort((a, b) => {
    const positionOrder = a.position - b.position;
    if (positionOrder !== 0) return positionOrder;
    return a.title.localeCompare(b.title);
  });
}

function taskMatchesScope(task: TodoTask, scope: TodoScope): boolean {
  return scope.kind === "date"
    ? task.dueDate === scope.date && task.listId === null
    : task.listId === scope.listId && task.dueDate === null;
}

function scopeUpdates(scope: TodoScope) {
  return scope.kind === "date"
    ? { dueDate: scope.date, listId: null }
    : { dueDate: null, listId: scope.listId };
}

export function TodosContextProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [recurringSeries, setRecurringSeries] = useState<TodoRecurringSeries[]>(
    [],
  );
  const [preferences, setPreferences] =
    useState<TodoPreferences>(DEFAULT_PREFERENCES);
  const [status, setStatus] = useState<TodosStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastDeletedTask, setLastDeletedTask] = useState<TodoTask | null>(null);

  const refresh = useCallback(() => {
    repository.fetchTodoData().then(
      (data) => {
        setTasks(sortTasks(data.tasks));
        setLists(sortLists(data.lists));
        setRecurringSeries(sortSeries(data.recurringSeries));
        setPreferences(data.preferences);
        setStatus("ready");
        setError(null);
      },
      (e: unknown) => {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Failed to load to-dos");
      },
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getTasksForDate = useCallback(
    (date: string) =>
      sortTasks(
        tasks.filter((task) => task.dueDate === date && task.listId === null),
      ),
    [tasks],
  );

  const getTasksForList = useCallback(
    (listId: string) =>
      sortTasks(
        tasks.filter((task) => task.listId === listId && task.dueDate === null),
      ),
    [tasks],
  );

  const createTask = useCallback(async (input: CreateTodoTaskInput) => {
    const title = input.title.trim();
    if (title.length === 0) {
      throw new Error("Todo title cannot be empty");
    }

    const parsed =
      input.dueDate && !input.listId
        ? parseRecurringTodoTitle(title)
        : { recurring: false as const, title };

    if (parsed.recurring && input.dueDate && !input.listId) {
      const created = await repository.createRecurringTodo({
        title: parsed.title,
        notes: input.notes,
        frequency: parsed.frequency,
        startDate: input.dueDate,
      });
      setRecurringSeries((prev) => sortSeries([...prev, created.series]));
      setTasks((prev) => sortTasks([...prev, created.task]));
      return created.task;
    }

    const task = await repository.createTask({
      ...input,
      title: parsed.title,
    });
    setTasks((prev) => sortTasks([...prev, task]));
    return task;
  }, []);

  const updateTask = useCallback(
    async (
      id: string,
      updates: Partial<
        Pick<TodoTask, "title" | "notes" | "dueDate" | "listId" | "position">
      >,
    ) => {
      const task = await repository.updateTask(id, updates);
      setTasks((prev) =>
        sortTasks(prev.map((entry) => (entry.id === id ? task : entry))),
      );
      return task;
    },
    [],
  );

  const toggleTask = useCallback(
    (id: string, completed: boolean) => {
      const completedAt = completed ? new Date().toISOString() : null;
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, completedAt } : task)),
      );
      void repository.setTaskCompletion(id, completed).then(
        (task) => {
          setTasks((prev) =>
            sortTasks(prev.map((entry) => (entry.id === id ? task : entry))),
          );
        },
        () => refresh(),
      );
    },
    [refresh],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const current = tasks.find((task) => task.id === id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      try {
        const deleted = await repository.deleteTask(id);
        setLastDeletedTask(deleted);
      } catch (e) {
        if (current) setTasks((prev) => sortTasks([...prev, current]));
        throw e;
      }
    },
    [tasks],
  );

  const undoDelete = useCallback(async () => {
    if (!lastDeletedTask) return;
    const task = await repository.restoreTask(lastDeletedTask);
    setTasks((prev) => sortTasks([...prev, task]));
    setLastDeletedTask(null);
  }, [lastDeletedTask]);

  const moveTask = useCallback(async (id: string, target: TodoScope) => {
    const task = await repository.moveTask(id, target);
    setTasks((prev) =>
      sortTasks(prev.map((entry) => (entry.id === id ? task : entry))),
    );
    return task;
  }, []);

  const placeTask = useCallback(
    async (id: string, target: TodoScope, overTaskId?: string) => {
      const active = tasks.find((task) => task.id === id);
      if (!active) return;

      const withoutActive = tasks.filter((task) => task.id !== id);
      const movedTask: TodoTask = {
        ...active,
        ...scopeUpdates(target),
      };
      const targetTasks = withoutActive.filter((task) =>
        taskMatchesScope(task, target),
      );
      const insertAt =
        overTaskId === undefined
          ? targetTasks.length
          : Math.max(
              0,
              targetTasks.findIndex((task) => task.id === overTaskId),
            );
      const nextTargetTasks = [...targetTasks];
      nextTargetTasks.splice(insertAt, 0, movedTask);

      const positionedTargetTasks = nextTargetTasks.map((task, index) => ({
        ...task,
        position: (index + 1) * 1000,
      }));
      const targetIds = new Set(positionedTargetTasks.map((task) => task.id));
      const nextTasks = sortTasks([
        ...withoutActive.filter((task) => !targetIds.has(task.id)),
        ...positionedTargetTasks,
      ]);
      setTasks(nextTasks);

      try {
        const finalActive = positionedTargetTasks.find(
          (task) => task.id === id,
        );
        await repository.updateTask(id, {
          ...scopeUpdates(target),
          position: finalActive?.position ?? 1000,
        });
        await repository.reorderTasks(positionedTargetTasks);
      } catch (e) {
        refresh();
        throw e;
      }
    },
    [refresh, tasks],
  );

  const createList = useCallback(async (name: string) => {
    const list = await repository.createList(name);
    setLists((prev) => sortLists([...prev, list]));
    return list;
  }, []);

  const updateList = useCallback(
    async (
      id: string,
      updates: Partial<Pick<TodoList, "name" | "sharedNote" | "shareToken">>,
    ) => {
      const list = await repository.updateList(id, updates);
      setLists((prev) =>
        sortLists(prev.map((entry) => (entry.id === id ? list : entry))),
      );
      return list;
    },
    [],
  );

  const moveList = useCallback(
    async (id: string, direction: -1 | 1) => {
      const currentIndex = lists.findIndex((list) => list.id === id);
      const targetIndex = currentIndex + direction;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= lists.length) {
        return;
      }
      const nextLists = [...lists];
      const moving = nextLists[currentIndex];
      if (!moving) return;
      nextLists.splice(currentIndex, 1);
      nextLists.splice(targetIndex, 0, moving);
      const positioned = nextLists.map((list, index) => ({
        ...list,
        position: (index + 1) * 1000,
      }));
      setLists(positioned);
      try {
        await repository.reorderLists(positioned);
      } catch (e) {
        refresh();
        throw e;
      }
    },
    [lists, refresh],
  );

  const deleteList = useCallback(async (id: string) => {
    await repository.deleteList(id);
    setLists((prev) => prev.filter((list) => list.id !== id));
    setTasks((prev) => prev.filter((task) => task.listId !== id));
  }, []);

  const updatePreferences = useCallback(
    async (updates: Partial<TodoPreferences>) => {
      const nextPreferences = { ...preferences, ...updates };
      setPreferences(nextPreferences);
      try {
        const saved = await repository.updatePreferences(updates);
        setPreferences(saved);
        return saved;
      } catch (e) {
        setPreferences(preferences);
        throw e;
      }
    },
    [preferences],
  );

  const updateRecurringTodo = useCallback(
    async (id: string, updates: UpdateRecurringTodoInput) => {
      const series = await repository.updateRecurringTodo(id, updates);
      await repository.fetchTodoData().then((data) => {
        setTasks(sortTasks(data.tasks));
        setRecurringSeries(sortSeries(data.recurringSeries));
      });
      return series;
    },
    [],
  );

  const deleteRecurringTodo = useCallback(async (id: string) => {
    await repository.deleteRecurringTodo(id);
    setRecurringSeries((prev) => prev.filter((series) => series.id !== id));
    setTasks((prev) => prev.filter((task) => task.recurringSeriesId !== id));
  }, []);

  const value = useMemo<TodosContextValue>(
    () => ({
      tasks,
      lists,
      recurringSeries,
      preferences,
      status,
      error,
      lastDeletedTask,
      refresh,
      getTasksForDate,
      getTasksForList,
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
      undoDelete,
      moveTask,
      placeTask,
      createList,
      updateList,
      moveList,
      deleteList,
      updatePreferences,
      updateRecurringTodo,
      deleteRecurringTodo,
    }),
    [
      tasks,
      lists,
      recurringSeries,
      preferences,
      status,
      error,
      lastDeletedTask,
      refresh,
      getTasksForDate,
      getTasksForList,
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
      undoDelete,
      moveTask,
      placeTask,
      createList,
      updateList,
      moveList,
      deleteList,
      updatePreferences,
      updateRecurringTodo,
      deleteRecurringTodo,
    ],
  );

  return (
    <TodosContext.Provider value={value}>{children}</TodosContext.Provider>
  );
}

export function useTodosContext() {
  const context = useContext(TodosContext);
  if (context === undefined) {
    throw new Error(
      "useTodosContext must be used within a TodosContextProvider",
    );
  }
  return context;
}
