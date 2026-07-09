# Guía de trabajo para agentes — SIGED

**Última actualización:** 2026-04-28

## Propósito

Este archivo establece lineamientos generales para la implementación del proyecto **SIGED** por agentes. 

## Descripción general del sistema

El proyecto se desarrolla sobre un microdominio de un **Sistema de Información y Gestión Educativa (SIGED)**, enfocado en procesos esenciales de **administración institucional y planificación académica**. 

El alcance del sistema comprende la 1) autenticación de usuarios, 2) la gestión de instituciones educativas y sus autoridades académicas, así como 3) la planificación académica por institución a través de planes de estudio, grados escolares y asignaturas.

## Tecnologías de trabajo

- **Backend:** Python 3.11
- **Framework backend:** Django 4.x
- **API:** Django REST Framework
- **Autenticación:** `TokenAuthentication`
- **Base de datos:** SQLite mediante Django ORM
- **Frontend:** React
- **Framework de estilos frontend:** Tailwind CSS, con paleta de colores centralizada mediante variables reutilizables.
- **Pruebas:** Django `TestCase` y `pytest`

## Organización general del proyecto

La implementación debe mantenerse dentro del directorio raíz del proyecto `siged/`.

- el **backend** debe ubicarse en la carpeta `backend/`;
- el **frontend** debe ubicarse en la carpeta `frontend/`;


## Configuraciones de implementación en el backend

### Estructura esperada del backend

El backend debe organizarse de forma clara, permitiendo separar el manejo de solicitudes, la lógica del sistema y el acceso a la información:

- componentes de atención de solicitudes, responsables de recibir peticiones, procesar respuestas y exponer las operaciones del sistema;
- componentes de lógica de negocio, responsables de aplicar reglas y restricciones del dominio;
- componentes de acceso a datos, responsables de gestionar la interacción con la base de datos;
- componentes de validación y apoyo, responsables de estructurar datos de entrada y salida, así como de apoyar el control de acceso u otras verificaciones necesarias.

### Comandos de trabajo del backend

Flujo base de preparación:

- `cd backend`
- `python -m venv .venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`

Comandos de trabajo habituales:

- `python manage.py makemigrations`
- `python manage.py migrate`
- `python manage.py runserver`
- `python manage.py test`
- `pytest`

### Configuraciones base del backend

- El backend debe habilitar el panel de administración de Django dentro de la configuración principal de rutas. 
- El archivo `settings.py` del backend debe incluir la configuración de CORS para permitir la comunicación controlada con el frontend.
- Debe crearse un `superusuario` en el backend para el acceso inicial al panel de administración, utilizando los siguientes datos:
  - `username = "admin"`
  - `email = "admin@example.com"`
  - `password = "admin123"`
  - `numero_identificacion = "000000001"`
  - `first_name = "Administrador"`
  - `last_name = "Sistema"`

## Configuraciones de implementación en el frontend

### Estructura esperada del frontend

El frontend debe organizarse de forma modular, permitiendo separar presentación, navegación, estado y comunicación con el servidor:

- UI components, responsables de presentar formularios, tablas, botones, mensajes y vistas funcionales del sistema;
- routers, responsables de controlar la navegación entre vistas y módulos;
- state manager, responsable de mantener el estado global de la aplicación, incluyendo sesión, usuario autenticado y datos compartidos entre vistas;
- API services, responsables de centralizar la comunicación con el backend mediante solicitudes y respuestas estructuradas.

### Comandos de trabajo del frontend

Flujo base de preparación:

- `cd frontend`
- `npm create vite@latest .`
- `npm install`

Comandos de trabajo habituales:

- `npm run dev`
- `npm test`

### Configuraciones base del frontend

- La **URL base del backend** debe centralizarse en una única variable y reutilizarse en todas las rutas configuradas.
- El frontend debe ejecutarse en un **puerto fijo** y predefinido durante el desarrollo.
- Las **constantes globales** y reutilizables del frontend deben centralizarse en un único archivo.
- Las **URLs** consumidas por el frontend deben corresponder exactamente a los endpoints definidos en el backend y deben mantenerse centralizadas en una configuración común.
- El frontend debe utilizar **Tailwind CSS** como framework de estilos, a través de un **tema centralizado**, reutilizable y consistente en toda la interfaz, con una paleta de colores.
  - background: "#f3f4f6",
  - surface: "#ffffff",
  - primary: "#4c6ef5",
  - secondary: "#4f00d9",
  - accent: "#6d5efc",
  - success: "#16a34a",
  - warning: "#eab308",
  - danger: "#dc2626",
  - header-top: "#ffffff", para la barra superior
  - sidebar: "#330099", para el menú lateral desplegable
  - sidebar-active: "#7399FF", para la opción activa del menú lateral
  - sidebar-hover: "#6488EE", para el estado hover de las opciones del menú lateral
  - heading-block: "#F8FAFC", para el bloque principal de encabezado
  - heading-block-border: "#4c6ef5", para el borde superior del bloque principal de encabezado
- Los **íconos** deberán corresponder a la librería **Material Symbols Outlined**.

## Organización por archivo

La nomenclatura de archivos, clases, componentes, atributos y métodos debe seguir las convenciones propias de la tecnología de implementación utilizada, manteniendo uniformidad dentro del proyecto. 

En general, los archivos del backend deben nombrarse en snake_case, y en frontend en camelCase o kebab-case; las clases y componentes deben nombrarse en PascalCase; y los atributos, métodos y funciones en snake_case, procurando además un **orden** consistente dentro de cada archivo.

## Features registradas

- 001-user-auth
- 002-gestionar-instituciones
- 003-planificacion