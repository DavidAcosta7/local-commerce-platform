-- Script para verificar y corregir el perfil de administrador

-- 1. Verificar el estado actual
DO $$
DECLARE
  admin_email TEXT := 'kanekikirito010@gmail.com';
  user_id UUID;
  current_role TEXT;
BEGIN
  -- Buscar el user_id del email
  SELECT id INTO user_id FROM auth.users WHERE email = admin_email;
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'ERROR: No se encontró un usuario con el email %', admin_email;
  ELSE
    RAISE NOTICE 'Usuario encontrado: ID = %', user_id;
    
    -- Verificar si existe el perfil
    SELECT role INTO current_role FROM public.profiles WHERE id = user_id;
    
    IF current_role IS NULL THEN
      RAISE NOTICE 'Creando perfil de administrador...';
      INSERT INTO public.profiles (id, email, full_name, role, created_at)
      VALUES (user_id, admin_email, 'Administrador', 'admin', NOW())
      ON CONFLICT (id) DO UPDATE SET role = 'admin';
      RAISE NOTICE 'ÉXITO: Perfil creado con rol admin';
    ELSIF current_role = 'admin' THEN
      RAISE NOTICE 'ÉXITO: El usuario ya tiene rol de admin';
    ELSE
      RAISE NOTICE 'Actualizando rol de % a admin...', current_role;
      UPDATE public.profiles SET role = 'admin' WHERE id = user_id;
      RAISE NOTICE 'ÉXITO: Rol actualizado a admin';
    END IF;
  END IF;
END $$;

-- 2. Mostrar el estado final
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'kanekikirito010@gmail.com';
