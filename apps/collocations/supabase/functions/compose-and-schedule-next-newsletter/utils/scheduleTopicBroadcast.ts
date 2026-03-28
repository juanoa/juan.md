import { Resend } from "resend";

import { getResendApiKey } from "../auth/getResendApiKey.ts";
import type { CollocationRow } from "./getNextCollocation.ts";
import type { TemplateResponse } from "./getTemplate.ts";
import type { Topic } from "./getTopics.ts";
import type { TopicNewsletterContent } from "./generateTopicNewsletterContent.ts";

type NewsletterTemplateVariables = {
  ROLE: string;
  NEXT_DAY: string;
  COLLOCATION: string;
  EXAMPLE_1: string;
  EXAMPLE_2: string;
  INTRODUCTION: string;
  HOW_TO_USE: string;
};

const DEFAULT_TIME_ZONE = "Europe/Madrid";
const SCHEDULED_AT = "in 1 minute";
const RATE_LIMIT_DELAY_MS = 1000;
const TOMORROW_WEEKDAYS = new Set([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
]);

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getNextDayLabel = () => {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: DEFAULT_TIME_ZONE,
  })
    .format(new Date())
    .toLowerCase();

  return TOMORROW_WEEKDAYS.has(weekday) ? "tomorrow" : "on monday";
};

const buildTemplateVariables = ({
  collocation,
  newsletterContent,
  topic,
}: {
  collocation: CollocationRow;
  newsletterContent: TopicNewsletterContent;
  topic: Topic;
}): NewsletterTemplateVariables => ({
  ROLE: topic.name,
  NEXT_DAY: getNextDayLabel(),
  COLLOCATION: collocation.label,
  EXAMPLE_1: newsletterContent.EXAMPLE_1,
  EXAMPLE_2: newsletterContent.EXAMPLE_2,
  INTRODUCTION: newsletterContent.INTRODUCTION,
  HOW_TO_USE: newsletterContent.HOW_TO_USE,
});

const TEMPLATE_VARIABLE_PATTERN = /{{{\s*([A-Z0-9_]+)(?:\|[^}]*)?\s*}}}/g;

const resolveTemplateVariables = (
  template: TemplateResponse,
  variables: NewsletterTemplateVariables,
) => {
  const resolvedVariables: Record<string, string> = {};

  for (const templateVariable of template.variables) {
    const explicitValue =
      variables[templateVariable.key as keyof NewsletterTemplateVariables];
    const value = explicitValue ?? templateVariable.fallback_value;

    if (value === null || value === undefined) {
      throw new Error(`Missing template variable "${templateVariable.key}".`);
    }

    resolvedVariables[templateVariable.key] = String(value);
  }

  return resolvedVariables;
};

const renderTemplateString = (
  value: string | null,
  variables: Record<string, string>,
) => {
  if (!value) {
    return value;
  }

  return value.replace(
    TEMPLATE_VARIABLE_PATTERN,
    (match, key: string) => variables[key] ?? match,
  );
};

export const scheduleTopicBroadcast = async ({
  collocation,
  newsletterContent,
  template,
  topic,
}: {
  collocation: CollocationRow;
  newsletterContent: TopicNewsletterContent;
  template: TemplateResponse;
  topic: Topic;
}) => {
  const variables = buildTemplateVariables({
    collocation,
    newsletterContent,
    topic,
  });

  const resolvedVariables = resolveTemplateVariables(template, variables);
  const from = renderTemplateString(template.from, resolvedVariables);
  const subject = renderTemplateString(template.subject, resolvedVariables);

  if (!from) {
    throw new Error('Template "daily-collocation" is missing a "from" value.');
  }

  if (!subject) {
    throw new Error(
      'Template "daily-collocation" is missing a "subject" value.',
    );
  }

  const segmentId = Deno.env.get("RESEND_BROADCAST_SEGMENT_ID");

  if (!segmentId) {
    throw new Error("Missing RESEND_BROADCAST_SEGMENT_ID.");
  }

  const resend = new Resend(getResendApiKey());
  await sleep(RATE_LIMIT_DELAY_MS);

  const { data, error } = await resend.broadcasts.create({
    segmentId,
    from,
    subject,
    html:
      renderTemplateString(template.html, resolvedVariables) ?? template.html,
    text: renderTemplateString(template.text, resolvedVariables) ?? undefined,
    replyTo: template.reply_to,
    topicId: topic.id,
    name: `${template.name} - ${topic.name} - ${collocation.slug}`,
    send: true,
    scheduledAt: SCHEDULED_AT,
  });

  if (error) {
    if (error.statusCode === 429) {
      console.warn(
        `Resend rate limit reached while scheduling "${topic.name}". Aborting without retry to avoid duplicate broadcasts.`,
      );
    }

    throw Object.assign(new Error(error.message), {
      status: error.statusCode ?? 502,
    });
  }

  return {
    id: data?.id,
    scheduledAt: SCHEDULED_AT,
    variables,
  };
};
