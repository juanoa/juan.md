import { getSupabaseClient } from "../auth/getSupabaseClient.ts";
import type { CollocationRow } from "./getNextCollocation.ts";

export const saveUsedCollocation = async (
  collocation: CollocationRow,
  audienceTopicId: string,
) => {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("used_collocations").insert({
    audience_topic_id: audienceTopicId,
    collocation_id: collocation.id,
    collocation_slug: collocation.slug,
  });

  if (error) {
    throw new Error(`Failed to save used collocation: ${error.message}`);
  }
};
