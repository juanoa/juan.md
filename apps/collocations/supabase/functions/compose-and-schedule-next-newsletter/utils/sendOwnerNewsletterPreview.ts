import { Resend } from "resend";

import { getResendApiKey } from "../auth/getResendApiKey.ts";
import type { TopicNewsletterContent } from "./generateTopicNewsletterContent.ts";
import type { CollocationRow } from "./getNextCollocation.ts";
import type { TemplateResponse } from "./getTemplate.ts";
import type { Topic } from "./getTopics.ts";

const RATE_LIMIT_DELAY_MS = 1000;

const TEMPLATE_ALIAS = "daily-collocation";
const DEFAULT_TIME_ZONE = "Europe/Madrid";
const TOMORROW_WEEKDAYS = new Set([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
]);

export type NewsletterTemplateVariables = {
  ROLE: string;
  NEXT_DAY: string;
  COLLOCATION: string;
  EXAMPLE_1: string;
  EXAMPLE_2: string;
  INTRODUCTION: string;
  HOW_TO_USE: string;
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getOwnerEmail = () => {
  const ownerEmail = Deno.env.get("OWNER_EMAIL");

  if (!ownerEmail) {
    throw new Error("Missing OWNER_EMAIL.");
  }

  return ownerEmail;
};

const getNextDayLabel = () => {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: DEFAULT_TIME_ZONE,
  })
    .format(new Date())
    .toLowerCase();

  return TOMORROW_WEEKDAYS.has(weekday) ? "tomorrow" : "on monday";
};

export const buildNewsletterTemplateVariables = ({
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

export const resolveTemplateVariables = (
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

export const renderTemplateString = (
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

const getTopicTagValue = (topicName: string) =>
  topicName.replaceAll(/[^a-zA-Z0-9_-]/g, "-");

export const sendOwnerNewsletterPreview = async ({
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
  const variables = buildNewsletterTemplateVariables({
    collocation,
    newsletterContent,
    topic,
  });

  const ownerEmail = getOwnerEmail();
  const resend = new Resend(getResendApiKey());

  await sleep(RATE_LIMIT_DELAY_MS);

  const { data, error } = await resend.emails.send(
    {
      from: template.from,
      to: ownerEmail,
      subject: `${topic.name} - ${template.subject}`,
      replyTo: template.reply_to ?? undefined,
      template: {
        id: TEMPLATE_ALIAS,
        variables,
      },
      tags: [
        { name: "type", value: "owner_preview" },
        { name: "topic", value: getTopicTagValue(topic.name) },
      ],
    },
    {
      idempotencyKey: `owner-preview-${collocation.slug}-${topic.id}`,
    },
  );

  if (error) {
    throw Object.assign(new Error(error.message), {
      status: error.statusCode ?? 502,
    });
  }

  return {
    id: data?.id,
    to: ownerEmail,
    variables,
  };
};
