ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS xendit_invoice_id text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS xendit_invoice_url text;