# Proposal

## Why

El enunciado (módulo 4.2) pide una página de inicio institucional para "Mi Plata": menú con "Iniciar sesión" y "Registrarse", presentación de la empresa, identidad visual de banco y footer con información corporativa y redes sociales. Hoy `/` es directamente el formulario de login, no existe una forma pública de pedir una cuenta y solo el gerente puede registrar clientes. Un visitante no puede conocer el banco ni iniciar su proceso de registro.

## What Changes

- **Landing page** en `/`: barra de navegación con "Iniciar sesión" y "Registrarse", sección principal, presentación institucional (misión, quiénes somos), los tres productos con sus condiciones, y footer con datos corporativos y enlaces a redes sociales. Diseño responsivo con identidad visual propia (paleta verde/dorado, logotipo en SVG, sin recursos externos) y accesible.
- **Rutas:** el login pasa de `/` a `/login`; nueva página `/registro`. Las vistas protegidas redirigen a `/login` y cerrar sesión lleva a la landing. Los sitios público y de paneles se agrupan en layouts distintos.
- **Solicitudes de registro:** `/registro` no crea usuarios; crea una **solicitud** (nombre, contraseña, tipo de producto y saldo inicial si aplica) que queda pendiente hasta que el gerente la apruebe o la rechace. Al aprobar se crea el cliente con las reglas de registro actuales; al rechazar se descarta la solicitud.
- **Gerente:** nueva sección "Solicitudes de registro" en `/gerente` con lista de pendientes, aprobar y rechazar.
- **Unicidad:** una solicitud se rechaza si el nombre ya es un usuario o ya tiene una solicitud pendiente.
- **BREAKING:** `/` deja de ser el login (marcadores y pruebas de navegador deben usar `/login`).
- La consola no cambia (registro directo por el gerente).

## Capabilities

### New Capabilities
- `landing-page`: página de inicio institucional, navegación pública, identidad visual, footer y accesibilidad básica.
- `registration-requests`: enviar, listar, aprobar y rechazar solicitudes de registro de clientes.

### Modified Capabilities
- `web-client`: el login vive en `/login`, las redirecciones sin sesión van a `/login`, cerrar sesión lleva a la landing, y la vista del gerente incluye las solicitudes.

## Impact

- Código: nueva entidad `RegistrationRequest`, errores, puerto `RegistrationRequestRepository` con implementaciones in-memory y LocalStorage, casos de uso `Submit/List/Approve/RejectRegistrationRequestUseCase`; en `app/`: grupos de rutas, `page.js` (landing), `login/`, `registro/`, componentes de sitio, estilos y archivo de contenido; `AuthGuard`, `src/infraestructure/web/{container,errorMessages}.js`, `app/gerente/page.js`.
- Tests: dominio, repos, casos de uso y mensajes de error; recorrido de navegador (landing, navegación, solicitud, aprobación y rechazo, responsivo) en dev y producción; scripts Playwright existentes migran de `/` a `/login`.
- Docs: README (rutas, flujo de registro) y ARCHITECTURE.
- Persistencia: nueva clave `mi-plata:v1:registration-requests` en `localStorage`; sin cambios en las claves existentes.
- Supuestos: los textos corporativos, direcciones y enlaces de redes son ficticios y editables desde un único archivo de contenido; la contraseña de una solicitud se guarda en texto plano en `localStorage` (misma limitación que los usuarios) y no se muestra al gerente; el solicitante no ve el estado de su solicitud (solo puede iniciar sesión cuando se apruebe); el envío y la revisión de solicitudes existen solo en la web (la consola tiene datos en memoria separados y mantiene el registro directo).
