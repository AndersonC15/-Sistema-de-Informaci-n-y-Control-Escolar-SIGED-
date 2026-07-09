# Entrega 2: Gestión de instituciones educativas y autoridades académicas

## Objetivo de la entrega
Ampliar el **SIGED** incorporando la gestión de instituciones educativas y la administración de sus autoridades académicas dentro del contexto institucional correspondiente.

## Contexto funcional
Una vez resuelto el acceso al sistema, se requiere incorporar la administración de instituciones educativas. Además, el sistema debe permitir establecer qué usuarios cumplen el rol de autoridad académica en una institución determinada y restringir su acceso al contexto institucional asignado.


## Actores relevantes

- **Administrador**: Usuario responsable de gestionar instituciones educativas y asignar autoridades académicas.
- **Autoridad académica**: Usuario con capacidad de operar dentro del contexto de una institución educativa asignada cuando su asignación esté activa.

## Alcance de la entrega

La funcionalidad debe contemplar, como mínimo, lo siguiente:

- El menú lateral debe mostrar las funcionalidades disponibles según los roles activos del usuario autenticado. En este contexto, el rol ADMINISTRADOR debe visualizar la opción Instituciones, mientras que el rol AUTORIDAD_ACADEMICA debe visualizar la opción Mis instituciones.
- El sistema debe permitir visualizar el listado de instituciones educativas registradas con su información básica y autoridades académicas activas, de forma paginada, con navegación entre páginas y con ordenamiento por nombre, código y RUC.
- El sistema debe permitir registrar una nueva institución educativa ingresando los datos obligatorios definidos para su creación.
- El sistema debe permitir editar la información de una institución educativa existente.
- Antes de eliminar una institución educativa, el sistema debe solicitar confirmación y ejecutar la eliminación solo si esta es aceptada.
- El sistema debe permitir buscar instituciones educativas por nombre.
- El sistema debe permitir visualizar las asignaciones de autoridades académicas asociadas a una institución educativa.
- El sistema debe permitir asignar una o más autoridades académicas a una institución educativa.
- El sistema debe permitir editar los datos de una asignación de autoridad académica realizada a una institución educativa.
- Antes de eliminar la asignación de una autoridad académica, el sistema debe solicitar confirmación y ejecutar la eliminación solo si esta es aceptada.
- El sistema debe permitir activar y desactivar una asignación de autoridad académica por institución educativa.
- Una autoridad académica solo debe poder acceder a las instituciones educativas que tenga asignadas de forma activa.

## Modelo general del dominio

Las entidades principales del dominio son:

- **Institución Educativa**: Representa una institución educativa administrada por el sistema, con nombre, código y ruc, donde código y ruc son campos únicos.
- **Usuario**: Representa a una persona registrada en el sistema susceptible de tener uno o más roles.
- **Rol**: Representa el tipo de rol que puede asumir un usuario dentro del sistema, tales como `ADMINISTRADOR`, `AUTORIDAD_ACADEMICA`, `DOCENTE`, `SECRETARIA`, `ESTUDIANTE` y `DECE`. En esta funcionalidad, interesan especialmente `ADMINISTRADOR` y `AUTORIDAD_ACADEMICA`.
- **UsuarioRol**: Representa la asignación de un rol a un usuario y, cuando el rol lo requiere, su vinculación con una institución educativa, con información de activo, fecha de inicio y fin. En esta funcionalidad, la institución es obligatoria para el rol de `AUTORIDAD_ACADEMICA`.


## Interfaz de usuario y navegabilidad del frontend

Los prototipos de referencia son:

**Pantalla inicial autenticada**  
El **menú lateral** muestra las siguientes opciones de navegación:

- **Menú principal**, opción habilitada para todos los roles; al hacer clic, redirige a la pantalla **Home**.
- **Instituciones**, habilitada para el rol `ADMINISTRADOR`
- **Mis instituciones**, habilitada para el rol `AUTORIDAD_ACADEMICA`

**Pantalla de gestión de instituciones educativas**  
La opción **Instituciones** del menú lateral dirige a la pantalla de gestión de instituciones educativas con sus autoridades académicas.

- Maquetación visual: `./docs/prototypes/stitch_management_institutions/screen.png`
- Prototipo en HTML: `./docs/prototypes/stitch_management_institutions/code.html`

Lineamientos a cumplir:

- La gestión de autoridades académicas de una institución educativa debe realizarse mediante un modal.

**Pantalla de mis instituciones**  
La opción **Mis instituciones** del menú lateral dirige a la pantalla de mis instituciones.

- Maquetación visual: `./docs/prototypes/stitch_my_institutions/screen.png`
- Prototipo en HTML: `./docs/prototypes/stitch_my_institutions/code.html`

## Resultado esperado

Se espera una solución funcional que permita gestionar instituciones educativas, administrar asignaciones de autoridades académicas por institución y restringir el acceso institucional según las asignaciones activas del usuario.