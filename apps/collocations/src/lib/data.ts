import type { Collocation } from "@/types/Collocation";
import collocationsJson from "content/collocations.json";
import functionWordsJson from "content/function-words.json";

export const getCollocations = (): Collocation[] =>
  collocationsJson as Collocation[];

export const getFunctionWords = (): string[] => functionWordsJson as string[];
