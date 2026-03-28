import { generateObject } from "ai";
import { z } from "zod";

import type { CollocationRow } from "./getNextCollocation.ts";
import type { Topic } from "./getTopics.ts";

export const topicNewsletterContentSchema = z.object({
  INTRODUCTION: z.string(),
  EXAMPLE_1: z.string(),
  EXAMPLE_2: z.string(),
  HOW_TO_USE: z.string(),
});

export type TopicNewsletterContent = z.infer<
  typeof topicNewsletterContentSchema
>;

export const generateTopicNewsletterContent = async ({
  collocation,
  topic,
}: {
  collocation: CollocationRow;
  topic: Topic;
}): Promise<TopicNewsletterContent> => {
  const model = Deno.env.get("AI_SDK_MODEL") || "openai/gpt-5-nano";

  const { object } = await generateObject({
    headers: {
      'http-referer': 'https://collocations.juan.md',
      'x-title': 'collocations.juan.md',
    },
    model,
    schema: topicNewsletterContentSchema,
    temperature: 0.8,
    system: [
      "You write short, practical newsletter copy for professionals learning English collocations.",
      "Adapt the tone, examples, and advice to the target role.",
      "Keep the content concrete, useful, and slightly witty without sounding try-hard.",
      "Return all fields in English.",
      "Every field must be a plain string.",
      "When generating HOW_TO_USE, return valid HTML with a single <div> root.",
      "Inside HOW_TO_USE, only use <p>, <ul>, <li>, <blockquote>, <strong>, and <em>.",
      "Do not wrap the HTML in Markdown code fences.",
    ].join(" "),
    prompt: [
      `Target role: ${topic.name}`,
      `Collocation of the day: ${collocation.label}`,
      "",
      "Generate these fields:",
      "- INTRODUCTION: one short paragraph, funny and close, tailored to the role and the collocation of the day.",
      "- EXAMPLE_1: one sentence showing the collocation in a realistic situation for that role.",
      "- EXAMPLE_2: a different sentence showing the collocation in another realistic situation for that role.",
      "- HOW_TO_USE: valid HTML with one <div> root and practical advice for how that role can start using the collocation today. Include at least one bullet list and one blockquote with a usable example.",
      "",
      "Quality rules:",
      `- Keep the collocation exactly as "${collocation.label}" when you use it.`,
      "- Avoid generic corporate filler.",
      "- Make the advice immediately usable at work today.",
      "- Keep the HTML compact and email-friendly.",
    ].join("\n"),
  });

  return object;
};
