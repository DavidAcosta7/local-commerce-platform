-- Script para convertir kanekikirito010@gmail.com en administrador
-- Este script se ejecuta después de que el usuario se haya registrado

-- Primero verificamos si el perfil existe
DO $$
DECLARE
  user_exists BOOLEAN;
  user_profile_id UUID;
BEGIN
  -- Verificar si existe el perfil
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE email = 'kanekikirito010@gmail.com'
  ) INTO user_exists;

  IF user_exists THEN
    -- Actualizar el rol a admin
    UPDATE profiles
    SET 
      role = 'admin',
      updated_at = NOW()
    WHERE email = 'kanekikirito010@gmail.com'
    RETURNING id INTO user_profile_id;
    
    RAISE NOTICE '✅ Usuario convertido exitosamente a ADMIN';
    RAISE NOTICE 'ID del usuario: %', user_profile_id;
  ELSE
    -- Si no existe, intentar crearlo desde auth.users
    INSERT INTO profiles (id, email, role, user_type, created_at, updated_at)
    SELECT 
      au.id,
      au.email,
      'admin',
      COALESCE(au.raw_user_meta_data->>'user_type', 'customer'),
      au.created_at,
      NOW()
    FROM auth.users au
    WHERE au.email = 'kanekikirito010@gmail.com'
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', updated_at = NOW()
    RETURNING id INTO user_profile_id;
    
    IF user_profile_id IS NOT NULL THEN
      RAISE NOTICE '✅ Perfil creado y usuario convertido a ADMIN';
      RAISE NOTICE 'ID del usuario: %', user_profile_id;
    ELSE
      RAISE NOTICE '❌ ERROR: No se encontró el usuario en auth.users';
      RAISE NOTICE 'Verifica que hayas completado el registro y verificado tu email';
    END IF;
  END IF;
END $$;

-- Mostrar el estado final del usuario
SELECT 
  id,
  email,
  role,
  user_type,
  created_at,
  updated_at
FROM profiles
WHERE email = 'kanekikirito010@gmail.com';
