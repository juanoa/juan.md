do $$
begin
  create type public.net_worth_asset_category as enum ('cash', 'fund', 'stock', 'crypto', 'real_estate', 'vehicle', 'other');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.net_worth_asset_liquidity as enum ('instant', 'short_term', 'medium_term', 'illiquid');
exception when duplicate_object then null;
end $$;

create table public.net_worth_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) > 0),
  category public.net_worth_asset_category not null,
  liquidity public.net_worth_asset_liquidity not null,
  position int not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index net_worth_assets_active_position_idx
  on public.net_worth_assets (position, name)
  where archived_at is null;
create index net_worth_assets_category_idx on public.net_worth_assets (category);
create index net_worth_assets_liquidity_idx on public.net_worth_assets (liquidity);

create table public.net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  month date not null unique check (extract(day from month) = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index net_worth_snapshots_month_idx on public.net_worth_snapshots (month);

create table public.net_worth_asset_values (
  snapshot_id uuid not null references public.net_worth_snapshots(id) on delete cascade,
  asset_id uuid not null references public.net_worth_assets(id) on delete cascade,
  value numeric(14,2) not null check (value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (snapshot_id, asset_id)
);
create index net_worth_asset_values_asset_idx on public.net_worth_asset_values (asset_id);

create table public.net_worth_asset_aliases (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.net_worth_assets(id) on delete cascade,
  alias text not null unique check (char_length(trim(alias)) > 0),
  created_at timestamptz not null default now()
);
create index net_worth_asset_aliases_asset_idx on public.net_worth_asset_aliases (asset_id);

alter table public.net_worth_assets enable row level security;
alter table public.net_worth_snapshots enable row level security;
alter table public.net_worth_asset_values enable row level security;
alter table public.net_worth_asset_aliases enable row level security;

create policy "authenticated full access to net worth assets" on public.net_worth_assets
  for all to authenticated using (true) with check (true);
create policy "authenticated full access to net worth snapshots" on public.net_worth_snapshots
  for all to authenticated using (true) with check (true);
create policy "authenticated full access to net worth values" on public.net_worth_asset_values
  for all to authenticated using (true) with check (true);
create policy "authenticated full access to net worth aliases" on public.net_worth_asset_aliases
  for all to authenticated using (true) with check (true);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_net_worth_assets_updated_at
  before update on public.net_worth_assets
  for each row execute function public.touch_updated_at();

create trigger touch_net_worth_snapshots_updated_at
  before update on public.net_worth_snapshots
  for each row execute function public.touch_updated_at();

create trigger touch_net_worth_asset_values_updated_at
  before update on public.net_worth_asset_values
  for each row execute function public.touch_updated_at();

insert into public.net_worth_assets (name, category, liquidity, position, archived_at) values
  ('Revolut Cuenta Remunerada', 'cash', 'instant', 0, null),
  ('Finizens', 'fund', 'medium_term', 1000, null),
  ('Wecity', 'real_estate', 'illiquid', 2000, null),
  ('Urbanitae', 'real_estate', 'illiquid', 3000, null),
  ('Revolut Crypto', 'crypto', 'short_term', 4000, null),
  ('iShares MSCI China UCITS ETF USD Acc', 'fund', 'short_term', 5000, null),
  ('Figma Inc Class A', 'stock', 'short_term', 6000, null),
  ('Phantom', 'crypto', 'short_term', 7000, null),
  ('🚗Volkswagen Polo', 'vehicle', 'illiquid', 8000, '2025-04-01T00:00:00+00'),
  ('Madrid - Móstoles', 'real_estate', 'illiquid', 9000, '2025-04-01T00:00:00+00'),
  ('Murcia - Santa Rosalía Lake', 'real_estate', 'illiquid', 10000, '2025-04-01T00:00:00+00'),
  ('Proyecto Alicante-Jávea', 'real_estate', 'illiquid', 11000, '2025-04-01T00:00:00+00'),
  ('Proyecto Alicante-La Herrada', 'real_estate', 'illiquid', 12000, '2025-04-01T00:00:00+00'),
  ('Proyecto Barcelona-Sitges', 'real_estate', 'illiquid', 13000, '2025-04-01T00:00:00+00'),
  ('Proyecto Cádiz-La Caleta', 'real_estate', 'illiquid', 14000, '2025-04-01T00:00:00+00'),
  ('Proyecto Madrid - La Moraleja', 'real_estate', 'illiquid', 15000, '2025-02-01T00:00:00+00'),
  ('Proyecto Madrid - Nueva Numancia', 'real_estate', 'illiquid', 16000, '2025-04-01T00:00:00+00'),
  ('Proyecto Madrid-Cobeña', 'real_estate', 'illiquid', 17000, '2024-12-01T00:00:00+00'),
  ('Proyecto Madrid-Puerta de Alcalá', 'real_estate', 'illiquid', 18000, '2025-04-01T00:00:00+00'),
  ('Proyecto Madrid-San Bernardo', 'real_estate', 'illiquid', 19000, '2025-04-01T00:00:00+00'),
  ('Proyecto Marbella-Los naranjos', 'real_estate', 'illiquid', 20000, '2025-04-01T00:00:00+00'),
  ('Proyecto Marbella-Villa Limón', 'real_estate', 'illiquid', 21000, '2025-04-01T00:00:00+00'),
  ('Proyecto Murcia-Santa Rosalía', 'real_estate', 'illiquid', 22000, '2024-12-01T00:00:00+00'),
  ('Proyecto Salvia — Marbella', 'real_estate', 'illiquid', 23000, '2025-04-01T00:00:00+00'),
  ('Proyecto Valencia-La Cañada', 'real_estate', 'illiquid', 24000, '2025-04-01T00:00:00+00'),
  ('Wallet WeCity', 'real_estate', 'illiquid', 25000, '2025-04-01T00:00:00+00')
on conflict (name) do update set
  category = excluded.category,
  liquidity = excluded.liquidity,
  position = excluded.position,
  archived_at = excluded.archived_at;

insert into public.net_worth_snapshots (month) values
  ('2024-09-01'),
  ('2024-10-01'),
  ('2024-11-01'),
  ('2024-12-01'),
  ('2025-02-01'),
  ('2025-04-01'),
  ('2025-08-01'),
  ('2025-09-01'),
  ('2025-10-01'),
  ('2025-11-01'),
  ('2025-12-01'),
  ('2026-01-01'),
  ('2026-02-01'),
  ('2026-03-01'),
  ('2026-04-01'),
  ('2026-05-01'),
  ('2026-06-01')
on conflict (month) do nothing;

with alias_seed(asset_name, alias) as (
  values
  ('Revolut Cuenta Remunerada', 'BBVA Cuenta Ahorro'),
  ('Revolut Crypto', 'Binance'),
  ('Revolut Cuenta Remunerada', 'Cuenta ahorro BBVA'),
  ('Revolut Cuenta Remunerada', 'Cuenta Flexible Revolut'),
  ('Revolut Cuenta Remunerada', 'Efectivo Trade Republic'),
  ('Revolut Crypto', 'ETH'),
  ('Finizens', 'Fondo de inversión pasiva'),
  ('Revolut Crypto', 'SOL'),
  ('Revolut Crypto', 'USDC')
)
insert into public.net_worth_asset_aliases (asset_id, alias)
select asset.id, alias_seed.alias
from alias_seed
join public.net_worth_assets asset on asset.name = alias_seed.asset_name
on conflict (alias) do update set asset_id = excluded.asset_id;

with value_seed(asset_name, month, value) as (
  values
  ('Finizens', '2024-09-01', 19352.63),
  ('Proyecto Alicante-Jávea', '2024-09-01', 943.48),
  ('Proyecto Alicante-La Herrada', '2024-09-01', 572.25),
  ('Proyecto Barcelona-Sitges', '2024-09-01', 1083.22),
  ('Proyecto Madrid-Cobeña', '2024-09-01', 493.19),
  ('Proyecto Madrid-Puerta de Alcalá', '2024-09-01', 1090.00),
  ('Proyecto Madrid-San Bernardo', '2024-09-01', 583.76),
  ('Proyecto Murcia-Santa Rosalía', '2024-09-01', 1833.34),
  ('Proyecto Salvia — Marbella', '2024-09-01', 2996.00),
  ('Proyecto Valencia-La Cañada', '2024-09-01', 590.00),
  ('Revolut Crypto', '2024-09-01', 1612.10),
  ('Revolut Cuenta Remunerada', '2024-09-01', 25002.56),
  ('Wallet WeCity', '2024-09-01', 1170.42),
  ('Finizens', '2024-10-01', 20592.26),
  ('Proyecto Alicante-Jávea', '2024-10-01', 943.48),
  ('Proyecto Alicante-La Herrada', '2024-10-01', 572.25),
  ('Proyecto Barcelona-Sitges', '2024-10-01', 1083.22),
  ('Proyecto Cádiz-La Caleta', '2024-10-01', 1234.79),
  ('Proyecto Madrid-Cobeña', '2024-10-01', 493.19),
  ('Proyecto Madrid-Puerta de Alcalá', '2024-10-01', 1090.00),
  ('Proyecto Madrid-San Bernardo', '2024-10-01', 583.76),
  ('Proyecto Marbella-Los naranjos', '2024-10-01', 1137.50),
  ('Proyecto Marbella-Villa Limón', '2024-10-01', 789.99),
  ('Proyecto Murcia-Santa Rosalía', '2024-10-01', 1833.34),
  ('Proyecto Salvia — Marbella', '2024-10-01', 2996.00),
  ('Proyecto Valencia-La Cañada', '2024-10-01', 590.00),
  ('Revolut Crypto', '2024-10-01', 2443.32),
  ('Revolut Cuenta Remunerada', '2024-10-01', 20897.93),
  ('Wallet WeCity', '2024-10-01', 135.65),
  ('Finizens', '2024-11-01', 20902.42),
  ('Proyecto Alicante-Jávea', '2024-11-01', 943.48),
  ('Proyecto Alicante-La Herrada', '2024-11-01', 572.25),
  ('Proyecto Barcelona-Sitges', '2024-11-01', 1083.22),
  ('Proyecto Cádiz-La Caleta', '2024-11-01', 1234.79),
  ('Proyecto Madrid - Nueva Numancia', '2024-11-01', 1420.93),
  ('Proyecto Madrid-Cobeña', '2024-11-01', 493.19),
  ('Proyecto Madrid-Puerta de Alcalá', '2024-11-01', 1090.00),
  ('Proyecto Madrid-San Bernardo', '2024-11-01', 583.76),
  ('Proyecto Marbella-Los naranjos', '2024-11-01', 1137.50),
  ('Proyecto Marbella-Villa Limón', '2024-11-01', 789.99),
  ('Proyecto Murcia-Santa Rosalía', '2024-11-01', 1833.34),
  ('Proyecto Salvia — Marbella', '2024-11-01', 2996.00),
  ('Proyecto Valencia-La Cañada', '2024-11-01', 590.00),
  ('Revolut Crypto', '2024-11-01', 2734.89),
  ('Revolut Cuenta Remunerada', '2024-11-01', 19908.74),
  ('Wallet WeCity', '2024-11-01', 0.00),
  ('Finizens', '2024-12-01', 21183.78),
  ('Proyecto Alicante-Jávea', '2024-12-01', 943.48),
  ('Proyecto Alicante-La Herrada', '2024-12-01', 572.25),
  ('Proyecto Barcelona-Sitges', '2024-12-01', 1083.22),
  ('Proyecto Cádiz-La Caleta', '2024-12-01', 1234.79),
  ('Proyecto Madrid - La Moraleja', '2024-12-01', 9789.72),
  ('Proyecto Madrid - Nueva Numancia', '2024-12-01', 1420.93),
  ('Proyecto Madrid-Cobeña', '2024-12-01', 493.19),
  ('Proyecto Madrid-Puerta de Alcalá', '2024-12-01', 1090.00),
  ('Proyecto Madrid-San Bernardo', '2024-12-01', 583.76),
  ('Proyecto Marbella-Los naranjos', '2024-12-01', 1137.50),
  ('Proyecto Marbella-Villa Limón', '2024-12-01', 789.99),
  ('Proyecto Murcia-Santa Rosalía', '2024-12-01', 1833.34),
  ('Proyecto Salvia — Marbella', '2024-12-01', 2996.00),
  ('Proyecto Valencia-La Cañada', '2024-12-01', 590.00),
  ('Revolut Crypto', '2024-12-01', 2295.98),
  ('Revolut Cuenta Remunerada', '2024-12-01', 12136.66),
  ('Wallet WeCity', '2024-12-01', 44.64),
  ('Finizens', '2025-02-01', 22331.40),
  ('Proyecto Alicante-Jávea', '2025-02-01', 943.48),
  ('Proyecto Alicante-La Herrada', '2025-02-01', 572.25),
  ('Proyecto Barcelona-Sitges', '2025-02-01', 1083.22),
  ('Proyecto Cádiz-La Caleta', '2025-02-01', 1234.79),
  ('Proyecto Madrid - La Moraleja', '2025-02-01', 9789.72),
  ('Proyecto Madrid - Nueva Numancia', '2025-02-01', 1420.93),
  ('Proyecto Madrid-Puerta de Alcalá', '2025-02-01', 1090.00),
  ('Proyecto Madrid-San Bernardo', '2025-02-01', 583.76),
  ('Proyecto Marbella-Los naranjos', '2025-02-01', 1137.50),
  ('Proyecto Marbella-Villa Limón', '2025-02-01', 789.99),
  ('Proyecto Salvia — Marbella', '2025-02-01', 2996.00),
  ('Proyecto Valencia-La Cañada', '2025-02-01', 590.00),
  ('Revolut Crypto', '2025-02-01', 1736.52),
  ('Revolut Cuenta Remunerada', '2025-02-01', 12676.23),
  ('Wallet WeCity', '2025-02-01', 915.18),
  ('🚗Volkswagen Polo', '2025-04-01', 9000.00),
  ('Finizens', '2025-04-01', 19661.95),
  ('Madrid - Móstoles', '2025-04-01', 527.00),
  ('Murcia - Santa Rosalía Lake', '2025-04-01', 2762.00),
  ('Proyecto Alicante-Jávea', '2025-04-01', 943.48),
  ('Proyecto Alicante-La Herrada', '2025-04-01', 572.25),
  ('Proyecto Barcelona-Sitges', '2025-04-01', 1083.22),
  ('Proyecto Cádiz-La Caleta', '2025-04-01', 1234.79),
  ('Proyecto Madrid - Nueva Numancia', '2025-04-01', 1420.93),
  ('Proyecto Madrid-Puerta de Alcalá', '2025-04-01', 1090.00),
  ('Proyecto Madrid-San Bernardo', '2025-04-01', 583.76),
  ('Proyecto Marbella-Los naranjos', '2025-04-01', 1137.50),
  ('Proyecto Marbella-Villa Limón', '2025-04-01', 789.99),
  ('Proyecto Salvia — Marbella', '2025-04-01', 2996.00),
  ('Proyecto Valencia-La Cañada', '2025-04-01', 590.00),
  ('Revolut Crypto', '2025-04-01', 1297.38),
  ('Revolut Cuenta Remunerada', '2025-04-01', 4477.28),
  ('Wallet WeCity', '2025-04-01', 7649.00),
  ('Figma Inc Class A', '2025-08-01', 911.01),
  ('Finizens', '2025-08-01', 28787.00),
  ('Phantom', '2025-08-01', 60.57),
  ('Revolut Crypto', '2025-08-01', 2268.05),
  ('Revolut Cuenta Remunerada', '2025-08-01', 4928.27),
  ('Urbanitae', '2025-08-01', 2000.00),
  ('Wecity', '2025-08-01', 15964.90),
  ('Figma Inc Class A', '2025-09-01', 811.08),
  ('Finizens', '2025-09-01', 29739.47),
  ('Phantom', '2025-09-01', 60.57),
  ('Revolut Crypto', '2025-09-01', 2282.87),
  ('Revolut Cuenta Remunerada', '2025-09-01', 4887.27),
  ('Urbanitae', '2025-09-01', 2000.00),
  ('Wecity', '2025-09-01', 16121.23),
  ('Figma Inc Class A', '2025-10-01', 739.37),
  ('Finizens', '2025-10-01', 31067.43),
  ('Phantom', '2025-10-01', 61.59),
  ('Revolut Crypto', '2025-10-01', 2197.59),
  ('Revolut Cuenta Remunerada', '2025-10-01', 5196.27),
  ('Urbanitae', '2025-10-01', 2000.00),
  ('Wecity', '2025-10-01', 16937.33),
  ('Figma Inc Class A', '2025-11-01', 505.16),
  ('Finizens', '2025-11-01', 31465.00),
  ('Phantom', '2025-11-01', 61.59),
  ('Revolut Crypto', '2025-11-01', 1518.66),
  ('Revolut Cuenta Remunerada', '2025-11-01', 6546.27),
  ('Urbanitae', '2025-11-01', 2000.00),
  ('Wecity', '2025-11-01', 16928.00),
  ('Figma Inc Class A', '2025-12-01', 523.17),
  ('Finizens', '2025-12-01', 31873.00),
  ('iShares MSCI China UCITS ETF USD Acc', '2025-12-01', 2975.75),
  ('Phantom', '2025-12-01', 60.84),
  ('Revolut Crypto', '2025-12-01', 1364.62),
  ('Revolut Cuenta Remunerada', '2025-12-01', 3546.27),
  ('Urbanitae', '2025-12-01', 2000.00),
  ('Wecity', '2025-12-01', 16976.39),
  ('Figma Inc Class A', '2026-01-01', 380.42),
  ('Finizens', '2026-01-01', 29242.51),
  ('iShares MSCI China UCITS ETF USD Acc', '2026-01-01', 3057.83),
  ('Phantom', '2026-01-01', 60.84),
  ('Revolut Crypto', '2026-01-01', 1385.33),
  ('Revolut Cuenta Remunerada', '2026-01-01', 9160.72),
  ('Urbanitae', '2026-01-01', 2000.00),
  ('Wecity', '2026-01-01', 15635.23),
  ('Figma Inc Class A', '2026-02-01', 424.19),
  ('Finizens', '2026-02-01', 30958.20),
  ('iShares MSCI China UCITS ETF USD Acc', '2026-02-01', 2914.38),
  ('Phantom', '2026-02-01', 60.84),
  ('Revolut Crypto', '2026-02-01', 970.10),
  ('Revolut Cuenta Remunerada', '2026-02-01', 9716.17),
  ('Urbanitae', '2026-02-01', 2000.00),
  ('Wecity', '2026-02-01', 15602.00),
  ('Figma Inc Class A', '2026-03-01', 280.89),
  ('Finizens', '2026-03-01', 30617.62),
  ('iShares MSCI China UCITS ETF USD Acc', '2026-03-01', 2757.32),
  ('Phantom', '2026-03-01', 60.84),
  ('Revolut Crypto', '2026-03-01', 953.95),
  ('Revolut Cuenta Remunerada', '2026-03-01', 11337.22),
  ('Urbanitae', '2026-03-01', 2000.00),
  ('Wecity', '2026-03-01', 14485.00),
  ('Figma Inc Class A', '2026-04-01', 243.77),
  ('Finizens', '2026-04-01', 33534.92),
  ('iShares MSCI China UCITS ETF USD Acc', '2026-04-01', 2842.94),
  ('Phantom', '2026-04-01', 60.84),
  ('Revolut Crypto', '2026-04-01', 998.53),
  ('Revolut Cuenta Remunerada', '2026-04-01', 12278.77),
  ('Urbanitae', '2026-04-01', 2000.00),
  ('Wecity', '2026-04-01', 13578.48),
  ('Figma Inc Class A', '2026-05-01', 334.27),
  ('Finizens', '2026-05-01', 37583.65),
  ('iShares MSCI China UCITS ETF USD Acc', '2026-05-01', 2861.08),
  ('Phantom', '2026-05-01', 60.84),
  ('Revolut Crypto', '2026-05-01', 2456.17),
  ('Revolut Cuenta Remunerada', '2026-05-01', 12737.85),
  ('Urbanitae', '2026-05-01', 2000.00),
  ('Wecity', '2026-05-01', 10984.84),
  ('Figma Inc Class A', '2026-06-01', 267.62),
  ('Finizens', '2026-06-01', 37633.16),
  ('iShares MSCI China UCITS ETF USD Acc', '2026-06-01', 2611.04),
  ('Phantom', '2026-06-01', 62.00),
  ('Revolut Crypto', '2026-06-01', 2199.00),
  ('Revolut Cuenta Remunerada', '2026-06-01', 13378.03),
  ('Urbanitae', '2026-06-01', 2000.00),
  ('Wecity', '2026-06-01', 10347.00)
)
insert into public.net_worth_asset_values (asset_id, snapshot_id, value)
select asset.id, snapshot.id, value_seed.value
from value_seed
join public.net_worth_assets asset on asset.name = value_seed.asset_name
join public.net_worth_snapshots snapshot on snapshot.month = value_seed.month::date
on conflict (snapshot_id, asset_id) do update set value = excluded.value;
