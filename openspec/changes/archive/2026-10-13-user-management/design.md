# Design

## Context

Estado actual: `User` (nombre, contraseña, cuenta, rol, intentos fallidos, bloqueo) solo expone `authenticate`; la clave de usuario y el id de cuenta son el mismo nombre. `UserRepository` tiene `findByName/save/exists`; `AccountRepository` tiene `findById/save`. Las implementaciones in-memory (consola) y `LocalStorage*` (web, con caché de instancias y snapshots JSON) las implementan. `RegisterUserUseCase` hace `save` sin comprobar existencia, por lo que reemplaza a un usuario con el mismo nombre. La vista del gerente (`app/gerente/page.js`) y el menú de gestión de la consola solo registran clientes. Ver proposal.md para la motivación y los specs para los requisitos.

## Goals / Non-Goals

**Goals:**
- Listar, cambiar contraseña, desbloquear y eliminar clientes con reglas centralizadas en casos de uso y dominio, reutilizables por web y consola.
- Que el borrado sea seguro: confirmación obligatoria, producto en cero, gerente protegido.
- Que el alta no pueda pisar a un usuario existente.

**Non-Goals:**
- Renombrar usuarios o cambiar el tipo de producto (decisión del usuario: solo contraseña y desbloqueo).
- Administrar al gerente (no aparece en la lista; crear/eliminar gerentes queda fuera).
- Cifrar contraseñas, roles nuevos o auditoría de cambios.

## Decisions

1. **Reglas en dominio.** `User` gana `changePassword(newPassword)` (rechaza vacío con `UserPasswordRequiredError`, no toca nombre/cuenta/rol) y `unlock()` (limpia intentos, bloqueo y fecha). `Account` gana `hasOpenPosition()`: true si el saldo es > 0 o hay crédito en uso (`creditUsed` > 0); así cubre ahorros con saldo, corriente con sobregiro y tarjeta con deuda o con saldo a favor. Ambos métodos funcionan igual con usuarios restaurados desde snapshot.
2. **Ports ampliados.** `UserRepository.findAll()` y `delete(name)`; `AccountRepository.delete(id)`. Los repos in-memory eliminan de su `Map`; los `LocalStorage*` eliminan del caché y del objeto de snapshots y reescriben el JSON. `findAll()` del repo de usuarios restaura cada snapshot vía el mismo camino que `findByName`, ignorando los inválidos.
   *Alternativa descartada*: filtrar y borrar desde el caso de uso reescribiendo todo — filtraría detalles de almacenamiento a la capa de aplicación.
3. **Casos de uso nuevos (sincrónicos, como los actuales):** `ListUsersUseCase` (devuelve vistas planas `{ name, type, typeName, isLocked, summary }` solo de rol `CLIENTE`, ordenadas por nombre), `ChangeUserPasswordUseCase`, `UnlockUserUseCase`, `DeleteUserUseCase`. Todos guardan tras mutar y fallan con `UserNotFoundError` si el nombre no existe. Si el usuario existe pero no es `CLIENTE`, lanzan `ManagerProtectedError` (cubre "el gerente no se puede eliminar" y evita cambiar su contraseña por esta vía).
4. **Confirmación en la frontera de aplicación.** `DeleteUserUseCase.execute({ name, confirmed })` exige `confirmed === true`; si no, lanza `DeletionNotConfirmedError` sin tocar nada. La UI es responsable de pedir la confirmación, pero la regla no depende de ella. Orden de validaciones: confirmación → existe → es cliente → producto en cero (`UserHasOpenBalanceError`) → borrar cuenta y usuario.
   *Alternativa descartada*: `window.confirm` en la web — no es testeable con el flujo actual y la consola no lo tiene; se usa un paso de confirmación en la propia página.
5. **Alta única.** `RegisterUserUseCase` consulta `userRepository.exists(name)` antes de crear y lanza `UserAlreadyExistsError`; el nombre reutilizado tras un borrado funciona porque `delete` quita usuario y cuenta. Al estar la comprobación en el caso de uso, aplica a web y consola.
6. **Errores nuevos** (extienden `DomainError`, con `errorCode()`): `UserAlreadyExistsError`, `UserHasOpenBalanceError`, `DeletionNotConfirmedError`, `ManagerProtectedError`. `errorMessages.js` los traduce al español en la web; la consola usa `error.message` con textos en español pasados al constructor, como `LoginUseCase`.
7. **Web.** `app/gerente/page.js` conserva "Registrar cliente" y añade la sección "Clientes": tabla (nombre, producto, estado, posición) con acciones por fila. Cambiar contraseña abre un campo inline; eliminar muestra un paso de confirmación inline que nombra al cliente con botones "Confirmar eliminación" y "Cancelar". La lista se vuelve a leer del container tras cada operación, incluido el registro. El container expone los nuevos casos de uso. Una sesión de cliente ya eliminado falla al operar con "No se encontró la cuenta." (comportamiento existente), sin lógica adicional.
8. **Consola.** El menú de gestión pasa a: 1 Registrar, 2 Listar, 3 Cambiar contraseña, 4 Desbloquear, 5 Eliminar, 6 Cerrar sesión. Eliminar muestra el nombre y pide escribir `SI` (cualquier otra respuesta cancela).

## Risks / Trade-offs

- [Borrado real, sin papelera] → solo con producto en cero y confirmación explícita; el spec lo cubre con escenarios de cancelación y rechazo.
- [Cliente con sesión abierta y eliminado] → sus operaciones fallan con "No se encontró la cuenta."; aceptable en proyecto académico, sin invalidación activa de sesiones.
- [Eliminar un ahorro nunca vuelve a 0 de forma natural porque retirar acredita interés] → un retiro total de ahorros deja 0 en el saldo solo si el monto retirado es saldo + interés; el gerente puede indicarlo al cliente. Se documenta, no se cambia la regla de ahorros.
- [Nombre reutilizado tras borrar puede confundir historiales] → los movimientos se borran con la cuenta, así que no hay mezcla.
- [Cobertura de `main.js` es 0 %] → la consola se verifica con entrada simulada, como en los changes anteriores.

## Migration Plan

1. Dominio y errores con tests. 2. Puertos y repos. 3. Casos de uso. 4. Web. 5. Consola. 6. Docs y recorrido final. Rollback: revertir el commit; no hay migración de datos y los snapshots existentes siguen siendo válidos.
