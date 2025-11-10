-- Ensure admin role for specific email
DO $$
DECLARE
  _user_id uuid;
BEGIN
  -- Look up the user id by email
  SELECT id INTO _user_id FROM auth.users WHERE email = 'hubache.ai@gmail.com' LIMIT 1;

  IF _user_id IS NOT NULL THEN
    -- Insert admin role if not already present
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    RAISE NOTICE 'Email hubache.ai@gmail.com não encontrado. Peça ao usuário para concluir o cadastro e tentar novamente.';
  END IF;
END
$$;