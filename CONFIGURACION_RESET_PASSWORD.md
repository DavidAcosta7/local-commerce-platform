# Configuración de Restablecimiento de Contraseña

Este documento explica cómo configurar el restablecimiento de contraseña en Supabase para que funcione correctamente con la aplicación.

## Pasos de Configuración

### 1. Configurar URL de Redirección en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **URL Configuration**
3. En la sección **Redirect URLs**, agrega la siguiente URL:
   ```
   http://localhost:3000/auth/reset-password
   ```
   (Para producción, agrega también tu dominio: `https://tudominio.com/auth/reset-password`)

### 2. Configurar Plantilla de Email (Opcional)

1. Ve a **Authentication** → **Email Templates**
2. Selecciona la plantilla **Reset Password**
3. Puedes personalizar el email, pero asegúrate de que el enlace apunte a:
   ```
   {{ .ConfirmationURL }}
   ```
   Este token será reemplazado automáticamente por Supabase con la URL correcta.

### 3. Verificar Configuración de Email

1. Ve a **Settings** → **Auth**
2. Asegúrate de que **Enable Email Confirmations** esté habilitado
3. Verifica que el **SMTP** esté configurado correctamente (o usa el servicio de email de Supabase)

### 4. Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## Flujo de Restablecimiento

1. **Usuario solicita restablecimiento**: El usuario hace clic en "¿Olvidaste tu contraseña?" en la página de login
2. **Ingresa email**: El usuario ingresa su correo electrónico en `/auth/forgot-password`
3. **Email enviado**: Supabase envía un email con un enlace de restablecimiento
4. **Usuario hace clic en el enlace**: El enlace lo lleva a `/auth/reset-password` con un token en el hash de la URL
5. **Usuario ingresa nueva contraseña**: El usuario ingresa y confirma su nueva contraseña
6. **Contraseña actualizada**: La contraseña se actualiza y el usuario es redirigido al login

## Notas Importantes

- Los enlaces de restablecimiento expiran por seguridad (por defecto después de 1 hora)
- El token viene en el hash de la URL (`#access_token=...`), no en los query params
- Supabase maneja automáticamente la autenticación cuando el usuario hace clic en el enlace
- La aplicación verifica que el token sea válido antes de permitir cambiar la contraseña

## Solución de Problemas

### El enlace no funciona
- Verifica que la URL de redirección esté configurada correctamente en Supabase
- Asegúrate de que el dominio coincida exactamente (incluyendo http/https y puerto)

### El token expira muy rápido
- Puedes ajustar el tiempo de expiración en Supabase Dashboard → Settings → Auth → JWT expiry

### No recibo el email
- Revisa la carpeta de spam
- Verifica la configuración SMTP en Supabase
- Asegúrate de que el email esté registrado en la base de datos

