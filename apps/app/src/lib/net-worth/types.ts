export type NetWorthAssetCategory =
  | "cash"
  | "fund"
  | "stock"
  | "crypto"
  | "real_estate"
  | "vehicle"
  | "other";

export const NET_WORTH_ASSET_CATEGORIES: {
  value: NetWorthAssetCategory;
  name: string;
}[] = [
  { value: "cash", name: "Cash" },
  { value: "fund", name: "Funds" },
  { value: "stock", name: "Stocks" },
  { value: "crypto", name: "Crypto" },
  { value: "real_estate", name: "Real estate" },
  { value: "vehicle", name: "Vehicles" },
  { value: "other", name: "Other" },
];

export type NetWorthAssetLiquidity =
  | "instant"
  | "short_term"
  | "medium_term"
  | "illiquid";

export const NET_WORTH_ASSET_LIQUIDITY_LEVELS: {
  value: NetWorthAssetLiquidity;
  name: string;
}[] = [
  { value: "instant", name: "Instant" },
  { value: "short_term", name: "Short term" },
  { value: "medium_term", name: "Medium term" },
  { value: "illiquid", name: "Illiquid" },
];

export interface NetWorthAsset {
  id: string;
  name: string;
  category: NetWorthAssetCategory;
  liquidity: NetWorthAssetLiquidity;
  position: number;
  archivedAt: string | null;
}

export interface NetWorthAssetInput {
  name: string;
  category: NetWorthAssetCategory;
  liquidity: NetWorthAssetLiquidity;
}

export type NetWorthAssetDeleteResult = {
  action: "deleted" | "archived";
};

export interface NetWorthAssetValue {
  assetId: string;
  value: number;
}

export interface NetWorthSnapshot {
  id: string;
  month: string;
  values: NetWorthAssetValue[];
}

export interface NetWorthSnapshotValueInput {
  assetId: string;
  value: number;
}

export interface NetWorthData {
  assets: NetWorthAsset[];
  snapshots: NetWorthSnapshot[];
}
