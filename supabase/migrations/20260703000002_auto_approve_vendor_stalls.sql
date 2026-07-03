-- Auto-approve existing pending vendor stall claims
UPDATE public.vendor_stalls
SET
  claim_status = 'approved',
  reviewed_at = COALESCE(reviewed_at, NOW())
WHERE claim_status = 'pending';

ALTER TABLE public.vendor_stalls
  ALTER COLUMN claim_status SET DEFAULT 'approved';
