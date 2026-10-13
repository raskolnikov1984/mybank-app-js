# Proposal

## Why

El enunciado (pág. 5) pide una interfaz para administrar los usuarios del sistema: agregar, editar y eliminar (con confirmación). Hoy el gerente solo puede registrar clientes; no puede ver la lista, corregir una contraseña, desbloquear a un cliente ni eliminarlo. Además, registrar un nombre que ya existe reemplaza silenciosamente al usuario y su cuenta, lo que hace inseguro el alta dentro de un CRUD.

## What Changes

- **Listar:** el gerente ve la lista de clientes con nombre, tipo de producto, estado (activo/bloqueado) y su posición (saldo, deuda o sobregiro).
- **Agregar:** se mantiene el registro actual, pero registrar un nombre ya existente se rechaza con un nuevo error `UserAlreadyExistsError` (hoy lo reemplaza). Esto aplica a web y consola.
- **Editar:** el gerente puede cambiar la contraseña de un cliente y desbloquearlo (reinicia intentos fallidos y bloqueo). El nombre de usuario, el tipo de producto y el saldo no se editan.
- **Eliminar:** con confirmación explícita, solo si el producto está en cero (saldo 0, sin deuda ni sobregiro); si no, se rechaza con `UserHasOpenBalanceError`. Elimina usuario, cuenta y movimientos. No se puede eliminar al gerente ni a uno mismo.
- **Interfaz:** nueva página de administración en la web (solo gerente) y las mismas operaciones en el menú de gestión de la consola.
- Nuevos métodos en los puertos: listar y eliminar (usuarios y cuentas); los repositorios in-memory y LocalStorage los implementan.
- **BREAKING:** registrar un nombre existente deja de reemplazar y pasa a fallar.

## Capabilities

### New Capabilities
- `user-management`: listado, edición (contraseña y desbloqueo) y eliminación confirmada de clientes por el gerente.

### Modified Capabilities
- `account-types`: el registro de un cliente rechaza nombres ya existentes.
- `web-client`: la vista del gerente incluye la administración de usuarios; la consola ofrece las mismas operaciones.

## Impact

- Código: nuevos casos de uso `ListUsersUseCase`, `UpdateUserUseCase`, `UnlockUserUseCase`, `DeleteUserUseCase`; `RegisterUserUseCase`; errores nuevos; `UserRepository`/`AccountRepository` (listar, eliminar); repos `InMemory*` y `LocalStorage*`; `User` (cambio de contraseña y desbloqueo); `app/gerente/page.js`, `src/infraestructure/web/{container,errorMessages}.js`, `src/main.js`.
- Tests: unitarios de casos de uso, entidad `User`, repos y mensajes de error; recorrido en navegador.
- Docs: README (administración de usuarios) y UML.
- Persistencia: sin cambio de esquema; borrar quita las claves del usuario y la cuenta en `localStorage`.
- Supuestos: la administración cubre solo usuarios con rol `CLIENTE` (el gerente no aparece en la lista); la contraseña nueva es obligatoria al editar; la sesión de un cliente eliminado deja de ser válida al intentar operar (cuenta no encontrada).
