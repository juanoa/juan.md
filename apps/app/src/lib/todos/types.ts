export type TodoFrequency =
  | "daily"
  | "every_other_day"
  | "weekdays"
  | "weekly"
  | "every_other_week"
  | "monthly"
  | "yearly";

export type TodoBulletStyle = "none" | "circle" | "square" | "indent";

export interface TodoTask {
  id: string;
  title: string;
  notes: string;
  dueDate: string | null;
  listId: string | null;
  completedAt: string | null;
  position: number;
  recurringSeriesId: string | null;
  createdAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  position: number;
  isDefault: boolean;
  shareToken: string | null;
  sharedNote: string;
}

export interface TodoRecurringSeries {
  id: string;
  title: string;
  notes: string;
  frequency: TodoFrequency;
  startDate: string;
  anchorDate: string;
  position: number;
  active: boolean;
}

export interface TodoPreferences {
  columnCount: 1 | 3 | 5 | 7;
  bulletStyle: TodoBulletStyle;
  focusMinutes: number;
}

export interface TodoData {
  tasks: TodoTask[];
  lists: TodoList[];
  recurringSeries: TodoRecurringSeries[];
  preferences: TodoPreferences;
}

export type TodoScope =
  | { kind: "date"; date: string }
  | { kind: "list"; listId: string };

export interface CreateTodoTaskInput {
  title: string;
  notes?: string;
  dueDate?: string;
  listId?: string;
  atTop?: boolean;
}

export interface CreateRecurringTodoInput {
  title: string;
  notes?: string;
  frequency: TodoFrequency;
  startDate: string;
}

export interface UpdateRecurringTodoInput {
  title?: string;
  notes?: string;
  frequency?: TodoFrequency;
  startDate?: string;
}
