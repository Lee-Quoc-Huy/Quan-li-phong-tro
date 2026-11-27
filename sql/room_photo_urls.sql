-- Apply to existing databases before enabling room photo uploads.
ALTER TABLE public.phong ADD COLUMN IF NOT EXISTS chi_tiet JSONB;
