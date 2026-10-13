# Tasks

## 1. Account base abstracta y errores

- [x] 1.1 Refactorizar `Account` a clase abstracta con `#balance`, `#creditUsed`, template method `withdrawFunds`/`depositFunds`, hooks `creditLimit()`, `accountType()`, `monthlyStatement()`, `insufficientFundsError()`, opción `allowZeroInitialBalance`, `getMovements()` devolviendo copia; verificar con `tests/unit/account.test.js` migrado (ver 2.4) y un test de que `new Account(...)` lanza error
- [x] 1.2 Crear `CreditLimitExceededError` (extiende `DomainError`, con `errorCode()`) y `InvalidAccountTypeError`, y ampliar `MovementType` con `INTEREST` y `FEE`; verificar con tests unitarios de cada error en el estilo de `AmountInvalidError.test.js`

## 2. Subclases (herencia y polimorfismo)

- [x] 2.1 Implementar `SavingsAccount` (sin crédito, interés 1 %) y verificar con `tests/unit/SavingsAccount.test.js` cubriendo los escenarios del spec `account-types` y `monthly-statement`
- [x] 2.2 Implementar `CheckingAccount` (sobregiro 500 000, comisión 10 000, interés 3 % sobre sobregiro) y verificar con `tests/unit/CheckingAccount.test.js` (usar sobregiro, exceder límite, depósito que repaga primero, estado mensual)
- [x] 2.3 Implementar `CreditCard` (saldo inicial 0, cupo 2 000 000, interés 2 %, `getDebt`/`getAvailableCredit`) y verificar con `tests/unit/CreditCard.test.js`
- [x] 2.4 Migrar `tests/unit/account.test.js`, `user.test.js` y los tests de `application/` de `new Account` a `SavingsAccount`; verificar con `npm test` en verde
- [x] 2.5 Añadir `describe()` polimórfico y un test `tests/unit/AccountPolymorphism.test.js` que recorre un arreglo de las tres subclases con las mismas llamadas y comprueba resultados distintos; verificar que el test pasa

## 3. Fábrica, registro y casos de uso

- [x] 3.1 Crear `AccountType` y `AccountFactory.create(type, initialBalance)` (error `InvalidAccountTypeError` para tipos desconocidos); verificar con `tests/unit/AccountFactory.test.js`
- [x] 3.2 Extender `RegisterUserDTO` con `accountType` (por defecto `SAVINGS`, saldo no requerido para tarjeta) y actualizar `RegisterUserUseCase` y `CreateManagerUseCase` para usar la fábrica/`SavingsAccount`; verificar con `tests/unit/application/RegisterUserUseCase.test.js` (nuevo) y `CreateManagerUseCase.test.js`
- [x] 3.3 Crear `ApplyMonthlyStatementUseCase` (busca por id, error "Account not found", delega `monthlyStatement()`); verificar con `tests/unit/application/ApplyMonthlyStatementUseCase.test.js` incluyendo el escenario "same call, different outcome"
- [x] 3.4 Actualizar `src/main.js`: elegir tipo de cuenta al registrar, mostrar `describe()` en saldo y añadir la opción "Estado mensual" al menú del cliente; verificar ejecutando `npm start` y recorriendo registro de los tres tipos, retiro y estado mensual
- [x] 3.5 Actualizar la sección de dominio de `README.md` y `docs/UML-Diagram.mmd` con la jerarquía y la tabla de equivalencias de nombres; verificar que el diagrama Mermaid renderiza (p. ej. con `npx @mermaid-js/mermaid-cli` o vista previa)

## 4. Persistencia (snapshots y repositorios LocalStorage)

- [x] 4.1 Añadir `toSnapshot()` a las cuentas y `AccountFactory.restore(snapshot)` (con movimientos), y `User.toSnapshot()`/`User.restore()` incluyendo intentos fallidos y bloqueo; verificar con tests de ida y vuelta por cada tipo y de usuario bloqueado
- [x] 4.2 Implementar `LocalStorageUserRepository` y `LocalStorageAccountRepository` (claves `mi-plata:v1:*`, tolerantes a JSON inválido) respetando los puertos; verificar con tests usando un `localStorage` simulado en `tests/unit/infraestructure/`
- [x] 4.3 Verificar que `src/domain` y `src/application` no importan `node:*` (`grep -rn "node:" src/domain src/application` sin resultados)

## 5. Aplicación Next.js

- [x] 5.1 Instalar `next`, `react`, `react-dom`; crear `jsconfig.json` (`@/*` → `src/*`), `next.config.mjs`, scripts `dev`/`build`/`start:web`, excluir `.next/` en vitest y `.gitignore`; verificar con `npm run dev` sirviendo una página mínima y `npm test` sin recoger archivos de Next
- [x] 5.2 Crear `src/infraestructure/web/container.js` (singleton perezoso con repos LocalStorage, use cases, siembra de gerente, sesión en `sessionStorage`) y `errorMessages.js`; verificar con test unitario del mapeo de errores y comprobando en el navegador que `gerente/admin` existe en la primera carga
- [x] 5.3 Implementar `app/layout.js`, `app/globals.css`, `AuthGuard` y la página de login `app/page.js` con mensajes de error, bloqueo y redirección por rol; verificar manualmente los escenarios de login, usuario inexistente, 3 intentos fallidos y acceso directo sin sesión
- [x] 5.4 Implementar `app/gerente/page.js` con formulario de registro (nombre, contraseña, tipo, saldo inicial condicional) y validaciones; verificar registrando un cliente de cada tipo y entrando después con él
- [x] 5.5 Implementar `app/cliente/page.js`: resumen específico por tipo, depositar, retirar, movimientos y estado mensual; verificar los escenarios de depósito, retiro rechazado, resumen de tarjeta y que los datos persisten tras recargar
- [x] 5.6 Ejecutar `npm run build` y revisar la consola del navegador en `npm run dev` y `npm run start:web` sin errores de hidratación ni de `window`/`localStorage`

## 6. Documentación e integración final

- [x] 6.1 Añadir a `README.md` y `ARCHITECTURE.md` la sección "Pilares de la POO" (pilar → archivo/clase), cómo ejecutar consola y web, y la limitación de contraseñas en texto plano; verificar que cada comando documentado funciona tal como está escrito
- [x] 6.2 Pasada integral: `npm test` y `npm run test:coverage` en verde, `openspec validate account-hierarchy-and-web-ui`, y recorrido manual completo (consola y web) de los tres tipos de producto
