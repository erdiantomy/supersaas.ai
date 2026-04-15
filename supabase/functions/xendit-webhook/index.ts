const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const XENDIT_WEBHOOK_TOKEN = Deno.env.get('XENDIT_WEBHOOK_TOKEN')
    if (!XENDIT_WEBHOOK_TOKEN) {
      throw new Error('XENDIT_WEBHOOK_TOKEN is not configured')
    }

    // Verify webhook token
    const callbackToken = req.headers.get('x-callback-token')
    if (callbackToken !== XENDIT_WEBHOOK_TOKEN) {
      console.error('Invalid webhook token')
      return new Response(JSON.stringify({ error: 'Invalid callback token' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    console.log('Xendit webhook received:', JSON.stringify(body))

    const { external_id, status, paid_at, paid_amount, payment_method, payment_channel } = body

    if (!external_id) {
      return new Response(JSON.stringify({ error: 'Missing external_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Map Xendit status to our status
    let paymentStatus = 'pending'
    if (status === 'PAID' || status === 'SETTLED') {
      paymentStatus = 'paid'
    } else if (status === 'EXPIRED') {
      paymentStatus = 'overdue'
    }

    const update: Record<string, unknown> = { status: paymentStatus }
    if (paymentStatus === 'paid') {
      update.paid_at = paid_at || new Date().toISOString()
    }

    const { error } = await supabase
      .from('payments')
      .update(update)
      .eq('id', external_id)

    if (error) {
      console.error('DB update error:', error)
      return new Response(JSON.stringify({ error: 'Failed to update payment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Payment ${external_id} updated to ${paymentStatus}`)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
