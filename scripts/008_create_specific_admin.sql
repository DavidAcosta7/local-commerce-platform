-- Crear usuario administrador específico
-- IMPORTANTE: El usuario debe registrarse primero en la aplicación con el correo kanekikirito010@gmail.com
-- Luego ejecutar este script para otorgarle permisos de administrador

-- Actualizar el rol del usuario a admin basándose en su correo electrónico
UPDATE profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'kanekikirito010@gmail.com';

-- Verificar que el usuario fue actualizado correctamente
SELECT 
  id,
  email,
  role,
  user_type,
  created_at,
  updated_at
FROM profiles
WHERE email = 'kanekikirito010@gmail.com';

-- Si el usuario no existe todavía, este mensaje te lo indicará
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'kanekikirito010@gmail.com') THEN
    RAISE NOTICE 'ATENCIÓN: El usuario con correo kanekikirito010@gmail.com no existe todavía.';
    RAISE NOTICE 'Por favor, registra primero este correo en la aplicación y luego ejecuta este script.';
  ELSE
    RAISE NOTICE 'Usuario actualizado exitosamente a rol ADMIN';
  END IF;
END $$;
