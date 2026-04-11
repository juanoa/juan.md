import { getSupabaseClient } from "../auth/getSupabaseClient.ts";

export type CollocationRow = {
  id: number;
  slug: string;
  label: string;
  examples: string[] | null;
};

export const getNextCollocation = async (
  audienceTopicId: string,
): Promise<CollocationRow> => {
  const supabase = getSupabaseClient();

  const { data: usedCollocations, error: usedCollocationsError } =
    await supabase
      .from("used_collocations")
      .select("collocation_id")
      .eq("audience_topic_id", audienceTopicId);

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
    .select("id, slug, label, examples")
    .order("id", { ascending: true })
    .limit(1);

  if (usedIds.length > 0) {
    query = query.not("id", "in", `(${usedIds.join(",")})`);
  }

  const { data: nextCollocation, error: availableCollocationsError } =
    await query.maybeSingle();

  if (availableCollocationsError) {
    throw new Error(
      `Failed to load available collocations: ${availableCollocationsError.message}`,
    );
  }

  if (!nextCollocation) {
    throw new Error("No unused collocations available.");
  }

  return nextCollocation;
};
