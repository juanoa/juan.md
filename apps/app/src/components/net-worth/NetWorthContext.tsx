import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import * as repository from "../../lib/net-worth/repository";
import type {
  NetWorthAsset,
  NetWorthAssetDeleteResult,
  NetWorthAssetInput,
  NetWorthSnapshot,
  NetWorthSnapshotValueInput,
} from "../../lib/net-worth/types";

export type NetWorthStatus = "loading" | "ready" | "error";

export interface NetWorthContextValue {
  assets: NetWorthAsset[];
  snapshots: NetWorthSnapshot[];
  status: NetWorthStatus;
  error: string | null;
  createAsset: (input: NetWorthAssetInput) => Promise<NetWorthAsset>;
  updateAsset: (
    id: string,
    input: NetWorthAssetInput,
  ) => Promise<NetWorthAsset>;
  deleteAsset: (id: string) => Promise<NetWorthAssetDeleteResult>;
  saveSnapshot: (
    month: string,
    values: NetWorthSnapshotValueInput[],
  ) => Promise<NetWorthSnapshot>;
  refresh: () => void;
}

const NetWorthContext = createContext<NetWorthContextValue | undefined>(
  undefined,
);

function sortAssets(assets: NetWorthAsset[]): NetWorthAsset[] {
  return [...assets].sort((a, b) => {
    const positionOrder = a.position - b.position;
    if (positionOrder !== 0) return positionOrder;
    return a.name.localeCompare(b.name);
  });
}

function sortSnapshots(snapshots: NetWorthSnapshot[]): NetWorthSnapshot[] {
  return [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
}

export function NetWorthContextProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<NetWorthAsset[]>([]);
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [status, setStatus] = useState<NetWorthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    repository.fetchNetWorthData().then(
      (data) => {
        setAssets(sortAssets(data.assets));
        setSnapshots(sortSnapshots(data.snapshots));
        setStatus("ready");
        setError(null);
      },
      (e: unknown) => {
        setStatus("error");
        setError(
          e instanceof Error ? e.message : "Failed to load net worth data",
        );
      },
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAsset = useCallback(async (input: NetWorthAssetInput) => {
    const asset = await repository.createAsset(input);
    setAssets((prev) => sortAssets([...prev, asset]));
    return asset;
  }, []);

  const updateAsset = useCallback(
    async (id: string, input: NetWorthAssetInput) => {
      const asset = await repository.updateAsset(id, input);
      setAssets((prev) =>
        sortAssets(prev.map((entry) => (entry.id === id ? asset : entry))),
      );
      return asset;
    },
    [],
  );

  const deleteAsset = useCallback(async (id: string) => {
    const result = await repository.deleteAsset(id);
    if (result.action === "deleted") {
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
      setSnapshots((prev) =>
        prev.map((snapshot) => ({
          ...snapshot,
          values: snapshot.values.filter((value) => value.assetId !== id),
        })),
      );
      return result;
    }

    setAssets((prev) =>
      sortAssets(
        prev.map((asset) =>
          asset.id === id
            ? { ...asset, archivedAt: new Date().toISOString() }
            : asset,
        ),
      ),
    );
    return result;
  }, []);

  const saveSnapshot = useCallback(
    async (month: string, values: NetWorthSnapshotValueInput[]) => {
      const snapshot = await repository.saveSnapshot(month, values);
      setSnapshots((prev) =>
        sortSnapshots([
          ...prev.filter((entry) => entry.id !== snapshot.id),
          snapshot,
        ]),
      );
      return snapshot;
    },
    [],
  );

  const value = useMemo<NetWorthContextValue>(
    () => ({
      assets,
      snapshots,
      status,
      error,
      createAsset,
      updateAsset,
      deleteAsset,
      saveSnapshot,
      refresh,
    }),
    [
      assets,
      snapshots,
      status,
      error,
      createAsset,
      updateAsset,
      deleteAsset,
      saveSnapshot,
      refresh,
    ],
  );

  return (
    <NetWorthContext.Provider value={value}>
      {children}
    </NetWorthContext.Provider>
  );
}

export function useNetWorthContext() {
  const context = useContext(NetWorthContext);
  if (context === undefined) {
    throw new Error(
      "useNetWorthContext must be used within a NetWorthContextProvider",
    );
  }
  return context;
}
