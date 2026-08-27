REVOKE EXECUTE ON FUNCTION public.claim_owner() FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_owner() TO authenticated;