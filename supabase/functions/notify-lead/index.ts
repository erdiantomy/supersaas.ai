import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "tom@nosecret.co";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { name, email, company, budget, message } = await req.json();

    // Send notification email via Resend-compatible API or SMTP
    // For now, use a simple fetch to a mail endpoint
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    const emailBody = `
New Lead Submission from SuperSaaS.ai

Name: ${name}
Email: ${email}
Company: ${company || "Not provided"}
Budget: ${budget || "Not specified"}
Message: ${message || "No message"}

---
Reply directly to this email or reach out to the lead.
    `.trim();

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
</div>
    `.trim();

    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SuperSaaS.ai <noreply@notify.nosecret.co>",
          to: [ADMIN_EMAIL],
          reply_to: email,
          subject: `New Lead: ${name}${company ? ` (${company})` : ""}`,
          html: htmlBody,
          text: emailBody,
        }),
      });
      const result = await res.json();
      console.log("Email sent:", result);
    } else {
      console.log("No RESEND_API_KEY set, logging lead instead:", { name, email, company, budget, message });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
