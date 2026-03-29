import { Resend } from "resend";

import { getResendApiKey } from "../auth/getResendApiKey.ts";
import type { TopicNewsletterContent } from "./generateTopicNewsletterContent.ts";
import type { CollocationRow } from "./getNextCollocation.ts";
import type { TemplateResponse } from "./getTemplate.ts";
import type { Topic } from "./getTopics.ts";
import {
  buildNewsletterTemplateVariables,
  renderTemplateString,
  resolveTemplateVariables,
} from "./sendOwnerNewsletterPreview.ts";

const SCHEDULED_AT = "tomorrow at 9am";
const RATE_LIMIT_DELAY_MS = 1000;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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
  const variables = buildNewsletterTemplateVariables({
    collocation,
    newsletterContent,
    topic,
  });
  const resolvedVariables = resolveTemplateVariables(template, variables);
  const from = renderTemplateString(template.from, resolvedVariables);
  const subject = renderTemplateString(template.subject, resolvedVariables);

  if (!from) {
    throw new Error('Template is missing a "from" value.');
  }

  if (!subject) {
    throw new Error('Template is missing a "subject" value.');
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
