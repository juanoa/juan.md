import "@supabase/functions-js/edge-runtime.d.ts";
import { getNextCollocation } from "./utils/getNextCollocation.ts";
import { generateTopicNewsletterContent } from "./utils/generateTopicNewsletterContent.ts";
import { scheduleTopicBroadcast } from "./utils/scheduleTopicBroadcast.ts";
import { getTemplate } from "./utils/getTemplate.ts";
import { getTopics } from "./utils/getTopics.ts";

Deno.serve(async () => {
  try {
    const [collocation, template, topics] = await Promise.all([
      getNextCollocation(),
      getTemplate(),
      getTopics(),
    ]);

    const topicsWithNewsletterContent = await Promise.all(
      topics.data.map(async (topic) => {
        const newsletterContent = await generateTopicNewsletterContent({ collocation,topic });

        const broadcast = await scheduleTopicBroadcast({
          collocation,
          newsletterContent,
          template,
          topic,
        });

        return {
          ...topic,
          newsletterContent,
          broadcast,
        };
      }),
    );

    return new Response(
      JSON.stringify({
        collocation,
        template,
        topics: {
          ...topics,
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
