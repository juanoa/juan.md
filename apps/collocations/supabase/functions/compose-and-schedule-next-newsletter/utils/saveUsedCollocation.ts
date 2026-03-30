import { getSupabaseClient } from "../auth/getSupabaseClient.ts";
import type { CollocationRow } from "./getNextCollocation.ts";

export const saveUsedCollocation = async (collocation: CollocationRow) => {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("used_collocations").insert({
    collocation_id: collocation.id,
    collocation_slug: collocation.slug,
  });

  if (error) {
    throw new Error(`Failed to save used collocation: ${error.message}`);
  }
};
