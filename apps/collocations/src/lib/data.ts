import { createClient } from "@supabase/supabase-js";
import collocationsJson from "content/collocations.json";
import functionWordsJson from "content/function-words.json";
import type { Collocation } from "src/types/Collocation";

type CollocationRow = {
  slug: string;
  label: string;
  examples: string[] | null;
};

const getDevCollocations = (): Collocation[] => collocationsJson as Collocation[];

const getDevFunctionWords = (): string[] => functionWordsJson as string[];

const getSupabaseClient = () => {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_ANON_KEY for build/production.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export const getCollocations = async (): Promise<Collocation[]> => {
  if (import.meta.env.DEV) {
    return getDevCollocations();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("collocations")
    .select("slug, label, examples")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to load collocations from Supabase: ${error.message}`);
  }

  return (data satisfies CollocationRow[]).map((row) => ({
    slug: row.slug,
    label: row.label,
    examples: row.examples ?? [],
  }));
};

export const getFunctionWords = async (): Promise<string[]> => {
  if (import.meta.env.DEV) {
    return getDevFunctionWords();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("function_words")
    .select("word")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load function words from Supabase: ${error.message}`,
    );
  }

  return data.map(({ word }) => word);
};
