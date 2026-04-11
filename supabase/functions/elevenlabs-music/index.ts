import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { prompt, duration } = await req.json();
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

  if (!ELEVENLABS_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`Generating music: "${prompt}" (${duration}s)`);

  const response = await fetch("https://api.elevenlabs.io/v1/music", {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      duration_seconds: duration || 30,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`ElevenLabs error: ${response.status} ${errorText}`);
    return new Response(JSON.stringify({ error: errorText }), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = base64Encode(audioBuffer);

  return new Response(JSON.stringify({ audioContent: base64Audio, size: audioBuffer.byteLength }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
