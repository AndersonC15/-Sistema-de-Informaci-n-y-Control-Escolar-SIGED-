# Entrega 3: Planificación académica

## Objetivo de la entrega
Ampliar el **SIGED** incorporando la planificación académica por institución educativa mediante la gestión de planes de estudio, grados escolares y asignaturas.

## Contexto funcional
Con la autenticación y la gestión institucional ya incorporadas, el sistema debe permitir que la autoridad académica administre la estructura académica de la institución que tiene asignada. Esta planificación debe organizarse de forma jerárquica y consistente.

La planificación académica responde a una jerarquía general como la siguiente:

**Institución educativa → Plan de estudio → Grado escolar → Asignatura**

## Actores relevantes

- **Autoridad académica**: Usuario con capacidad de operar dentro del contexto de una institución educativa asignada cuando su asignación esté activa.

## Alcance de la entrega

La funcionalidad debe contemplar, como mínimo, lo siguiente:

- El menú lateral debe mostrar únicamente las funcionalidades correspondientes al contexto institucional. En este contexto, debe incluir las opciones Volver al menú principal, que permite retornar al menú lateral del contexto general del sistema; Mi institución, que dirige al dashboard institucional de la entidad seleccionada; y Planes de estudio, que conduce a la vista de gestión de planes de estudio de la institución seleccionada.
- El sistema debe permitir visualizar los planes de estudio de una institución educativa de forma paginada, con navegación entre páginas y con ordenamiento por nombre y estado.
- El sistema debe permitir buscar planes de estudio por nombre dentro de una institución educativa.
- El sistema debe permitir registrar un nuevo plan de estudio ingresando los datos obligatorios.
- El sistema debe permitir editar la información de un plan de estudio existente.
- Antes de eliminar un plan de estudio, el sistema debe solicitar confirmación y realizar la eliminación solo si esta es aceptada.
- En una misma institución educativa solo debe existir un plan de estudio vigente a la vez.
- El sistema debe permitir visualizar los grados escolares asociados a un plan de estudio de forma paginada, con navegación entre páginas y con ordenamiento por nombre, orden, nivel y subnivel.
- El sistema debe permitir buscar grados escolares por nombre dentro de un plan de estudio.
- El sistema debe permitir registrar un nuevo grado escolar ingresando los datos obligatorios, asociándolo a un nivel educativo y, cuando corresponda, a un subnivel educativo.
- El sistema debe permitir editar la información de un grado escolar existente, manteniendo la obligatoriedad del nivel educativo y, cuando aplique, del subnivel educativo.
- Antes de eliminar un grado escolar, el sistema debe solicitar confirmación y realizar la eliminación solo si esta es aceptada.
- El sistema debe permitir visualizar las asignaturas asociadas a un grado escolar.
- El sistema debe permitir registrar una nueva asignatura ingresando los datos obligatorios y la carga pedagógica correspondiente.
- El sistema debe permitir editar la información de una asignatura existente.
- Antes de eliminar una asignatura, el sistema debe solicitar confirmación y realizar la eliminación solo si esta es aceptada.
- El sistema debe mostrar una alerta en la vista del grado escolar cuando la suma de la carga pedagógica de sus asignaturas sea menor que la carga pedagógica mínima semanal definida para el subnivel educativo correspondiente o, en su defecto, para el nivel educativo.

## Modelo general del dominio

Las entidades principales del dominio son:

- **PlanEstudio**: Representa la planificación curricular de una institución educativa, con nombre y estado.
- **EducacionNivel**: Representa un nivel educativo del sistema, con nombre,  minutos por período pedagógico y períodos pedagógicos mínimos semanales.
- **EducacionSubNivel**: Representa un subnivel educativo asociado a un nivel educativo, con nombre, minutos por período pedagógico y períodos pedagógicos mínimos semanales.
- **GradoEscolar**: Representa un grado o año escolar que forma parte de un plan de estudio. Se vincula obligatoriamente a un nivel educativo y, cuando aplique, a un subnivel educativo, con nombre y orden.
- **Asignatura**: Representa una unidad curricular asociada a un grado escolar, con nombre y períodos pedagógicos mínimos semanales.

## Interfaz de usuario y navegabilidad del frontend

Los prototipos de referencia son:

**Dashboard institucional**  
Desde la pantalla **Mis instituciones**, la **autoridad académica** navega al dashboard institucional de una institución educativa mediante la acción **Ingresar** disponible en cada registro. 

- Maquetación visual: `./docs/prototypes/stitch_dashboard_my_institution/screen.png`
- Prototipo en HTML: `./docs/prototypes/stitch_dashboard_my_institution/code.html`

**Pantalla de gestión de planes de estudio**  
Desde el dashboard institucional, la **autoridad académica** puede acceder a la vista de gestión de planes de estudio de la institución seleccionada.

- Maquetación visual: `./docs/prototypes/stitch_study_plans/screen.png`
- Prototipo en HTML: `./docs/prototypes/stitch_study_plans/code.html`

**Pantalla de gestión de grados escolares y asignaturas**  
Desde la pantalla de gestión de planes de estudio, la **autoridad académica** puede acceder a la vista de gestión de grados escolares y asignaturas correspondiente al plan de estudio seleccionado.

- Maquetación visual: `./docs/prototypes/stitch_degrees_subjects/screen.png`
- Prototipo en HTML: `./docs/prototypes/stitch_degrees_subjects/code.html`

Lineamientos a cumplir:

- La lista de asignaturas por grado escolar debe mostrarse en la misma pantalla, y su creación y edición deben realizarse mediante un modal.

## Resultado esperado

Se espera una solución funcional que permita gestionar planes de estudio, grados escolares y asignaturas dentro del contexto de una institución educativa.

