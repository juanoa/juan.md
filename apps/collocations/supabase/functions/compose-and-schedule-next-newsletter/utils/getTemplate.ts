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
  const templateId = Deno.env.get("RESEND_BROADCAST_TEMPLATE_ID");

  if (!templateId) {
    throw new Error("Missing RESEND_BROADCAST_TEMPLATE_ID.");
  }

  const resend = new Resend(getResendApiKey());
  const { data, error } = await resend.templates.get(templateId);

  if (error) {
    throw Object.assign(new Error(error.message), {
      status: error.statusCode ?? 502,
    });
  }

  return data as TemplateResponse;
};
