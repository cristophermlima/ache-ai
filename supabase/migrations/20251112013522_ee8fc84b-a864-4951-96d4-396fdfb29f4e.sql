-- Remove admin role from old email and add to new email
DO $$
DECLARE
  _old_user_id uuid;
  _new_user_id uuid;
BEGIN
  -- Get old user id
  SELECT id INTO _old_user_id FROM auth.users WHERE email = 'hubache.ai@gmail.com' LIMIT 1;
  
  -- Remove admin role from old user
  IF _old_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles 
    WHERE user_id = _old_user_id AND role = 'admin';
  END IF;
  
  -- Get new user id
  SELECT id INTO _new_user_id FROM auth.users WHERE email = 'crislima.dev@gmail.com' LIMIT 1;
  
  -- Add admin role to new user
  IF _new_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    RAISE NOTICE 'Email crislima.dev@gmail.com não encontrado. Por favor, cadastre-se em /lojista/cadastro primeiro.';
  END IF;
END
$$;