# Tasks

## 1. Dominio de solicitudes de registro

- [x] 1.1 Crear `RegistrationRequest` (campos `#`, validación con las reglas de `RegisterUserDTO`, `toSnapshot()/restore()`) y los errores `RegistrationRequestAlreadyExistsError` y `RegistrationRequestNotFoundError`; verificar con tests de la entidad (válida por tipo, nombre/contraseña vacíos, tipo desconocido, saldo no positivo, ida y vuelta de snapshot) y de los errores (código, nombre, mensaje personalizado)

## 2. Puerto y repositorios

- [x] 2.1 Crear el puerto `RegistrationRequestRepository` y sus implementaciones `InMemory` y `LocalStorage` (clave `mi-plata:v1:registration-requests`, tolerante a JSON inválido); verificar con tests (guardar, buscar, listar ordenado por fecha, borrar, persistencia tras reabrir el storage y contenido corrupto ignorado)

## 3. Casos de uso

- [x] 3.1 Crear `SubmitRegistrationRequestUseCase` (valida, rechaza nombre de usuario existente y solicitud pendiente, no crea usuario ni producto); verificar con tests de los escenarios del spec (válida, tarjeta sin saldo, datos inválidos sin guardar, nombre `gerente`, solicitud duplicada)
- [x] 3.2 Crear `ListRegistrationRequestsUseCase` (sin contraseña, de la más antigua a la más reciente); verificar con tests (orden, sin contraseña, lista vacía)
- [x] 3.3 Crear `ApproveRegistrationRequestUseCase` (usa `RegisterUserUseCase`, borra la solicitud solo si tuvo éxito) y `RejectRegistrationRequestUseCase`; verificar con tests (aprobar ahorros y tarjeta, login con la contraseña pedida, nombre tomado entre tanto deja la solicitud pendiente y el usuario intacto, rechazar libera el nombre, solicitud inexistente)

## 4. Estructura de rutas y sesión

- [x] 4.1 Reorganizar `app/` con grupos `(site)` y `(panel)` (`git mv` de `cliente/` y `gerente/`, login a `(site)/login`), dejar `app/layout.js` mínimo y apuntar `AuthGuard` a `/login` con cierre de sesión hacia `/`; verificar con `npm run build` y `npm run dev` que `/login`, `/cliente` y `/gerente` cargan y que sin sesión redirigen a `/login`
- [x] 4.2 Exponer los casos de uso de solicitudes en `src/infraestructure/web/container.js` y traducir los errores nuevos en `errorMessages.js`; verificar con `errorMessages.test.js` (un caso por error nuevo)

## 5. Landing page

- [x] 5.1 Crear `app/content/bank.js` (datos corporativos ficticios, productos con las cifras vigentes, redes sociales) y un test que verifique cifras 1,5 %, 20 %, 2.000.000 y 2 % y las cuatro redes con URL `https`; verificar con `npm test`
- [x] 5.2 Crear `(site)/layout.js`, `SiteHeader` (logo SVG, "Iniciar sesión", "Registrarse", enlace "Saltar al contenido"), `SiteFooter` (datos corporativos, redes con `rel="noopener noreferrer"` y `aria-label`, año actual) y `app/site.css` con paleta, tipografía, foco visible y responsivo; verificar en el navegador que el menú y el footer aparecen en `/`, `/login` y `/registro`
- [x] 5.3 Crear la landing `(site)/page.js` con secciones Hero (llamadas a la acción), Quiénes somos (misión y valores) y Productos (tres tarjetas); verificar con capturas a 360, 768 y 1280 px (sin scroll horizontal, secciones sin solaparse) y revisándolas visualmente

## 6. Registro y revisión de solicitudes

- [x] 6.1 Crear `(site)/registro/page.js` (nombre, contraseña, producto, saldo condicional, confirmación y errores en español, formulario limpio tras enviar, sin sesión ni usuario) y ajustar `(site)/login/page.js` al nuevo cascarón; verificar en el navegador el envío válido, la tarjeta sin saldo, nombre existente y solicitud duplicada
- [x] 6.2 Añadir la sección "Solicitudes de registro" a `(panel)/gerente/page.js` (tabla, aprobar, rechazar, refresco de solicitudes y clientes, mensajes de error); verificar en el navegador la aprobación (el cliente aparece y puede iniciar sesión), el rechazo, el nombre tomado entre tanto y la lista vacía

## 7. Documentación e integración final

- [x] 7.1 Documentar rutas, flujo de solicitud y aprobación, contenido ficticio y limitaciones en `README.md` y las carpetas nuevas en `ARCHITECTURE.md`; verificar que cada ruta y comando documentado funciona tal como está escrito
- [x] 7.2 Migrar los scripts Playwright existentes de `/` a `/login`, ampliarlos con navegación del menú, landmarks y un solo `h1`, enlace de saltar al contenido, enlaces sociales, ausencia de recursos externos, solicitud y aprobación/rechazo, y ejecutarlos en `npm run dev` y en un build de producción sin errores de hidratación
- [x] 7.3 Pasada final: `npm test` en verde, `openspec validate landing-and-registration-requests` y comprobar que `src/domain` y `src/application` no importan `node:*`
