# Entrega 1: Autenticación de Usuario

## Objetivo de la entrega
Desarrollar la funcionalidad de autenticación del **SIGED** para permitir el acceso seguro de usuarios registrados y activos, así como el cierre de sesión cuando corresponda.

## Contexto funcional
El SIGED requiere un mecanismo de acceso que permita validar la identidad de los usuarios antes de habilitar el uso de cualquier funcionalidad del sistema. En esta primera entrega se establece la base de acceso mediante el inicio y cierre de sesión, de manera que únicamente los usuarios registrados y activos puedan ingresar al sistema y acceder a la pantalla inicial autenticada.

## Actores relevantes

- **Usuario del sistema**: Persona registrada en el sistema que puede iniciar sesión utilizando sus credenciales cuando su cuenta se encuentre activa.

## Alcance de la entrega

La funcionalidad debe contemplar, como mínimo, lo siguiente:

- El inicio de sesión debe pedir el número de identificación y la contraseña, y no debe continuar si alguno de los dos campos está vacío.
- Cuando las credenciales correspondan a un usuario registrado y con cuenta activa, el sistema debe permitir el acceso e ingresar a la pantalla Home.
- Si las credenciales ingresadas no son correctas, el sistema debe mostrar un mensaje de error claro.
- Si la cuenta del usuario está inactiva, el sistema debe mostrar un mensaje de error claro indicando esa situación.
- El usuario debe poder cerrar sesión desde una opción visible en la interfaz autenticada; al hacerlo, la sesión debe finalizar y el sistema debe llevarlo nuevamente a la pantalla de inicio de sesión.
- Si no existe una sesión válida, el sistema no debe permitir el acceso a pantallas protegidas y debe redirigir al usuario a la pantalla de inicio de sesión.


## Modelo general del dominio

Las entidades principales del dominio son:

- **Usuario**, que representa a las personas que acceden al sistema.
- **Token**, que representa el mecanismo de autenticación asociado al usuario.

## Interfaz de usuario y navegabilidad del frontend

Los prototipos de referencia son:

**Pantalla de inicio de sesión**
- Maquetación visual: `./docs/prototypes/stitch_login/screen.png`
- Prototipo en HTML: `./docs/prototypes/stitch_login/code.html`

**Pantalla inicial autenticada posterior al inicio de sesión**
- Maquetación visual: `./docs/prototypes/stitch_dashboard/screen.png`
- Prototipo en HTML: `./docs/prototypes/stitch_dashboard/code.html`

## Resultado esperado

Se espera una solución funcional que permita al usuario el inicio de sesión, el cierre de sesión y la protección de accesos restringidos dentro del sistema.