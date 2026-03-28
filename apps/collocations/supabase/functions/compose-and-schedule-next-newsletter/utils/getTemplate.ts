import { Resend } from "resend";
import { getResendApiKey } from "../auth/getResendApiKey.ts";

type TemplateVariable = {
  id: string;
  key: string;
  type: string;
  fallback_value: string | number | null;
  created_at: string;
  updated_at: string;
};

export type TemplateResponse = {
  object: "template";
  id: string;
  current_version_id: string;
  alias: string | null;
  name: string;
  created_at: string;
  updated_at: string;
  status: string;
  published_at: string | null;
  from: string | null;
  subject: string | null;
  reply_to: string | null;
  html: string;
  text: string | null;
  variables: TemplateVariable[];
  has_unpublished_versions: boolean;
};

export const getTemplate = async (): Promise<TemplateResponse> => {
  const resend = new Resend(getResendApiKey());
  const { data, error } = await resend.templates.get("daily-collocation");

  if (error) {
    throw Object.assign(new Error(error.message), {
      status: error.statusCode ?? 502,
    });
  }

  return data as TemplateResponse;
};
