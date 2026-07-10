import { supabase } from "../supabase/client";
import type {
  NetWorthAsset,
  NetWorthAssetCategory,
  NetWorthAssetDeleteResult,
  NetWorthAssetInput,
  NetWorthAssetLiquidity,
  NetWorthData,
  NetWorthSnapshot,
  NetWorthSnapshotValueInput,
} from "./types";

interface NetWorthAssetRow {
  id: string;
  name: string;
  category: NetWorthAssetCategory;
  liquidity: NetWorthAssetLiquidity;
  position: number;
  archived_at: string | null;
}

interface NetWorthSnapshotRow {
  id: string;
  month: string;
}

interface NetWorthAssetValueRow {
  snapshot_id: string;
  asset_id: string;
  value: number | string;
}

const ASSET_SELECT = "id, name, category, liquidity, position, archived_at";
const SNAPSHOT_SELECT = "id, month";
const VALUE_SELECT = "snapshot_id, asset_id, value";

function mapAsset(row: NetWorthAssetRow): NetWorthAsset {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    liquidity: row.liquidity,
    position: row.position,
    archivedAt: row.archived_at,
  };
}

function mapSnapshot(
  row: NetWorthSnapshotRow,
  valueRows: NetWorthAssetValueRow[],
): NetWorthSnapshot {
  return {
    id: row.id,
    month: row.month,
    values: valueRows
      .filter((value) => value.snapshot_id === row.id)
      .map((value) => ({
        assetId: value.asset_id,
        value:
          typeof value.value === "number" ? value.value : Number(value.value),
      })),
  };
}

export async function fetchNetWorthData(): Promise<NetWorthData> {
  const [assetResult, snapshotResult, valueResult] = await Promise.all([
    supabase
      .from("net_worth_assets")
      .select(ASSET_SELECT)
      .order("position", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("net_worth_snapshots")
      .select(SNAPSHOT_SELECT)
      .order("month", { ascending: true }),
    supabase.from("net_worth_asset_values").select(VALUE_SELECT),
  ]);

  if (assetResult.error) throw assetResult.error;
  if (snapshotResult.error) throw snapshotResult.error;
  if (valueResult.error) throw valueResult.error;

  const values = (valueResult.data ?? []) as NetWorthAssetValueRow[];
  return {
    assets: ((assetResult.data ?? []) as NetWorthAssetRow[]).map(mapAsset),
    snapshots: ((snapshotResult.data ?? []) as NetWorthSnapshotRow[]).map(
      (snapshot) => mapSnapshot(snapshot, values),
    ),
  };
}

export async function createAsset(
  input: NetWorthAssetInput,
): Promise<NetWorthAsset> {
  const position = await getNextAssetPosition();
  const { data, error } = await supabase
    .from("net_worth_assets")
    .insert({
      name: input.name,
      category: input.category,
      liquidity: input.liquidity,
      position,
    })
    .select(ASSET_SELECT)
    .single();
  if (error) throw error;
  return mapAsset(data as NetWorthAssetRow);
}

export async function updateAsset(
  id: string,
  input: NetWorthAssetInput,
): Promise<NetWorthAsset> {
  const { data, error } = await supabase
    .from("net_worth_assets")
    .update({
      name: input.name,
      category: input.category,
      liquidity: input.liquidity,
    })
    .eq("id", id)
    .select(ASSET_SELECT)
    .single();
  if (error) throw error;
  return mapAsset(data as NetWorthAssetRow);
}

export async function deleteAsset(
  id: string,
): Promise<NetWorthAssetDeleteResult> {
  const { count, error: countError } = await supabase
    .from("net_worth_asset_values")
    .select("snapshot_id", { count: "exact", head: true })
    .eq("asset_id", id);
  if (countError) throw countError;

  if ((count ?? 0) > 0) {
    const { error } = await supabase
      .from("net_worth_assets")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return { action: "archived" };
  }

  const { error } = await supabase
    .from("net_worth_assets")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return { action: "deleted" };
}

export async function saveSnapshot(
  month: string,
  values: NetWorthSnapshotValueInput[],
): Promise<NetWorthSnapshot> {
  const { data: snapshotData, error: snapshotError } = await supabase
    .from("net_worth_snapshots")
    .upsert({ month }, { onConflict: "month" })
    .select(SNAPSHOT_SELECT)
    .single();
  if (snapshotError) throw snapshotError;

  const snapshot = snapshotData as NetWorthSnapshotRow;
  const { error: valueError } = await supabase
    .from("net_worth_asset_values")
    .upsert(
      values.map((entry) => ({
        snapshot_id: snapshot.id,
        asset_id: entry.assetId,
        value: entry.value,
      })),
      { onConflict: "snapshot_id,asset_id" },
    );
  if (valueError) throw valueError;

  const { data, error } = await supabase
    .from("net_worth_asset_values")
    .select(VALUE_SELECT)
    .eq("snapshot_id", snapshot.id);
  if (error) throw error;

  return mapSnapshot(snapshot, (data ?? []) as NetWorthAssetValueRow[]);
}

async function getNextAssetPosition(): Promise<number> {
  const { data, error } = await supabase
    .from("net_worth_assets")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  if (error) throw error;

  const last = (data as { position: number }[] | null)?.[0];
  return (last?.position ?? 0) + 1000;
}
