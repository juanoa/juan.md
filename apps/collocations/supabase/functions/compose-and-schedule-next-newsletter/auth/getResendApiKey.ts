export const getResendApiKey = () => {
  const apiKey = Deno.env.get("RESEND_API_KEY");

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  return apiKey;
};