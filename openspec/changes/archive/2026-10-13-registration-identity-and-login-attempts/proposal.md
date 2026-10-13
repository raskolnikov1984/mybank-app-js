# Proposal

## Why

El enunciado pide que el formulario de registro capture número de identificación (cédula o pasaporte), nombre completo, número de celular, nombre de usuario único y contraseña con confirmación, y que el inicio de sesión muestre el contador de intentos durante todo el proceso. Hoy el registro solo pide usuario, contraseña, producto y saldo, y el login informa "Intento N de 3" únicamente después de fallar; el bloqueo al tercer intento y su mensaje ya existen.

## What Changes

- **Datos de identidad del cliente:** tipo de identificación (Cédula o Pasaporte) y número (cédula: 6 a 10 dígitos; pasaporte: 6 a 12 letras y números, se guarda en mayúsculas), nombre completo (obligatorio) y celular colombiano (10 dígitos que empiezan por 3; se aceptan espacios y se normalizan). El número de identificación es único entre clientes y solicitudes pendientes.
- **Confirmación de contraseña:** en todos los registros la contraseña debe coincidir con su confirmación; la confirmación no se guarda.
- **Dónde aplica:** formulario público `/registro` (solicitud), registro directo del gerente en `/gerente` y registro de la consola. Al aprobar una solicitud, los datos pasan al cliente.
- **Listas del gerente:** solicitudes y clientes muestran nombre completo, identificación y celular (nunca la contraseña).
- **Contador de intentos visible:** el formulario de login muestra siempre "Intentos restantes: N de 3", se actualiza al escribir un usuario existente y tras cada fallo, y al tercer fallo muestra el bloqueo; para usuarios inexistentes no se revela contador. La consola muestra el mismo contador antes de pedir la contraseña y tras cada fallo.
- **Compatibilidad:** el gerente por defecto y los clientes guardados antes de este cambio, sin datos de identidad, siguen cargando y funcionando. Las solicitudes pendientes guardadas antes de este cambio no tienen esos datos y se ignoran al cargar (el solicitante puede volver a enviarla).
- **BREAKING:** registrar un cliente (directo o por solicitud) ahora exige los datos de identidad y la confirmación de contraseña.

## Capabilities

### New Capabilities
- `client-identity`: datos de identidad del cliente (identificación, nombre completo, celular), su validación, la confirmación de contraseña y la unicidad de la identificación.
- `login-attempts`: consulta del estado de intentos de inicio de sesión (restantes, máximo, bloqueo) y su visualización durante el proceso.

### Modified Capabilities
- `account-types`: el registro de un cliente exige los datos de identidad y la confirmación de contraseña.
- `registration-requests`: enviar, listar y aprobar solicitudes incluyen los datos de identidad.
- `user-management`: la lista de clientes muestra nombre completo, identificación y celular.
- `web-client`: login con contador visible; formularios de registro (público y del gerente) con los campos nuevos; listas y consola actualizadas.

## Impact

- Código: nuevos objetos de valor (`Identification`, `MobilePhone`, `FullName`, `ClientProfile`) y errores; `User`, `RegistrationRequest` y sus snapshots; `RegisterUserDTO`, `RegisterUserUseCase`, `SubmitRegistrationRequestUseCase`, `ApproveRegistrationRequestUseCase`, `ListUsersUseCase`, `ListRegistrationRequestsUseCase`, `LoginUseCase`; nuevo `GetLoginStatusUseCase`; puertos y repos (búsqueda por identificación); `container.js`, `errorMessages.js`; `app/(site)/registro`, `app/(site)/login`, `app/(panel)/gerente`; `src/main.js`.
- Tests: objetos de valor, entidades, repos, casos de uso (los tests que registran clientes se actualizan con los datos nuevos) y recorrido de navegador del registro, la aprobación y el contador.
- Docs: README (datos del cliente, contador de intentos) y UML.
- Persistencia: sin cambio de claves; los snapshots de usuarios ganan un campo opcional `profile`.
- Supuestos: el nombre completo admite letras (con tildes), espacios, apóstrofo, guion y punto, de 3 a 80 caracteres; la identificación es única por tipo y número; el contador de un usuario con bloqueo vencido (24 h) se muestra como 3 de 3; el contador de intentos reutiliza el límite y la duración del bloqueo existentes; el gerente no tiene datos de identidad.
