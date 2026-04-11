create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Requires these Vault secrets to exist before the jobs run:
--   project_url = https://<project-ref>.supabase.co
--   anon_key or publishable_key = <your Supabase anon/publishable key>
--
-- Supabase Cron schedules are documented in GMT/UTC. This runs Sunday through
-- Thursday at 18:00 UTC.

select
  cron.schedule(
    'compose-and-schedule-next-newsletter-topic-software_engineer',
    '0 18 * * 0-4',
    $$
    select
      net.http_post(
        url:=(
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'project_url'
        ) || '/functions/v1/compose-and-schedule-next-newsletter',
        headers:=jsonb_build_object(
          'Content-Type',
          'application/json',
          'Authorization',
          'Bearer ' || (
            select decrypted_secret
            from vault.decrypted_secrets
            where name in ('anon_key', 'publishable_key')
            order by case name
              when 'anon_key' then 1
              when 'publishable_key' then 2
              else 3
            end
            limit 1
          )
        ),
        body:=jsonb_build_object(
          'topics',
          jsonb_build_array('2ee6ea81-ec23-475e-8fb4-a8c89380a3d5')
        ),
        timeout_milliseconds:=30000
      ) as request_id;
    $$
  );

select
  cron.schedule(
    'compose-and-schedule-next-newsletter-topic-product_designer',
    '0 18 * * 0-4',
    $$
    select
      net.http_post(
        url:=(
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'project_url'
        ) || '/functions/v1/compose-and-schedule-next-newsletter',
        headers:=jsonb_build_object(
          'Content-Type',
          'application/json',
          'Authorization',
          'Bearer ' || (
            select decrypted_secret
            from vault.decrypted_secrets
            where name in ('anon_key', 'publishable_key')
            order by case name
              when 'anon_key' then 1
              when 'publishable_key' then 2
              else 3
            end
            limit 1
          )
        ),
        body:=jsonb_build_object(
          'topics',
          jsonb_build_array('8faa9967-91a9-4c5c-8ef5-5861dc18f8b7')
        ),
        timeout_milliseconds:=30000
      ) as request_id;
    $$
  );

select
  cron.schedule(
    'compose-and-schedule-next-newsletter-topic-product_manager',
    '0 18 * * 0-4',
    $$
    select
      net.http_post(
        url:=(
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'project_url'
        ) || '/functions/v1/compose-and-schedule-next-newsletter',
        headers:=jsonb_build_object(
          'Content-Type',
          'application/json',
          'Authorization',
          'Bearer ' || (
            select decrypted_secret
            from vault.decrypted_secrets
            where name in ('anon_key', 'publishable_key')
            order by case name
              when 'anon_key' then 1
              when 'publishable_key' then 2
              else 3
            end
            limit 1
          )
        ),
        body:=jsonb_build_object(
          'topics',
          jsonb_build_array('5fb01f80-59db-4f51-8786-fd54d4417401')
        ),
        timeout_milliseconds:=30000
      ) as request_id;
    $$
  );

select
  cron.schedule(
    'compose-and-schedule-next-newsletter-topic-c_level',
    '0 18 * * 0-4',
    $$
    select
      net.http_post(
        url:=(
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'project_url'
        ) || '/functions/v1/compose-and-schedule-next-newsletter',
        headers:=jsonb_build_object(
          'Content-Type',
          'application/json',
          'Authorization',
          'Bearer ' || (
            select decrypted_secret
            from vault.decrypted_secrets
            where name in ('anon_key', 'publishable_key')
            order by case name
              when 'anon_key' then 1
              when 'publishable_key' then 2
              else 3
            end
            limit 1
          )
        ),
        body:=jsonb_build_object(
          'topics',
          jsonb_build_array('390d7a4a-869c-480c-8ad7-5357365f6282')
        ),
        timeout_milliseconds:=30000
      ) as request_id;
    $$
  );
