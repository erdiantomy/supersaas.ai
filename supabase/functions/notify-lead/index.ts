import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const ADMIN_EMAIL = "tom@nosecret.co";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const { name, email, company, budget, message } = await req.json();

    const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #00E676; margin-bottom: 20px;">🚀 New Lead from SuperSaaS.ai</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Name:</td><td style="padding: 8px 0; color: #555;">${name}</td></tr>
    <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td><td style="padding: 8px 0; color: #555;"><a href="mailto:${email}">${email}</a></td></tr>
    <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Company:</td><td style="padding: 8px 0; color: #555;">${company || "Not provided"}</td></tr>
    <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Budget:</td><td style="padding: 8px 0; color: #555;">${budget || "Not specified"}</td></tr>
  </table>
  <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
    <p style="font-weight: bold; color: #333; margin: 0 0 8px;">Message:</p>
    <p style="color: #555; margin: 0;">${message || "No message provided"}</p>
  </div>
  <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
  <p style="color: #999; font-size: 12px;">This notification was sent from the SuperSaaS.ai lead form.</p>
</div>`.trim();

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "SuperSaaS.ai <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        reply_to: email,
        subject: `New Lead: ${name}${company ? ` (${company})` : ""}`,
        html: htmlBody,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Resend API failed [${response.status}]: ${JSON.stringify(result)}`);
    }

    console.log("Email sent:", result);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
