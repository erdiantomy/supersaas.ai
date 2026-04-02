import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

// RevenueCat webhook event types we care about
const PURCHASE_EVENTS = [
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
];
const CANCELLATION_EVENTS = [
  "CANCELLATION",
  "EXPIRATION",
];
const REFUND_EVENTS = ["BILLING_ISSUE", "SUBSCRIBER_ALIAS"];

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authorization header matches our webhook secret
    const REVENUECAT_WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    if (!REVENUECAT_WEBHOOK_SECRET) {
      console.error("REVENUECAT_WEBHOOK_SECRET is not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // RevenueCat sends the auth key in the Authorization header
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
    const providedSecret = authHeader.replace("Bearer ", "");

    if (providedSecret !== REVENUECAT_WEBHOOK_SECRET) {
      console.error("Invalid webhook authorization");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the webhook payload
    const body = await req.json();
    const event = body.event;

    if (!event) {
      return new Response(
        JSON.stringify({ error: "No event in payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const eventType: string = event.type;
    const appUserId: string = event.app_user_id || "";
    const productId: string = event.product_id || "";
    const currency: string = (event.currency || "USD").toUpperCase();
    const priceInPurchasedCurrency: number = event.price_in_purchased_currency || event.price || 0;
    const transactionId: string = event.transaction_id || event.id || "";
    const expirationDate: string | null = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;
    const purchaseDate: string | null = event.purchased_at_ms
      ? new Date(event.purchased_at_ms).toISOString()
      : event.event_timestamp_ms
      ? new Date(event.event_timestamp_ms).toISOString()
      : new Date().toISOString();

    console.log(`RevenueCat webhook: ${eventType} | User: ${appUserId} | Product: ${productId} | Amount: ${priceInPurchasedCurrency} ${currency}`);

    // Initialize Supabase client with service role
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Determine payment status from event type
    let paymentStatus = "pending";
    if (PURCHASE_EVENTS.includes(eventType)) {
      paymentStatus = "paid";
    } else if (CANCELLATION_EVENTS.includes(eventType)) {
      paymentStatus = "cancelled";
    } else if (REFUND_EVENTS.includes(eventType)) {
      paymentStatus = "refunded";
    }

    // Try to find the client by matching app_user_id to a client's user_id
    let clientId: string | null = null;
    if (appUserId) {
      // First try matching as user_id in clients table
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", appUserId)
        .limit(1)
        .maybeSingle();
      
      if (client) {
        clientId = client.id;
      }
    }

    // Check if this transaction already exists (idempotency)
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("revenuecat_id", transactionId)
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Update existing payment
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: paymentStatus,
          amount: priceInPurchasedCurrency,
          currency: currency,
          paid_at: paymentStatus === "paid" ? purchaseDate : null,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating payment:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update payment" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Updated existing payment ${existing.id} to status: ${paymentStatus}`);
    } else {
      // Create new payment record
      const { error: insertError } = await supabase
        .from("payments")
        .insert({
          client_id: clientId,
          amount: priceInPurchasedCurrency,
          currency: currency,
          status: paymentStatus,
          description: `${eventType}: ${productId}`,
          revenuecat_id: transactionId,
          paid_at: paymentStatus === "paid" ? purchaseDate : null,
        });

      if (insertError) {
        console.error("Error creating payment:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create payment" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Created new payment for transaction: ${transactionId}`);
    }

    return new Response(
      JSON.stringify({ success: true, event_type: eventType }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook processing error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
