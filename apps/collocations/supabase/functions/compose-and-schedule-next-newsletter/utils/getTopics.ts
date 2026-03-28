type Topic = {
  id: string;
  name: string;
  description: string | null;
  default_subscription: string;
  visibility: string;
  created_at: string;
};

export type TopicsResponse = {
  object: "list";
  has_more: boolean;
  data: Topic[];
};

const getResendApiKey = () => {
  const apiKey = Deno.env.get("RESEND_API_KEY");

  console.log(apiKey);
  

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  return apiKey;
};

export const getTopics = async (): Promise<TopicsResponse> => {
  const response = await fetch("https://api.resend.com/topics", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw Object.assign(
      new Error(`Failed to load topics: ${response.status} ${errorBody}`),
      { status: response.status },
    );
  }

  return await response.json() as TopicsResponse;
};
