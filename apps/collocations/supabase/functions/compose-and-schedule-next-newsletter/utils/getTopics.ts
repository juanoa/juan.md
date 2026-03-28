import { Resend } from "resend";
import { getResendApiKey } from "../auth/getResendApiKey.ts"

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



export const getTopics = async (): Promise<TopicsResponse> => {
  const resend = new Resend(getResendApiKey());
  const { data, error } = await resend.topics.list();

  if (error) {
    throw Object.assign(new Error(error.message), {
      status: error.statusCode ?? 502,
    });
  }

  return data as TopicsResponse;
};
