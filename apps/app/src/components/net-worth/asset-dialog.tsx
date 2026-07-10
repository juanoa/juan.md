import { useMemo, useState } from "react";

import { Button } from "@juan/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@juan/ui/components/ui/dialog";
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
  NET_WORTH_ASSET_CATEGORIES,
  NET_WORTH_ASSET_LIQUIDITY_LEVELS,
  type NetWorthAsset,
  type NetWorthAssetCategory,
  type NetWorthAssetInput,
  type NetWorthAssetLiquidity,
} from "../../lib/net-worth/types";

interface NetWorthAssetDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  submittingLabel: string;
  assets: NetWorthAsset[];
  initialAsset?: NetWorthAsset;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: NetWorthAssetInput) => Promise<void>;
}

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      *
    </span>
  );
}

function normalizeAssetName(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function NetWorthAssetDialog({
  open,
  title,
  submitLabel,
  submittingLabel,
  assets,
  initialAsset,
  onOpenChange,
  onSubmit,
}: NetWorthAssetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <NetWorthAssetDialogForm
          key={initialAsset?.id ?? "new"}
          title={title}
          submitLabel={submitLabel}
          submittingLabel={submittingLabel}
          assets={assets}
          initialAsset={initialAsset}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

type NetWorthAssetDialogFormProps = Omit<NetWorthAssetDialogProps, "open">;

function NetWorthAssetDialogForm({
  title,
  submitLabel,
  submittingLabel,
  assets,
  initialAsset,
  onOpenChange,
  onSubmit,
}: NetWorthAssetDialogFormProps) {
  const [name, setName] = useState(initialAsset?.name ?? "");
  const [category, setCategory] = useState<NetWorthAssetCategory>(
    initialAsset?.category ?? "cash",
  );
  const [liquidity, setLiquidity] = useState<NetWorthAssetLiquidity>(
    initialAsset?.liquidity ?? "instant",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const duplicateAsset = useMemo(() => {
    if (trimmedName === "") return false;
    const normalized = normalizeAssetName(trimmedName);
    return assets.some(
      (asset) =>
        asset.id !== initialAsset?.id &&
        normalizeAssetName(asset.name) === normalized,
    );
  }, [assets, initialAsset?.id, trimmedName]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubmitting(false);
      setError(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (trimmedName === "" || duplicateAsset) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName, category, liquidity });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save asset");
      setSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="net-worth-asset-name">
            Name <RequiredMark />
          </Label>
          <Input
            id="net-worth-asset-name"
            value={name}
            autoFocus
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder="Revolut Cuenta Remunerada"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="net-worth-asset-category">
              Category <RequiredMark />
            </Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value as NetWorthAssetCategory);
                setError(null);
              }}>
              <SelectTrigger id="net-worth-asset-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NET_WORTH_ASSET_CATEGORIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="net-worth-asset-liquidity">
              Liquidity <RequiredMark />
            </Label>
            <Select
              value={liquidity}
              onValueChange={(value) => {
                setLiquidity(value as NetWorthAssetLiquidity);
                setError(null);
              }}>
              <SelectTrigger id="net-worth-asset-liquidity" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NET_WORTH_ASSET_LIQUIDITY_LEVELS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {duplicateAsset && (
          <p className="text-destructive text-xs">
            An asset with this name already exists.
          </p>
        )}
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={submitting || trimmedName === "" || duplicateAsset}
          onClick={handleSubmit}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
