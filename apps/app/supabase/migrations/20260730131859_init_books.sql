create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  google_books_id text,
  title text not null check (char_length(trim(title)) > 0),
  authors text[] not null default '{}',
  cover_url text,
  published_date text,
  status text not null default 'want_to_read'
    check (status in ('want_to_read', 'reading', 'read')),
  rating smallint check (rating between 1 and 5),
  last_read_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, google_books_id)
);

create index books_user_last_read_idx
  on public.books (user_id, last_read_at desc nulls last);

grant select, insert, update, delete on public.books to authenticated;

alter table public.books enable row level security;

create policy "Users can read their own books"
  on public.books for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own books"
  on public.books for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own books"
  on public.books for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own books"
  on public.books for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger touch_books_updated_at
  before update on public.books
  for each row execute function public.touch_updated_at();
