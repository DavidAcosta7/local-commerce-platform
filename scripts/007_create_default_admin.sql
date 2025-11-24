-- Instructions to create default admin user
-- This script provides the SQL to create an admin profile after the user is created through Supabase Auth

-- Step 1: Create the admin user through Supabase Dashboard:
-- Go to Authentication > Users > Add User
-- Email: admin@plataforma.com
-- Password: (choose a secure password)
-- Auto Confirm User: Yes

-- Step 2: Once the user is created, get the user ID and run this SQL:
-- Replace 'USER_ID_HERE' with the actual UUID of the created user

-- Example (replace the UUID):
-- insert into public.profiles (id, email, full_name, role)
-- values (
--   'USER_ID_HERE'::uuid,
--   'admin@plataforma.com',
--   'Administrador del Sistema',
--   'admin'
-- )
-- on conflict (id) do update
-- set role = 'admin';

-- Or update an existing user to admin:
-- update public.profiles
-- set role = 'admin'
-- where email = 'admin@plataforma.com';

-- You can also promote any existing user to admin by their email:
-- update public.profiles
-- set role = 'admin'
-- where email = 'YOUR_EMAIL_HERE';
