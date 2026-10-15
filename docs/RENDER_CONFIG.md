# Configuración de producción (Render)

Esta aplicación usa Meteor Accounts, MongoDB, enlaces de verificación por correo y Checkout Pro de Mercado Pago. No guardes credenciales en el código fuente ni en archivos que se suban a GitHub.

## Variables de entorno en Render

En el servicio web de Render, abre **Environment** y define:

| Variable | Para qué sirve |
| --- | --- |
| `ROOT_URL` | URL pública real de la aplicación, por ejemplo `https://tu-app.onrender.com`. No uses localhost en producción. |
| `MONGO_URL` | Cadena de conexión a la base de datos de producción. Debe apuntar a la base que contiene las cuentas y subastas que quieres conservar. |
| `MAIL_URL` | URL SMTP del proveedor de correo. Usa las credenciales SMTP/app-password que proporcione el proveedor. |
| `MAIL_FROM` | Remitente verificado que el proveedor permite usar, por ejemplo `SubastasPro <no-reply@tudominio.com>`. |
| `ADMIN_EMAIL` | Correo de la cuenta que debe tener rol administrador. |
| `MP_ACCESS_TOKEN` | Access token de Mercado Pago. Debe mantenerse solo como variable privada del servidor. |
| `MP_NOTIFICATION_URL` | URL pública HTTPS del webhook, por ejemplo `https://tu-app.onrender.com/api/mercadopago/webhook`. |

Un formato SMTP típico se parece a `smtps://USUARIO:CONTRASEÑA@smtp.proveedor.com:465`; el valor exacto depende del proveedor. Si la contraseña contiene caracteres reservados de URL, codifícalos antes de ponerlos en la conexión SMTP.

Después de cambiar variables, guarda los cambios y reinicia/re-despliega el servicio. Revisa los logs para ver errores SMTP o de conexión a la base.

## Conservar las cuentas existentes

Render no puede leer automáticamente la base MongoDB que tienes en tu computadora. Si las cuentas funcionan en local pero no en producción, comprueba primero que `MONGO_URL` apunte a la base correcta y persistente.

Si las cuentas solo existen en el Mongo local, primero debes migrar la base (incluyendo `users`, `auctions` y las demás colecciones necesarias) a MongoDB de producción y luego configurar `MONGO_URL` con esa conexión. No pegues contraseñas de base de datos en el código ni en mensajes públicos.

El cierre de sesión utiliza `Meteor.logout()`; si el usuario entra y sale del sistema pero tras un despliegue vuelve a aparecer conectado, revisa que todas las instancias usan la misma base y que el despliegue está actualizado.

## Preparar el administrador

1. Crea o conserva una cuenta con el correo que vas a establecer en `ADMIN_EMAIL`.
2. Configura `ADMIN_EMAIL` en Render con ese mismo correo.
3. Reinicia/re-despliega el servicio.
4. El servidor asigna `role = "admin"` en el documento protegido de esa cuenta existente (fuera de `profile`) solo después de que el correo coincida y esté verificado. Si la cuenta aún no existe, créala con ese correo y abre el enlace de verificación; el servidor habilitará el rol al terminar la verificación. El arranque del servicio también corrige el rol de una cuenta ya verificada.

No añadas un formulario cliente para modificar roles. El rol debe asignarse desde el servidor y almacenarse en `Meteor.users`.

## Verificación de correo

El registro crea la cuenta en el servidor y solicita un correo de verificación. El enlace usa `ROOT_URL` y abre la ruta `/verify-email/:token`. Sin `MAIL_URL` y un remitente aceptado por tu proveedor SMTP, la cuenta puede crearse, pero el mensaje no llegará; revisa los logs del servidor.

Las cuentas antiguas pueden solicitar otro enlace desde la pantalla de inicio de sesión. Publicar subastas y pujar exige que la cuenta tenga un correo verificado.

## Mercado Pago

1. Primero prueba con credenciales de prueba de Mercado Pago y usuarios de prueba. Cambia a credenciales de producción solo después de validar el flujo.
2. Guarda el token en `MP_ACCESS_TOKEN`; nunca lo incluyas en un archivo React ni en una variable `VITE_*`/cliente.
3. Configura `MP_NOTIFICATION_URL` con la ruta pública HTTPS que aparece arriba.
4. El servidor crea una preferencia con el total calculado a partir de los datos de MongoDB. No acepta el importe del navegador como fuente de verdad.
5. El webhook vuelve a consultar el pago en la API de Mercado Pago y compara estado, referencia, importe y moneda antes de marcar una orden como pagada.

Por tratarse de subastas, el checkout solo permite pagar productos cuya subasta haya finalizado y cuyo ganador sea el usuario conectado. Los productos activos o las subastas ganadas por otra persona deben quitarse del carrito antes de pagar.

Para probar el webhook desde localhost necesitas un túnel público HTTPS o un entorno desplegado; Mercado Pago no puede llamar a `localhost`.

## Comprobaciones después del despliegue

- Registra una cuenta nueva, verifica el correo y confirma que puede iniciar sesión y cerrar sesión.
- Inicia sesión con una cuenta que ya existía en la base de producción.
- Abre una tarjeta desde Inicio y desde Catálogo; revisa imagen, descripción, precio inicial, precio actual y las pujas históricas.
- Confirma que el rol de administrador se ve en la barra y que una cuenta normal no puede acceder al panel.
- En móvil, verifica que la barra solo muestre marca, carrito, cierre de sesión y botón hamburguesa, y que el menú desplegable contenga las secciones.
- Prueba primero pagos con credenciales de prueba y verifica que la orden solo cambie a pagada después del webhook confirmado.
