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
const GENERIC_SUCCESS_MESSAGE = "Thanks for subscribing.";

type Role = keyof typeof ROLE_TOPICS;

function json(message: string, status = 200) {
  return Response.json({ message }, { status });
}

function genericSuccess() {
  return json(GENERIC_SUCCESS_MESSAGE);
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
    console.error("Missing RESEND_API_KEY.");
    return genericSuccess();
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return genericSuccess();
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
    return genericSuccess();
  }

  if (!isRole(role)) {
    return genericSuccess();
  }

  const resend = new Resend(apiKey);
  const existingContact = await resend.contacts.get({ email });

  if (existingContact.error && existingContact.error.name !== "not_found") {
    console.error("Failed to fetch newsletter contact.", existingContact.error);
    return genericSuccess();
  }

  if (existingContact.data) {
    // Preserve existing contacts exactly as they are and avoid leaking state.
    return genericSuccess();
  }

  const createdContact = await resend.contacts.create({
    email,
    unsubscribed: false,
    segmentId,
    topics: getTopicSubscriptions(role),
  });

  if (createdContact.error) {
    console.error("Failed to create newsletter contact.", createdContact.error);
    return genericSuccess();
  }

  return genericSuccess();
};
