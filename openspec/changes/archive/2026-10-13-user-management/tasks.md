# Tasks

## 1. Dominio: contraseña, desbloqueo, posición abierta y errores

- [x] 1.1 Añadir `changePassword` y `unlock` a `User` y `hasOpenPosition()` a `Account`; verificar con `tests/unit/user.test.js` y `account.test.js` (contraseña vacía rechazada, nombre/cuenta/rol intactos, desbloqueo limpia intentos y bloqueo, `hasOpenPosition` true con saldo, sobregiro o deuda y false en cero)
- [x] 1.2 Crear `UserAlreadyExistsError`, `UserHasOpenBalanceError`, `DeletionNotConfirmedError` y `ManagerProtectedError` (extienden `DomainError`, con `errorCode()`); verificar con un test de errores en el estilo de `CreditLimitExceededError.test.js` (código, nombre y mensaje personalizado)

## 2. Puertos y repositorios

- [x] 2.1 Añadir `findAll`/`delete` a `UserRepository` y `delete` a `AccountRepository` e implementarlos en `InMemoryUserRepository` y `InMemoryAccountRepository`; verificar con tests de los repos in-memory (borrar quita el elemento, borrar inexistente no falla, `findAll` devuelve todos)
- [x] 2.2 Implementar `findAll`/`delete` en `LocalStorageUserRepository` y `LocalStorageAccountRepository` (caché + snapshots + reescritura del JSON); verificar en `tests/unit/infraestructure/LocalStorageRepositories.test.js` que lo borrado no reaparece tras reabrir el storage, que `findAll` ignora snapshots inválidos y que un nombre se puede reutilizar

## 3. Casos de uso

- [x] 3.1 Hacer que `RegisterUserUseCase` rechace nombres existentes con `UserAlreadyExistsError`; verificar con `tests/unit/application/RegisterUserUseCase.test.js` (duplicado rechazado sin alterar contraseña, producto ni saldo del existente; nombre reutilizable tras borrar)
- [x] 3.2 Crear `ListUsersUseCase` (solo clientes, ordenados, sin el gerente); verificar con tests (tres productos con tipo y posición, lista vacía, cliente bloqueado marcado)
- [x] 3.3 Crear `ChangeUserPasswordUseCase` y `UnlockUserUseCase` (guardan tras mutar; `UserNotFoundError` y `ManagerProtectedError`); verificar con tests (login con la nueva contraseña y no con la vieja, contraseña vacía rechazada, desbloqueo tras 3 intentos fallidos)
- [x] 3.4 Crear `DeleteUserUseCase` con el orden confirmación → existe → es cliente → producto en cero; verificar con tests (borrado con producto en cero, sin confirmar no borra, rechazo con saldo, deuda y sobregiro, gerente protegido, usuario inexistente)

## 4. Web

- [x] 4.1 Exponer los casos de uso en `src/infraestructure/web/container.js` y traducir los errores nuevos en `errorMessages.js`; verificar con `errorMessages.test.js` (un caso por error nuevo)
- [x] 4.2 Añadir la sección "Clientes" a `app/gerente/page.js` (tabla, cambiar contraseña inline, desbloquear, eliminar con paso de confirmación, refresco tras cada operación y tras registrar); verificar en el navegador con `npm run dev`
- [x] 4.3 Ampliar el recorrido de navegador (Playwright) con: duplicado rechazado, lista con tres productos, cambio de contraseña y login, bloqueo y desbloqueo, cancelar eliminación, eliminar con saldo rechazado, eliminar en cero y cliente que desaparece; ejecutarlo en `npm run dev` y en un build de producción sin errores de hidratación

## 5. Consola

- [x] 5.1 Ampliar el menú de gestión de `src/main.js` (listar, cambiar contraseña, desbloquear, eliminar con confirmación `SI`) y los textos de los errores nuevos; verificar ejecutando `npm start` con entrada simulada que cubra cada opción, la cancelación y el rechazo por saldo

## 6. Documentación e integración final

- [x] 6.1 Documentar la administración de usuarios (reglas de edición y borrado, limitaciones) en `README.md` y actualizar `docs/UML-Diagram.mmd` y `ARCHITECTURE.md` si cambian; verificar que el diagrama renderiza y que el README coincide con los specs
- [x] 6.2 Pasada final: `npm test` en verde, `openspec validate user-management` y recorrido manual completo (consola y web) de alta, edición y baja
