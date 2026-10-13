# Design

## Context

La web (Next.js 16, App Router, JavaScript, todo Client Components con `localStorage`) tiene un `app/layout.js` que envuelve todo en `<main className="container">` (ancho máximo 760 px), un `app/page.js` que es el login, y las páginas protegidas `app/cliente` y `app/gerente` con `AuthGuard` (redirige a `/`). El composition root del navegador es `src/infraestructure/web/container.js` y los repos `LocalStorage*` usan snapshots JSON con claves `mi-plata:v1:*`. `RegisterUserUseCase` valida con `RegisterUserDTO`, rechaza nombres existentes y crea usuario y producto. Ver proposal.md para la motivación y los specs para los requisitos.

## Goals / Non-Goals

**Goals:**
- Una landing institucional atractiva, responsiva y accesible, y un flujo de solicitud de registro con aprobación del gerente que reutilice las reglas de registro existentes.
- Que los contenidos corporativos vivan en un solo archivo editable.
- Cero dependencias nuevas: sin librerías de UI, fuentes ni imágenes externas.

**Non-Goals:**
- Notificar al solicitante o mostrarle el estado de su solicitud.
- Solicitudes en la consola (sus datos están en memoria, separados de la web).
- CMS, internacionalización, modo oscuro, mostrar "Mi panel" en el menú cuando hay sesión, o analítica.
- Cifrado de contraseñas (misma limitación que los usuarios).

## Decisions

1. **Grupos de rutas para dos "cascarones".** Los grupos no cambian las URL: `app/(site)/` contiene `layout.js` (SiteHeader + `<main id="contenido">` + SiteFooter, ancho completo), `page.js` (landing), `login/page.js` y `registro/page.js`; `app/(panel)/` contiene `layout.js` (el actual `<main className="container">`) y las carpetas `cliente/` y `gerente/`. `app/layout.js` queda con `<html lang="es"><body>`, metadata y `globals.css`. Los archivos se mueven con `git mv` para conservar historial.
   *Alternativa descartada*: condicionar el layout por `usePathname` — convierte el layout raíz en Client Component y mezcla responsabilidades.
2. **Landing como Server Component estático.** `(site)/page.js` y sus secciones (`Hero`, `About`, `Products`) no necesitan estado: se prerenderizan. Solo las páginas con formulario (`login`, `registro`) son Client Components. El menú no usa JavaScript: es una lista de enlaces que se reacomoda con CSS (flex-wrap) por debajo de 640 px, por lo que no hay hamburguesa que gestionar y funciona con teclado.
3. **Contenido en un único archivo.** `app/content/bank.js` exporta `bank` (nombre, eslogan, misión, valores, razón social, NIT ficticio, dirección, teléfono, email, horario), `products` (los tres productos con sus condiciones) y `socialLinks` (Facebook, Instagram, X, LinkedIn con URL a la página raíz de cada red). Los productos reutilizan las cifras de las reglas vigentes (1,5 % al retirar, 20 % de sobregiro, cupo 2.000.000 y 2 % mensual) como texto; un test comprueba que el texto menciona esas cifras para detectar divergencias futuras. Datos corporativos y enlaces son ficticios y se documentan como tales en el README.
4. **Identidad visual con CSS propio.** Variables CSS en `globals.css` (verde profundo `#0b6e4f` ya usado, verde oscuro para encabezados/footer, dorado de acento para llamadas a la acción, grises neutros) con contraste mínimo 4.5:1 en texto normal (se verifica con un cálculo en el recorrido de pruebas para los pares principales). Tipografía de sistema. Logotipo como componente SVG inline (`Logo.js`, con `role="img"` y título), y hero con fondo en gradiente CSS y formas SVG decorativas con `aria-hidden`. Secciones con `max-width` de 1120 px, rejilla `auto-fit` para tarjetas y `:focus-visible` con anillo visible. Los estilos del sitio van en `app/site.css` importado desde el layout `(site)`, y los de los paneles siguen en `globals.css`.
5. **Accesibilidad.** Enlace "Saltar al contenido" como primer elemento focalizable (visible al recibir foco), landmarks `header > nav`, `main`, `footer`, un único `<h1>` por página, `aria-label` en el `<nav>` y en los enlaces de redes (`aria-label="Mi Plata en Facebook"`), `target="_blank"` con `rel="noopener noreferrer"`. `lang="es"` ya existe.
6. **Solicitudes: entidad y puerto propios.** Nuevo agregado `registration` en dominio: `RegistrationRequest` (nombre, contraseña, tipo, saldo inicial, fecha; campos `#`, `toSnapshot()/restore()`), validada con las mismas reglas que `RegisterUserDTO` (nombre y contraseña no vacíos, tipo válido, saldo > 0 salvo tarjeta). Puerto `RegistrationRequestRepository` (`save`, `findByName`, `findAll`, `delete`) con `InMemory*` y `LocalStorage*` (clave `mi-plata:v1:registration-requests`, snapshots; ignora JSON inválido como los demás repos).
   *Alternativa descartada*: guardar solicitudes como `User` con rol/estado "pendiente" — contaminaría login, listados y reglas de unicidad de usuarios.
7. **Casos de uso (síncronos, como los existentes).** `SubmitRegistrationRequestUseCase` valida con `RegisterUserDTO`, lanza `UserAlreadyExistsError` si el nombre es un usuario y `RegistrationRequestAlreadyExistsError` si ya hay una solicitud, y guarda. `ListRegistrationRequestsUseCase` devuelve vistas sin contraseña, de la más antigua a la más reciente. `ApproveRegistrationRequestUseCase` busca la solicitud (`RegistrationRequestNotFoundError`), invoca `RegisterUserUseCase` (que ya rechaza nombres tomados y crea usuario y producto) y solo si tiene éxito borra la solicitud; así un fallo la deja pendiente. `RejectRegistrationRequestUseCase` borra la solicitud o lanza `RegistrationRequestNotFoundError`. La autorización por rol la hace la UI con `AuthGuard` (igual que el resto de la administración); la vista del gerente es el único consumidor de listar/aprobar/rechazar.
8. **Errores nuevos** (`DomainError` con `errorCode()`): `RegistrationRequestAlreadyExistsError`, `RegistrationRequestNotFoundError`; `errorMessages.js` los traduce al español.
9. **Navegación y sesión.** `AuthGuard` redirige a `/login` sin sesión o rol incorrecto y el cierre de sesión navega a `/`. Tras un envío exitoso en `/registro` se muestra confirmación en la misma página con enlace a "Iniciar sesión"; el formulario se limpia. `/login` conserva su lógica y redirige por rol.
10. **Vista del gerente.** `app/(panel)/gerente/page.js` añade `RequestsSection` encima de "Clientes": tabla (nombre, producto, saldo inicial, fecha) con "Aprobar" y "Rechazar". Aprobar y rechazar refrescan la sección y la lista de clientes mediante el mismo `refreshKey` que ya conecta registro y lista.

## Risks / Trade-offs

- [Mover páginas rompe imports relativos (`../components/...`) y los scripts Playwright que usan `/`] → los imports usan rutas desde `app/` verificadas con `next build`, y los scripts se actualizan a `/login` en la tarea de verificación.
- [Datos corporativos y redes ficticios pueden confundirse con reales] → se marcan como ficticios en el README y viven en `app/content/bank.js`.
- [Texto de productos puede divergir de las reglas] → test que fija las cifras visibles.
- [Contraseña de la solicitud en texto plano en `localStorage`] → igual que los usuarios; no se lista en la UI del gerente; limitación documentada.
- [Solicitudes huérfanas si el solicitante nunca vuelve] → no hay caducidad; el gerente puede rechazarlas.
- [Sin notificación al solicitante] → el login responde "No tiene una cuenta abierta" hasta que se apruebe; la confirmación del registro lo anticipa.
- [Verificación visual subjetiva] → se complementa con comprobaciones objetivas (landmarks, sin scroll horizontal a 360 px, enlaces, contraste de pares clave) y capturas revisadas a 360/768/1280 px.

## Migration Plan

1. Dominio, puerto, repos y casos de uso con tests. 2. Reorganización de rutas (grupos) con login en `/login`. 3. Landing y estilos. 4. Registro y sección del gerente. 5. Docs y recorrido completo en dev y producción. Rollback: revertir el commit; los datos existentes no cambian (solo se añade una clave nueva en `localStorage`).
