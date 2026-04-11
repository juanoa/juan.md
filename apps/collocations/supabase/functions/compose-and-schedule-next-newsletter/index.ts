import "@supabase/functions-js/edge-runtime.d.ts";
import { getNextCollocation } from "./utils/getNextCollocation.ts";
import { generateTopicNewsletterContent } from "./utils/generateTopicNewsletterContent.ts";
import { saveUsedCollocation } from "./utils/saveUsedCollocation.ts";
import { scheduleTopicBroadcast } from "./utils/scheduleTopicBroadcast.ts";
import { sendOwnerNewsletterPreview } from "./utils/sendOwnerNewsletterPreview.ts";
import { getTemplate } from "./utils/getTemplate.ts";
import { getTopics } from "./utils/getTopics.ts";
import { parseRequestBody } from "./utils/parseRequestBody.ts";

Deno.serve(async (request) => {
  try {
    const { topics: requestedTopicIds = [] } = await parseRequestBody(request);
    const [template, topics] = await Promise.all([getTemplate(), getTopics()]);
    const filteredTopics =
      requestedTopicIds.length === 0
        ? topics
        : {
            ...topics,
            has_more: false,
            data: requestedTopicIds.map((topicId) => {
              const topic = topics.data.find(({ id }) => id === topicId);

              if (!topic) {
                throw Object.assign(new Error(`Topic not found: ${topicId}`), {
                  status: 404,
                });
              }

              return topic;
            }),
          };

    const topicsWithNewsletterContent = [];

    for (const topic of filteredTopics.data) {
      const collocation = await getNextCollocation(topic.id);
      const newsletterContent = await generateTopicNewsletterContent({
        collocation,
        topic,
      });

      const ownerPreviewEmail = await sendOwnerNewsletterPreview({
        collocation,
        newsletterContent,
        template,
        topic,
      });

      const broadcast = await scheduleTopicBroadcast({
        collocation,
        newsletterContent,
        template,
        topic,
      });

      topicsWithNewsletterContent.push({
        ...topic,
        collocation,
        newsletterContent,
        ownerPreviewEmail,
        broadcast,
      });
    }

    await Promise.all(
      topicsWithNewsletterContent.map(({ collocation, id }) =>
        saveUsedCollocation(collocation, id),
      ),
    );

    return new Response(
      JSON.stringify({
        collocation:
          topicsWithNewsletterContent.length === 1
            ? topicsWithNewsletterContent[0].collocation
            : null,
        template,
        topics: {
          ...filteredTopics,
          data: topicsWithNewsletterContent,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
});
