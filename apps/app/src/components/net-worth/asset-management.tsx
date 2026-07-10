import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@juan/ui/components/ui/alert-dialog";
import { Badge } from "@juan/ui/components/ui/badge";
import { Button } from "@juan/ui/components/ui/button";
import { Input } from "@juan/ui/components/ui/input";
import { Label } from "@juan/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@juan/ui/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@juan/ui/components/ui/table";

import { formatMonth } from "../../lib/net-worth/date";
import {
  getLatestAssetSummaries,
  getSnapshotValue,
} from "../../lib/net-worth/stats";
import {
  NET_WORTH_ASSET_CATEGORIES,
  type NetWorthAsset,
  type NetWorthAssetCategory,
  type NetWorthSnapshot,
} from "../../lib/net-worth/types";
import { NetWorthAssetDialog } from "./asset-dialog";
import { useNetWorthContext } from "./NetWorthContext";
import {
  formatCurrency,
  getCategoryName,
  getLiquidityName,
} from "./net-worth-format";

type CategoryFilter = NetWorthAssetCategory | "all";
type StatusFilter = "active" | "archived" | "all";

export function NetWorthAssetManagement() {
  const { assets, snapshots, createAsset, updateAsset, deleteAsset } =
    useNetWorthContext();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<NetWorthAsset | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<NetWorthAsset | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const summaries = useMemo(
    () => getLatestAssetSummaries(assets, snapshots),
    [assets, snapshots],
  );
  const summaryByAssetId = useMemo(
    () => new Map(summaries.map((summary) => [summary.asset.id, summary])),
    [summaries],
  );

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return assets.filter((asset) => {
      const matchesQuery =
        normalizedQuery === "" ||
        asset.name.toLocaleLowerCase().includes(normalizedQuery);
      const matchesCategory = category === "all" || asset.category === category;
      const matchesStatus =
        status === "all" ||
        (status === "active" && asset.archivedAt === null) ||
        (status === "archived" && asset.archivedAt !== null);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [assets, category, query, status]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setActionError(null);
    try {
      await deleteAsset(target.id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to remove asset");
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Assets</h2>
          <p className="text-muted-foreground text-xs">
            {assets.filter((asset) => asset.archivedAt === null).length} active
            assets
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon /> New asset
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="net-worth-asset-search">Search</Label>
          <Input
            id="net-worth-asset-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Finizens"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="net-worth-category-filter">Category</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as CategoryFilter)}>
            <SelectTrigger id="net-worth-category-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {NET_WORTH_ASSET_CATEGORIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="net-worth-status-filter">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}>
            <SelectTrigger id="net-worth-status-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {actionError && <p className="text-destructive text-xs">{actionError}</p>}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-60">Asset</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Liquidity</TableHead>
              <TableHead className="text-right">Current value</TableHead>
              <TableHead>Last value</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => (
              <NetWorthAssetRow
                key={asset.id}
                asset={asset}
                currentValue={summaryByAssetId.get(asset.id)?.value ?? 0}
                lastRecordedMonth={getLastRecordedMonth(asset, snapshots)}
                onEdit={() => setEditingAsset(asset)}
                onDelete={() => setDeleteTarget(asset)}
              />
            ))}
            {filteredAssets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-24 text-center">
                  No assets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NetWorthAssetDialog
        open={createOpen}
        title="New asset"
        submitLabel="Create"
        submittingLabel="Creating..."
        assets={assets}
        onOpenChange={setCreateOpen}
        onSubmit={async (input) => {
          await createAsset(input);
        }}
      />

      <NetWorthAssetDialog
        open={editingAsset !== undefined}
        title="Edit asset"
        submitLabel="Save"
        submittingLabel="Saving..."
        assets={assets}
        initialAsset={editingAsset}
        onOpenChange={(open) => {
          if (!open) setEditingAsset(undefined);
        }}
        onSubmit={async (input) => {
          if (!editingAsset) return;
          await updateAsset(editingAsset.id, input);
        }}
      />

      <NetWorthAssetDeleteDialog
        asset={deleteTarget}
        hasHistory={
          deleteTarget
            ? snapshots.some((snapshot) =>
                snapshot.values.some(
                  (value) => value.assetId === deleteTarget.id,
                ),
              )
            : false
        }
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </section>
  );
}

function NetWorthAssetRow({
  asset,
  currentValue,
  lastRecordedMonth,
  onEdit,
  onDelete,
}: {
  asset: NetWorthAsset;
  currentValue: number;
  lastRecordedMonth: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-medium">{asset.name}</span>
          {asset.archivedAt !== null && (
            <Badge variant="secondary" className="w-fit">
              Archived
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{getCategoryName(asset.category)}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {getLiquidityName(asset.liquidity)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatCurrency(currentValue)}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {lastRecordedMonth ? formatMonth(lastRecordedMonth) : "-"}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${asset.name}`}
            onClick={onEdit}>
            <PencilSimpleIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${asset.name}`}
            onClick={onDelete}>
            <TrashIcon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function NetWorthAssetDeleteDialog({
  asset,
  hasHistory,
  onOpenChange,
  onConfirm,
}: {
  asset: NetWorthAsset | null;
  hasHistory: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={asset !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasHistory ? "Archive asset?" : "Delete asset?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasHistory
              ? "This asset has monthly values, so it will be hidden from new updates while keeping historical charts intact."
              : "This asset has no monthly values yet and will be permanently deleted."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={onConfirm}>
            {hasHistory ? "Archive" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getLastRecordedMonth(
  asset: NetWorthAsset,
  snapshots: NetWorthSnapshot[],
): string | null {
  const matches = snapshots.filter(
    (snapshot) => getSnapshotValue(snapshot, asset.id) > 0,
  );
  const last = matches[matches.length - 1];
  return last?.month ?? null;
}
