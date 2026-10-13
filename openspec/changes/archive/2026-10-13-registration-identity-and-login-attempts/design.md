# Design

## Context

`User` guarda nombre de usuario, contraseña, cuenta, rol, intentos fallidos y bloqueo (límite de 3 intentos y bloqueo de 24 h como constantes privadas del archivo). `RegisterUserDTO` valida nombre, contraseña, tipo de producto y saldo; `RegisterUserUseCase` rechaza nombres existentes. `RegistrationRequest` repite esas validaciones y se guarda en snapshots `localStorage`; `SubmitRegistrationRequestUseCase` rechaza nombres de usuario y solicitudes duplicados; `ApproveRegistrationRequestUseCase` invoca a `RegisterUserUseCase`. `LoginUseCase` guarda al usuario tras cada intento y lanza `InvalidCredentialsError("... Intento N de 3")` o `AccountLockedError`. La web tiene tres formularios de registro (público, gerente) y el login; la consola tiene su propio flujo. Ver proposal.md para la motivación y los specs para los requisitos.

## Goals / Non-Goals

**Goals:**
- Validar los datos de identidad una sola vez (dominio) y reutilizarlos en registro directo, solicitudes y consola.
- Un contador de intentos coherente con el bloqueo real, visible desde el inicio del login y en la consola.
- Compatibilidad con usuarios guardados antes del cambio.

**Non-Goals:**
- Editar los datos de identidad de un cliente existente (solo contraseña y desbloqueo, como antes).
- Validar contra registradurías, verificar el celular por SMS o añadir captcha.
- Cambiar el límite de 3 intentos o la duración del bloqueo.

## Decisions

1. **Objetos de valor para los datos.** En `src/domain/aggregates/user/value-objects/`: `Identification` (tipo `IdentificationType.CEDULA | PASSPORT` y número; normaliza con `trim`, mayúsculas para pasaporte; `key()` = `TIPO:NUMERO`), `MobilePhone` (quita espacios, exige `^3\d{9}$`), `FullName` (colapsa espacios, 3 a 80 caracteres, regex Unicode `^[\p{L}][\p{L} '.-]*$`) y `ClientProfile` (agrupa los tres, con `toSnapshot()/restore()`). Cada uno lanza su error de dominio. Errores nuevos: `InvalidIdentificationError`, `FullNameInvalidError`, `InvalidPhoneError`, `PasswordMismatchError`, `IdentificationAlreadyRegisteredError`.
   *Alternativa descartada*: validar en el DTO de aplicación — la regla pertenece al dominio y la consume `RegistrationRequest` sin depender de la capa de aplicación.
2. **`User` con perfil opcional.** El constructor gana un quinto parámetro `profile = null`; los clientes nuevos siempre lo traen (lo garantiza el caso de uso), el gerente y los clientes antiguos no. `getProfile()` devuelve el `ClientProfile` o `null`. El snapshot añade `profile` (o `null`); `User.restore` tolera su ausencia, por lo que los datos antiguos siguen cargando.
3. **`RegistrationRequest` con perfil obligatorio.** Recibe `profile` (`ClientProfile`) además de nombre, contraseña, producto y saldo; su snapshot incluye `profile`. Una solicitud guardada sin `profile` falla al restaurarse y los repositorios ya ignoran snapshots inválidos, por lo que las solicitudes anteriores a este cambio se descartan al cargar (documentado como supuesto).
4. **Confirmación de contraseña en la frontera de aplicación.** `RegisterUserDTO` y `SubmitRegistrationRequestUseCase` reciben `confirmPassword` y lanzan `PasswordMismatchError` si falta o difiere; ninguno la guarda. La aprobación pasa la contraseña ya confirmada como su propia confirmación. La web valida además al instante para mostrar el mensaje sin enviar.
5. **Unicidad de la identificación.** `UserRepository.existsByIdentification(identification)` y `RegistrationRequestRepository.findByIdentification(identification)` (las implementaciones in-memory y LocalStorage recorren sus datos; el volumen es pequeño). `RegisterUserUseCase` comprueba nombre y luego identificación; `SubmitRegistrationRequestUseCase` comprueba nombre de usuario, nombre de solicitud, identificación de usuario e identificación de solicitud, y lanza `IdentificationAlreadyRegisteredError`. Como la identificación se compara por `key()`, la misma cifra con distinto tipo no choca. Borrar un cliente o rechazar una solicitud libera la identificación al desaparecer el dato.
6. **Estado de intentos en el dominio.** `User.getLoginStatus()` devuelve `{ maxAttempts, remainingAttempts, isLocked }` sin mutar: bloqueo activo (bloqueado y menos de 24 h) → 0 restantes y bloqueado; bloqueo vencido → 3 y no bloqueado; si no, `max − intentosFallidos`. Se exporta `MAX_LOGIN_ATTEMPTS` desde `User.js` y reemplaza la constante privada; `LoginUseCase` y la consola dejan de repetir el `3`.
7. **`GetLoginStatusUseCase`.** `execute({ name })` busca al usuario y devuelve `{ exists: false }` si no hay nombre o usuario, o `{ exists: true, ...status }`. No guarda nada. La web trata `exists: false` como 3 de 3 para no revelar nada más allá de lo que ya revelan los errores de login.
8. **Mensajes de login.** `LoginUseCase` lanza `InvalidCredentialsError("Credenciales inválidas. Intento N de 3. Intentos restantes: M")` y, al bloquear, `AccountLockedError` con el texto actual. Un usuario ya bloqueado que acierta la contraseña sigue recibiendo el bloqueo (comportamiento existente).
9. **Web.** `/login`: `<p role="status" aria-live="polite" data-attempts>` siempre visible con "Intentos restantes: N de 3", recalculado en cada cambio del nombre (síncrono sobre `GetLoginStatusUseCase`) y tras cada fallo; en bloqueo muestra "0 de 3" y un aviso destacado con el mensaje de 24 h. `/registro` y el formulario del gerente comparten un componente `ClientDataFields` (tipo de identificación, número, nombre completo, celular, usuario, contraseña, confirmación) para no duplicar validaciones de interfaz ni textos; ambos validan la coincidencia de contraseñas antes de enviar. Las tablas de solicitudes y clientes del gerente muestran nombre completo, identificación y celular (o "—").
   *Alternativa descartada*: mostrar el contador solo al fallar — el requisito pide visibilidad durante todo el proceso.
10. **Consola.** El flujo de registro del gerente pide, en este orden, tipo de identificación (1 Cédula, 2 Pasaporte), número, nombre completo, celular, usuario, contraseña, confirmación, producto y saldo. El login muestra `Intentos restantes: N de 3` tras escribir el nombre (si existe) y después de cada fallo, y deja de depender de su contador local.
11. **Vistas de listados.** `ListUsersUseCase` añade `fullName`, `identificationType`, `identification` y `phone` (`null` si no hay perfil); `ListRegistrationRequestsUseCase` añade los mismos campos; ninguno incluye contraseñas.
12. **Mensajes de error web.** `errorMessages.js` traduce los cinco errores nuevos; el de confirmación y los de formato se muestran bajo el formulario.

## Risks / Trade-offs

- [Registro más estricto rompe tests y scripts existentes que registran sin datos de identidad] → se actualizan los tests y el recorrido Playwright en las tareas de cada capa; un helper de pruebas aporta datos válidos únicos.
- [Reglas de nombre completo demasiado estrictas rechazan nombres legítimos] → la regex acepta letras Unicode, tildes, ñ, apóstrofo, guion y punto; queda registrada como supuesto y es fácil de ajustar en `FullName`.
- [Solicitudes pendientes antiguas desaparecen al cargar] → son datos de desarrollo de un cambio recién implementado; el solicitante puede reenviar. Se documenta.
- [El contador revela cuántos intentos fallidos tiene un usuario existente] → el login ya distingue usuarios inexistentes con su mensaje; el contador de un usuario inexistente es constante (3 de 3).
- [Unicidad por recorrido lineal] → volumen de un navegador; no hay índice.
- [Consola y web divergen en el formulario] → comparten las mismas reglas de dominio; solo cambia la interfaz.

## Migration Plan

1. Dominio (objetos de valor, errores, `User`, `RegistrationRequest`) con tests. 2. Puertos y repos. 3. Casos de uso y actualización de tests existentes. 4. Estado de intentos y mensajes de login. 5. Web. 6. Consola. 7. Docs y recorrido completo. Rollback: revertir el commit; los snapshots antiguos siguen siendo válidos y el campo `profile` es aditivo.
