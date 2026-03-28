import type { APIRoute } from "astro";
import { Resend } from "resend";

const ROLE_TOPICS = {
  "Software Engineer": "2ee6ea81-ec23-475e-8fb4-a8c89380a3d5",
  "Product Designer": "8faa9967-91a9-4c5c-8ef5-5861dc18f8b7",
  "Product Manager": "5fb01f80-59db-4f51-8786-fd54d4417401",
  "C-Level": "390d7a4a-869c-480c-8ad7-5357365f6282",
} as const;

const TOPIC_IDS = Object.values(ROLE_TOPICS);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Role = keyof typeof ROLE_TOPICS;

function json(message: string, status = 200) {
  return Response.json({ message }, { status });
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && value in ROLE_TOPICS;
}

function getTopicSubscriptions(role: Role) {
  const selectedTopicId = ROLE_TOPICS[role];

  return TOPIC_IDS.map((topicId) => ({
    id: topicId,
    subscription: topicId === selectedTopicId ? "opt_in" : "opt_out",
  })) as {
    id: string;
    subscription: "opt_in" | "opt_out";
  }[];
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const segmentId = import.meta.env.RESEND_BROADCAST_SEGMENT_ID;

  if (!apiKey) {
    return json("Missing RESEND_API_KEY.", 500);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json("Invalid request body.", 400);
  }

  const email =
    typeof payload === "object" &&
    payload !== null &&
    "email" in payload &&
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";

  const role =
    typeof payload === "object" && payload !== null && "role" in payload
      ? payload.role
      : undefined;

  if (!EMAIL_REGEX.test(email)) {
    return json("Enter a valid email address.", 400);
  }

  if (!isRole(role)) {
    return json("Select a valid role.", 400);
  }

  const resend = new Resend(apiKey);
  const existingContact = await resend.contacts.get({ email });

  if (existingContact.error && existingContact.error.name !== "not_found") {
    return json(
      existingContact.error.message,
      existingContact.error.statusCode ?? 502,
    );
  }

  if (existingContact.data) {
    const updatedContact = await resend.contacts.update({
      email,
      unsubscribed: false,
    });

    if (updatedContact.error) {
      return json(
        updatedContact.error.message,
        updatedContact.error.statusCode ?? 502,
      );
    }

    const updatedTopics = await resend.contacts.topics.update({
      email,
      topics: getTopicSubscriptions(role),
    });

    if (updatedTopics.error) {
      return json(
        updatedTopics.error.message,
        updatedTopics.error.statusCode ?? 502,
      );
    }

    return json("Subscription updated.");
  }

  const createdContact = await resend.contacts.create({
    email,
    unsubscribed: false,
    segmentId,
    topics: getTopicSubscriptions(role),
  });

  if (createdContact.error) {
    return json(
      createdContact.error.message,
      createdContact.error.statusCode ?? 502,
    );
  }

  return json("Subscription confirmed.", 201);
};
