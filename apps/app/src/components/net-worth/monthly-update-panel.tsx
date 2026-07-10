import { FloppyDiskIcon, PlusIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { Button } from "@juan/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@juan/ui/components/ui/dialog";
import { Input } from "@juan/ui/components/ui/input";
import { Label } from "@juan/ui/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@juan/ui/components/ui/table";

import {
  formatMonthInput,
  monthInputToSnapshotMonth,
  nextMonth,
} from "../../lib/net-worth/date";
import {
  getLatestSnapshot,
  getSnapshotValue,
  getSnapshotTotal,
} from "../../lib/net-worth/stats";
import type {
  NetWorthAsset,
  NetWorthSnapshot,
} from "../../lib/net-worth/types";
import { useNetWorthContext } from "./NetWorthContext";
import {
  formatCurrency,
  getCategoryName,
  getLiquidityName,
} from "./net-worth-format";

type DraftValues = Record<string, string>;

export function MonthlyUpdatePanel() {
  const { assets, snapshots, saveSnapshot } = useNetWorthContext();
  const activeAssets = useMemo(
    () => assets.filter((asset) => asset.archivedAt === null),
    [assets],
  );
  const latestSnapshot = useMemo(
    () => getLatestSnapshot(snapshots),
    [snapshots],
  );
  const [draftMonth, setDraftMonth] = useState("");
  const [draftValues, setDraftValues] = useState<DraftValues>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const snapshotMonth = draftMonth ? monthInputToSnapshotMonth(draftMonth) : "";
  const monthExists = snapshots.some(
    (snapshot) => snapshot.month === snapshotMonth,
  );
  const total = activeAssets.reduce(
    (sum, asset) => sum + parseDraftValue(draftValues[asset.id]),
    0,
  );

  const handleSave = async () => {
    if (!draftMonth) return;
    setSaving(true);
    setError(null);
    try {
      await saveSnapshot(
        monthInputToSnapshotMonth(draftMonth),
        activeAssets.map((asset) => ({
          assetId: asset.id,
          value: parseDraftValue(draftValues[asset.id]),
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save snapshot");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    setError(null);
    if (!nextOpen) {
      setSaving(false);
      return;
    }
    if (latestSnapshot && activeAssets.length > 0) {
      startNextMonth(
        activeAssets,
        latestSnapshot,
        setDraftMonth,
        setDraftValues,
      );
    }
  };

  if (!latestSnapshot) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button type="button" size="sm" onClick={() => handleOpenChange(true)}>
          <PlusIcon /> Monthly update
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monthly update</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Create an asset before recording monthly values.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button type="button" size="sm" onClick={() => handleOpenChange(true)}>
        <PlusIcon /> Monthly update
      </Button>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Monthly update</DialogTitle>
          <DialogDescription>
            Latest total {formatCurrency(getSnapshotTotal(latestSnapshot))}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[180px_1fr_auto_auto]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="net-worth-month">Month</Label>
              <Input
                id="net-worth-month"
                type="month"
                value={draftMonth}
                onChange={(event) => setDraftMonth(event.target.value)}
              />
            </div>
            <div className="ring-foreground/10 flex flex-col justify-center gap-1 px-3 py-2 ring-1">
              <span className="text-muted-foreground text-xs">
                Draft total {monthExists ? "(updates existing month)" : ""}
              </span>
              <span className="text-sm font-medium tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                startLatestMonth(
                  activeAssets,
                  latestSnapshot,
                  setDraftMonth,
                  setDraftValues,
                )
              }>
              Edit latest
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                startNextMonth(
                  activeAssets,
                  latestSnapshot,
                  setDraftMonth,
                  setDraftValues,
                )
              }>
              <PlusIcon /> Next month
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-64">Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Liquidity</TableHead>
                  <TableHead className="min-w-36 text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAssets.map((asset) => (
                  <MonthlyAssetValueRow
                    key={asset.id}
                    asset={asset}
                    value={draftValues[asset.id] ?? "0.00"}
                    onChange={(value) => {
                      setDraftValues((prev) => ({
                        ...prev,
                        [asset.id]: value,
                      }));
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            size="sm"
            disabled={saving || !draftMonth || activeAssets.length === 0}
            onClick={handleSave}>
            <FloppyDiskIcon /> {saving ? "Saving..." : "Save monthly values"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MonthlyAssetValueRow({
  asset,
  value,
  onChange,
}: {
  asset: NetWorthAsset;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{asset.name}</TableCell>
      <TableCell>{getCategoryName(asset.category)}</TableCell>
      <TableCell className="text-muted-foreground">
        {getLiquidityName(asset.liquidity)}
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="ml-auto w-32 text-right tabular-nums"
        />
      </TableCell>
    </TableRow>
  );
}

function startLatestMonth(
  assets: NetWorthAsset[],
  latestSnapshot: NetWorthSnapshot,
  setDraftMonth: (month: string) => void,
  setDraftValues: (values: DraftValues) => void,
) {
  setDraftMonth(formatMonthInput(latestSnapshot.month));
  setDraftValues(buildDraftValues(assets, latestSnapshot));
}

function startNextMonth(
  assets: NetWorthAsset[],
  latestSnapshot: NetWorthSnapshot,
  setDraftMonth: (month: string) => void,
  setDraftValues: (values: DraftValues) => void,
) {
  setDraftMonth(formatMonthInput(nextMonth(latestSnapshot.month)));
  setDraftValues(buildDraftValues(assets, latestSnapshot));
}

function buildDraftValues(
  assets: NetWorthAsset[],
  snapshot: NetWorthSnapshot,
): DraftValues {
  return Object.fromEntries(
    assets.map((asset) => [
      asset.id,
      getSnapshotValue(snapshot, asset.id).toFixed(2),
    ]),
  );
}

function parseDraftValue(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
