CREATE OR REPLACE FUNCTION public.claim_owner()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  uid uuid := auth.uid();
  user_email text;
  email_confirmed boolean;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;

  SELECT lower(email), (email_confirmed_at IS NOT NULL)
    INTO user_email, email_confirmed
    FROM auth.users
   WHERE id = uid;

  -- Only allowlisted, verified emails may hold the admin role
  IF user_email IS NULL
     OR user_email NOT IN ('shameer.ep53@gmail.com', 'razalmadathil1235@gmail.com')
     OR NOT email_confirmed THEN
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid);
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
  RETURN true;
END;
$function$