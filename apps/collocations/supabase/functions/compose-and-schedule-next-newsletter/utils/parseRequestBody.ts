export type ComposeAndScheduleNextNewsletterRequest = {
  topics?: string[];
};

const badRequest = (message: string): Error =>
  Object.assign(new Error(message), { status: 400 });

export const parseRequestBody = async (
  request: Request,
): Promise<ComposeAndScheduleNextNewsletterRequest> => {
  const body = await request.text();

  if (!body.trim()) {
    return {};
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(body);
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }

  if (
    typeof parsedBody !== "object" ||
    parsedBody === null ||
    Array.isArray(parsedBody)
  ) {
    throw badRequest("Request body must be a JSON object.");
  }

  const { topics } = parsedBody as { topics?: unknown };

  if (topics === undefined) {
    return {};
  }

  if (
    !Array.isArray(topics) || topics.some((topic) => typeof topic !== "string")
  ) {
    throw badRequest("`topics` must be an array of topic IDs.");
  }

  return {
    topics: [...new Set(topics.map((topic) => topic.trim()).filter(Boolean))],
  };
};
