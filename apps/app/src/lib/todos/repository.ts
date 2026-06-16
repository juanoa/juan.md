import { supabase } from "../supabase/client";
import { addDaysISO, todayISO } from "./date";
import type {
  CreateRecurringTodoInput,
  CreateTodoTaskInput,
  TodoData,
  TodoList,
  TodoPreferences,
  TodoRecurringSeries,
  TodoScope,
  TodoTask,
  UpdateRecurringTodoInput,
} from "./types";

interface TodoTaskRow {
  id: string;
  title: string;
  notes: string;
  due_date: string | null;
  list_id: string | null;
  completed_at: string | null;
  position: number;
  recurring_series_id: string | null;
  created_at: string;
}

interface TodoListRow {
  id: string;
  name: string;
  position: number;
  is_default: boolean;
  share_token: string | null;
  shared_note: string;
}

interface TodoRecurringSeriesRow {
  id: string;
  title: string;
  notes: string;
  frequency: TodoRecurringSeries["frequency"];
  start_date: string;
  anchor_date: string;
  position: number;
  active: boolean;
}

interface TodoPreferencesRow {
  column_count: TodoPreferences["columnCount"];
  bullet_style: TodoPreferences["bulletStyle"];
  focus_minutes: number;
}

function mapTask(row: TodoTaskRow): TodoTask {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    dueDate: row.due_date,
    listId: row.list_id,
    completedAt: row.completed_at,
    position: row.position,
    recurringSeriesId: row.recurring_series_id,
    createdAt: row.created_at,
  };
}

function mapList(row: TodoListRow): TodoList {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    isDefault: row.is_default,
    shareToken: row.share_token,
    sharedNote: row.shared_note,
  };
}

function mapRecurringSeries(row: TodoRecurringSeriesRow): TodoRecurringSeries {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    frequency: row.frequency,
    startDate: row.start_date,
    anchorDate: row.anchor_date,
    position: row.position,
    active: row.active,
  };
}

function mapPreferences(row: TodoPreferencesRow): TodoPreferences {
  return {
    columnCount: row.column_count,
    bulletStyle: row.bullet_style,
    focusMinutes: row.focus_minutes,
  };
}

function scopeFilter(scope: TodoScope) {
  return scope.kind === "date"
    ? { due_date: scope.date, list_id: null }
    : { due_date: null, list_id: scope.listId };
}

async function ensurePreferences(): Promise<TodoPreferences> {
  const { data: existing, error: selectError } = await supabase
    .from("todo_preferences")
    .select("column_count, bullet_style, focus_minutes")
    .eq("id", true)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return mapPreferences(existing as TodoPreferencesRow);

  const { data, error } = await supabase
    .from("todo_preferences")
    .insert({ id: true })
    .select("column_count, bullet_style, focus_minutes")
    .single();
  if (error) throw error;
  return mapPreferences(data as TodoPreferencesRow);
}

async function fetchListsWithDefault(): Promise<TodoList[]> {
  const { data: existing, error: selectError } = await supabase
    .from("todo_lists")
    .select("id, name, position, is_default, share_token, shared_note")
    .order("position", { ascending: true });
  if (selectError) throw selectError;

  const lists = (existing as TodoListRow[]).map(mapList);
  if (lists.length > 0) return lists;

  const { data, error } = await supabase
    .from("todo_lists")
    .insert({ name: "Someday", position: 1000, is_default: true })
    .select("id, name, position, is_default, share_token, shared_note")
    .single();
  if (error) throw error;
  return [mapList(data as TodoListRow)];
}

export async function fetchTodoData(): Promise<TodoData> {
  const horizon = addDaysISO(todayISO(), 180);
  const preferences = await ensurePreferences();
  const lists = await fetchListsWithDefault();

  const { error: generateError } = await supabase.rpc(
    "todos_generate_recurring",
    { p_until: horizon },
  );
  if (generateError) throw generateError;

  const { error: rolloverError } = await supabase.rpc("todos_roll_over", {
    p_target_date: todayISO(),
  });
  if (rolloverError) throw rolloverError;

  const [tasksResult, recurringResult] = await Promise.all([
    supabase
      .from("todo_tasks")
      .select(
        "id, title, notes, due_date, list_id, completed_at, position, recurring_series_id, created_at",
      )
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("todo_recurring_series")
      .select(
        "id, title, notes, frequency, start_date, anchor_date, position, active",
      )
      .eq("active", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (tasksResult.error) throw tasksResult.error;
  if (recurringResult.error) throw recurringResult.error;

  return {
    tasks: (tasksResult.data as TodoTaskRow[]).map(mapTask),
    lists,
    recurringSeries: (recurringResult.data as TodoRecurringSeriesRow[]).map(
      mapRecurringSeries,
    ),
    preferences,
  };
}

async function nextPosition(scope: TodoScope, atTop = false): Promise<number> {
  const filter = scopeFilter(scope);
  const query = supabase
    .from("todo_tasks")
    .select("position")
    .order("position", { ascending: atTop })
    .limit(1);

  if (filter.due_date === null) {
    query.is("due_date", null).eq("list_id", filter.list_id);
  } else {
    query.eq("due_date", filter.due_date).is("list_id", null);
  }

  const { data, error } = await query;
  if (error) throw error;

  const current = (data as { position: number }[])[0]?.position;
  if (current === undefined) return 1000;
  return atTop ? current - 1000 : current + 1000;
}

async function nextListPosition(): Promise<number> {
  const { data, error } = await supabase
    .from("todo_lists")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  if (error) throw error;
  return ((data as { position: number }[])[0]?.position ?? 0) + 1000;
}

async function nextSeriesPosition(): Promise<number> {
  const { data, error } = await supabase
    .from("todo_recurring_series")
    .select("position")
    .eq("active", true)
    .order("position", { ascending: false })
    .limit(1);
  if (error) throw error;
  return ((data as { position: number }[])[0]?.position ?? 0) + 1000;
}

export async function createTask(
  input: CreateTodoTaskInput,
): Promise<TodoTask> {
  const scope: TodoScope = input.listId
    ? { kind: "list", listId: input.listId }
    : { kind: "date", date: input.dueDate ?? todayISO() };
  const position = await nextPosition(scope, input.atTop);
  const { data, error } = await supabase
    .from("todo_tasks")
    .insert({
      title: input.title.trim(),
      notes: input.notes?.trim() ?? "",
      due_date: scope.kind === "date" ? scope.date : null,
      list_id: scope.kind === "list" ? scope.listId : null,
      position,
    })
    .select(
      "id, title, notes, due_date, list_id, completed_at, position, recurring_series_id, created_at",
    )
    .single();
  if (error) throw error;
  return mapTask(data as TodoTaskRow);
}

export async function createRecurringTodo(
  input: CreateRecurringTodoInput,
): Promise<{ task: TodoTask; series: TodoRecurringSeries }> {
  const [seriesPosition, taskPosition] = await Promise.all([
    nextSeriesPosition(),
    nextPosition({ kind: "date", date: input.startDate }),
  ]);

  const { data: seriesData, error: seriesError } = await supabase
    .from("todo_recurring_series")
    .insert({
      title: input.title.trim(),
      notes: input.notes?.trim() ?? "",
      frequency: input.frequency,
      start_date: input.startDate,
      anchor_date: input.startDate,
      position: seriesPosition,
    })
    .select(
      "id, title, notes, frequency, start_date, anchor_date, position, active",
    )
    .single();
  if (seriesError) throw seriesError;

  const series = mapRecurringSeries(seriesData as TodoRecurringSeriesRow);
  const { data: taskData, error: taskError } = await supabase
    .from("todo_tasks")
    .insert({
      title: series.title,
      notes: series.notes,
      due_date: input.startDate,
      recurring_series_id: series.id,
      position: taskPosition,
    })
    .select(
      "id, title, notes, due_date, list_id, completed_at, position, recurring_series_id, created_at",
    )
    .single();
  if (taskError) throw taskError;

  return {
    series,
    task: mapTask(taskData as TodoTaskRow),
  };
}

export async function updateTask(
  id: string,
  updates: Partial<
    Pick<TodoTask, "title" | "notes" | "dueDate" | "listId" | "position">
  >,
): Promise<TodoTask> {
  const payload: Record<string, string | number | null> = {};
  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.position !== undefined) payload.position = updates.position;
  if (updates.dueDate !== undefined && updates.dueDate !== null) {
    payload.due_date = updates.dueDate;
    payload.list_id = null;
  } else if (updates.listId !== undefined && updates.listId !== null) {
    payload.list_id = updates.listId;
    payload.due_date = null;
  }

  const { data, error } = await supabase
    .from("todo_tasks")
    .update(payload)
    .eq("id", id)
    .select(
      "id, title, notes, due_date, list_id, completed_at, position, recurring_series_id, created_at",
    )
    .single();
  if (error) throw error;
  return mapTask(data as TodoTaskRow);
}

export async function setTaskCompletion(
  id: string,
  completed: boolean,
): Promise<TodoTask> {
  const { data, error } = await supabase
    .from("todo_tasks")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id)
    .select(
      "id, title, notes, due_date, list_id, completed_at, position, recurring_series_id, created_at",
    )
    .single();
  if (error) throw error;
  return mapTask(data as TodoTaskRow);
}

export async function moveTask(
  id: string,
  target: TodoScope,
): Promise<TodoTask> {
  const position = await nextPosition(target);
  return updateTask(
    id,
    target.kind === "date"
      ? { dueDate: target.date, position }
      : { listId: target.listId, position },
  );
}

export async function reorderTasks(
  orderedTasks: Pick<TodoTask, "id">[],
): Promise<void> {
  await Promise.all(
    orderedTasks.map((task, index) =>
      supabase
        .from("todo_tasks")
        .update({ position: (index + 1) * 1000 })
        .eq("id", task.id),
    ),
  ).then((results) => {
    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;
  });
}

export async function deleteTask(id: string): Promise<TodoTask> {
  const { data, error } = await supabase
    .from("todo_tasks")
    .delete()
    .eq("id", id)
    .select(
      "id, title, notes, due_date, list_id, completed_at, position, recurring_series_id, created_at",
    )
    .single();
  if (error) throw error;
  return mapTask(data as TodoTaskRow);
}

export async function restoreTask(task: TodoTask): Promise<TodoTask> {
  const { data, error } = await supabase
    .from("todo_tasks")
    .insert({
      id: task.id,
      title: task.title,
      notes: task.notes,
      due_date: task.dueDate,
      list_id: task.listId,
      completed_at: task.completedAt,
      position: task.position,
      recurring_series_id: task.recurringSeriesId,
      created_at: task.createdAt,
    })
    .select(
      "id, title, notes, due_date, list_id, completed_at, position, recurring_series_id, created_at",
    )
    .single();
  if (error) throw error;
  return mapTask(data as TodoTaskRow);
}

export async function createList(name: string): Promise<TodoList> {
  const { data, error } = await supabase
    .from("todo_lists")
    .insert({ name: name.trim(), position: await nextListPosition() })
    .select("id, name, position, is_default, share_token, shared_note")
    .single();
  if (error) throw error;
  return mapList(data as TodoListRow);
}

export async function updateList(
  id: string,
  updates: Partial<Pick<TodoList, "name" | "sharedNote" | "shareToken">>,
): Promise<TodoList> {
  const payload: Record<string, string | null> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.sharedNote !== undefined)
    payload.shared_note = updates.sharedNote;
  if (updates.shareToken !== undefined)
    payload.share_token = updates.shareToken;

  const { data, error } = await supabase
    .from("todo_lists")
    .update(payload)
    .eq("id", id)
    .select("id, name, position, is_default, share_token, shared_note")
    .single();
  if (error) throw error;
  return mapList(data as TodoListRow);
}

export async function reorderLists(
  orderedLists: Pick<TodoList, "id">[],
): Promise<void> {
  await Promise.all(
    orderedLists.map((list, index) =>
      supabase
        .from("todo_lists")
        .update({ position: (index + 1) * 1000 })
        .eq("id", list.id),
    ),
  ).then((results) => {
    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;
  });
}

export async function deleteList(id: string): Promise<void> {
  const { error } = await supabase.from("todo_lists").delete().eq("id", id);
  if (error) throw error;
}

export async function updatePreferences(
  updates: Partial<TodoPreferences>,
): Promise<TodoPreferences> {
  const payload: Partial<TodoPreferencesRow> = {};
  if (updates.columnCount !== undefined)
    payload.column_count = updates.columnCount;
  if (updates.bulletStyle !== undefined)
    payload.bullet_style = updates.bulletStyle;
  if (updates.focusMinutes !== undefined)
    payload.focus_minutes = updates.focusMinutes;

  const { data, error } = await supabase
    .from("todo_preferences")
    .update(payload)
    .eq("id", true)
    .select("column_count, bullet_style, focus_minutes")
    .single();
  if (error) throw error;
  return mapPreferences(data as TodoPreferencesRow);
}

export async function updateRecurringTodo(
  id: string,
  updates: UpdateRecurringTodoInput,
): Promise<TodoRecurringSeries> {
  const payload: Record<string, string> = {};
  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.frequency !== undefined) payload.frequency = updates.frequency;
  if (updates.startDate !== undefined) {
    payload.start_date = updates.startDate;
    payload.anchor_date = updates.startDate;
  }

  const { data, error } = await supabase
    .from("todo_recurring_series")
    .update(payload)
    .eq("id", id)
    .select(
      "id, title, notes, frequency, start_date, anchor_date, position, active",
    )
    .single();
  if (error) throw error;

  const series = mapRecurringSeries(data as TodoRecurringSeriesRow);
  const today = todayISO();

  const taskPayload: Record<string, string> = {};
  if (updates.title !== undefined) taskPayload.title = series.title;
  if (updates.notes !== undefined) taskPayload.notes = series.notes;

  if (Object.keys(taskPayload).length > 0) {
    const { error: taskError } = await supabase
      .from("todo_tasks")
      .update(taskPayload)
      .eq("recurring_series_id", id)
      .gte("due_date", today)
      .is("completed_at", null);
    if (taskError) throw taskError;
  }

  if (updates.frequency !== undefined || updates.startDate !== undefined) {
    const { error: deleteError } = await supabase
      .from("todo_tasks")
      .delete()
      .eq("recurring_series_id", id)
      .gte("due_date", today)
      .is("completed_at", null);
    if (deleteError) throw deleteError;

    const { error: generateError } = await supabase.rpc(
      "todos_generate_recurring",
      { p_until: addDaysISO(today, 180) },
    );
    if (generateError) throw generateError;
  }

  return series;
}

export async function deleteRecurringTodo(id: string): Promise<void> {
  const { error: taskError } = await supabase
    .from("todo_tasks")
    .delete()
    .eq("recurring_series_id", id);
  if (taskError) throw taskError;

  const { error } = await supabase
    .from("todo_recurring_series")
    .update({ active: false })
    .eq("id", id);
  if (error) throw error;
}
