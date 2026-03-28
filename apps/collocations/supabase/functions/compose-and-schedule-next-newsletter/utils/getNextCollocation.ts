import { getSupabaseClient } from "./getSupabaseClient.ts";

export type CollocationRow = {
  id: number;
  slug: string;
  label: string;
  examples: string[] | null;
};

export const getNextCollocation = async (): Promise<CollocationRow> => {
  const supabase = getSupabaseClient();

  const { data: usedCollocations, error: usedCollocationsError } = await supabase
    .from("used_collocations")
    .select("collocation_id");

  if (usedCollocationsError) {
    throw new Error(
      `Failed to load used collocations: ${usedCollocationsError.message}`,
    );
  }

  const usedIds = (usedCollocations ?? []).map(
    ({ collocation_id }) => collocation_id,
  );
  let query = supabase
    .from("collocations")
    .select("id, slug, label, examples");

  if (usedIds.length > 0) {
    query = query.not("id", "in", `(${usedIds.join(",")})`);
  }

  const { data: availableCollocations, error: availableCollocationsError } =
    await query;

  if (availableCollocationsError) {
    throw new Error(
      `Failed to load available collocations: ${availableCollocationsError.message}`,
    );
  }

  const collocations = availableCollocations ?? [];

  if (collocations.length === 0) {
    throw new Error("No unused collocations available.");
  }

  const randomIndex = Math.floor(Math.random() * collocations.length);

  return collocations[randomIndex];
};
