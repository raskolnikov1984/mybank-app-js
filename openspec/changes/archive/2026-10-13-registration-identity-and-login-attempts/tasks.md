# Tasks

## 1. Dominio: datos de identidad

- [x] 1.1 Crear `IdentificationType`, `Identification`, `MobilePhone`, `FullName` y `ClientProfile` (normalización, `key()`, snapshots) y los errores `InvalidIdentificationError`, `FullNameInvalidError`, `InvalidPhoneError`, `PasswordMismatchError`, `IdentificationAlreadyRegisteredError`; verificar con tests de cada objeto y error (cédula 6 a 10 dígitos y con letras, pasaporte en mayúsculas y con símbolos, tipo desconocido, celular con espacios y que no empieza por 3, nombre con tildes y espacios repetidos, vacío y con dígitos, `key()` distinta por tipo, ida y vuelta de snapshot)
- [x] 1.2 Añadir `profile` opcional a `User` (getter y snapshot, `restore` tolera su ausencia) y `profile` obligatorio a `RegistrationRequest` (snapshot; una solicitud sin perfil falla al restaurar); verificar con tests (usuario con y sin perfil, snapshot antiguo sin `profile` sigue cargando, solicitud sin perfil rechazada)

## 2. Puertos y repositorios

- [x] 2.1 Añadir `existsByIdentification` a `UserRepository` y `findByIdentification` a `RegistrationRequestRepository` e implementarlos en los repos in-memory y LocalStorage; verificar con tests (identificación existente e inexistente, mismo número con distinto tipo, usuarios sin perfil no coinciden, dato liberado tras borrar el usuario o rechazar la solicitud)

## 3. Casos de uso de registro

- [x] 3.1 Actualizar `RegisterUserDTO` y `RegisterUserUseCase` con perfil, confirmación de contraseña y unicidad de identificación; verificar con `RegisterUserUseCase.test.js` (datos válidos guardados en el cliente, cada validación rechaza sin guardar, confirmación distinta o ausente, identificación repetida, el nombre repetido sigue rechazándose) y actualizar los tests existentes que registran clientes con un helper de datos válidos
- [x] 3.2 Actualizar `SubmitRegistrationRequestUseCase` (perfil, confirmación, identificación única frente a usuarios y solicitudes) y `ApproveRegistrationRequestUseCase` (pasa los datos al cliente y falla dejando pendiente si el nombre o la identificación se ocuparon); verificar con `RegistrationRequestUseCases.test.js` (cada escenario del spec, el cliente aprobado conserva sus datos, aprobación fallida deja la solicitud intacta)
- [x] 3.3 Añadir identidad a las vistas de `ListUsersUseCase` y `ListRegistrationRequestsUseCase` (sin contraseña, `null` para clientes antiguos); verificar con tests (campos presentes, cliente sin perfil con campos no disponibles, ninguna contraseña en la salida)

## 4. Intentos de inicio de sesión

- [x] 4.1 Añadir `User.getLoginStatus()` y exportar `MAX_LOGIN_ATTEMPTS`; verificar con tests en `user.test.js` (3 de 3 inicial, baja por fallo, 0 al bloquear, éxito restaura, bloqueo vencido a las 24 h muestra 3 sin mutar al usuario)
- [x] 4.2 Crear `GetLoginStatusUseCase` y actualizar los mensajes de `LoginUseCase` ("Intento N de 3. Intentos restantes: M" y bloqueo en el tercero); verificar con tests (usuario inexistente o nombre vacío, estado tras cada fallo y tras bloqueo, mensajes de cada fallo, contraseña correcta con cuenta bloqueada sigue rechazada, el estado no guarda ni cambia nada)

## 5. Web

- [x] 5.1 Traducir los errores nuevos en `errorMessages.js`, exponer `getLoginStatus` en `container.js` y crear el componente `ClientDataFields`; verificar con `errorMessages.test.js` (un caso por error nuevo) y compilando con `npm run dev`
- [x] 5.2 Actualizar `/registro` y el formulario de registro del gerente con los campos nuevos, la confirmación (coincidencia validada antes de enviar) y los mensajes de error; actualizar las tablas de solicitudes y de clientes con nombre completo, identificación y celular; verificar en el navegador cada escenario del spec (envío válido, cada validación, confirmación distinta, identificación repetida, aprobación con datos visibles, cliente antiguo sin datos)
- [x] 5.3 Añadir el contador de intentos visible a `/login` (siempre presente, actualizado al escribir el usuario y tras cada fallo, bloqueo con mensaje informativo, anunciado con `aria-live`); verificar en el navegador los escenarios de contador (3 de 3 inicial, usuario con fallos previos, 2-1-0 tras fallar, usuario inexistente sin cambios, persistencia tras recargar)

## 6. Consola

- [x] 6.1 Actualizar el registro del gerente en `src/main.js` (identificación, nombre completo, celular, confirmación) y el login con el contador `Intentos restantes: N de 3`; verificar con `npm start` y entrada simulada (registro válido, cada validación, confirmación distinta, contador antes de la contraseña y tras cada fallo, bloqueo al tercero)

## 7. Documentación e integración final

- [x] 7.1 Documentar los datos del cliente, sus reglas de validación, el contador de intentos y la compatibilidad con datos antiguos en `README.md`, y actualizar `docs/UML-Diagram.mmd`; verificar que el diagrama Mermaid renderiza y que el README coincide con los specs
- [x] 7.2 Actualizar y ampliar los recorridos Playwright (registro con los datos nuevos en `/registro` y en `/gerente`, aprobación, contador de intentos) y ejecutarlos en `npm run dev` y en un build de producción sin errores de hidratación
- [x] 7.3 Pasada final: `npm test` en verde, `openspec validate registration-identity-and-login-attempts` y comprobar que `src/domain` y `src/application` no importan `node:*`
