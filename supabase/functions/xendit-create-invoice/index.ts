const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const XENDIT_API_URL = 'https://api.xendit.co'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const XENDIT_SECRET_KEY = Deno.env.get('XENDIT_SECRET_KEY')
    if (!XENDIT_SECRET_KEY) {
      throw new Error('XENDIT_SECRET_KEY is not configured')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { payment_id, amount, currency, description, client_email, client_name, success_redirect_url } = body

    if (!payment_id || !amount || !description) {
      return new Response(JSON.stringify({ error: 'Missing required fields: payment_id, amount, description' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Xendit Invoice
    const xenditAuth = btoa(`${XENDIT_SECRET_KEY}:`)
    const invoicePayload: Record<string, unknown> = {
      external_id: payment_id,
      amount: Number(amount),
      currency: currency || 'IDR',
      description,
      payment_methods: [
        'CREDIT_CARD', 'BCA', 'BNI', 'BSI', 'BRI', 'MANDIRI', 'PERMATA',
        'ALFAMART', 'INDOMARET', 'OVO', 'DANA', 'SHOPEEPAY', 'LINKAJA',
        'ASTRAPAY', 'JENIUSPAY', 'QRIS',
      ],
    }

    if (client_email) invoicePayload.payer_email = client_email
    if (client_name) invoicePayload.customer = { given_names: client_name, email: client_email }
    if (success_redirect_url) invoicePayload.success_redirect_url = success_redirect_url

    const xenditRes = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${xenditAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoicePayload),
    })

    const xenditData = await xenditRes.json()

    if (!xenditRes.ok) {
      console.error('Xendit error:', xenditData)
      return new Response(JSON.stringify({ error: 'Failed to create Xendit invoice', details: xenditData }), {
        status: xenditRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update payment record with Xendit info
    await supabase.from('payments').update({
      xendit_invoice_id: xenditData.id,
      xendit_invoice_url: xenditData.invoice_url,
    }).eq('id', payment_id)

    return new Response(JSON.stringify({
      invoice_url: xenditData.invoice_url,
      invoice_id: xenditData.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
