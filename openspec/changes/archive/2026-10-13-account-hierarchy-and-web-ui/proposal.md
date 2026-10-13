# Proposal

## Why

El proyecto "Mi Plata" debe demostrar explícitamente los cuatro pilares de la POO (abstracción, encapsulamiento, herencia y polimorfismo) en una aplicación web. Hoy existe una sola clase concreta `Account`, sin jerarquía ni polimorfismo, y la única interfaz es una consola de Node; no hay front-end web.

## What Changes

- `Account` pasa a ser una **clase base abstracta**; no se puede instanciar directamente.
- Nuevas subclases con comportamiento propio: `SavingsAccount` (CuentaAhorros), `CheckingAccount` (CuentaCorriente) y `CreditCard` (TarjetaCredito).
- Comportamiento polimórfico: `withdrawFunds`, `monthlyStatement()` y `describe()` se comportan distinto según el tipo, sin `instanceof` en quien los invoca.
- Nueva `AccountFactory` que crea la subclase a partir de un tipo (`SAVINGS | CHECKING | CREDIT_CARD`).
- El registro de clientes acepta el tipo de cuenta (`RegisterUserDTO`, `RegisterUserUseCase`); `CreateManagerUseCase` pasa a usar una cuenta concreta.
- Nuevo caso de uso `ApplyMonthlyStatementUseCase`.
- Nueva aplicación web con **Next.js (JavaScript, App Router, en la raíz del repo)**: login, vista de cliente, vista de gerente. Persistencia en `localStorage` mediante repositorios `LocalStorage*` que implementan los puertos existentes.
- La consola se mantiene y permite elegir el tipo de cuenta al registrar clientes.
- Documentación: sección "Pilares de la POO" y tabla de equivalencias de nombres (CuentaAhorros = `SavingsAccount`, CuentaCorriente = `CheckingAccount`, TarjetaCredito = `CreditCard`, Cliente = `User` con rol `CLIENTE`); UML actualizado.
- **BREAKING**: `new Account(...)` deja de ser válido; los llamadores internos (`RegisterUserUseCase`, `CreateManagerUseCase`) y los tests que lo usen deben pasar a una subclase.

## Capabilities

### New Capabilities
- `account-types`: jerarquía de cuentas (base abstracta, ahorros, corriente, tarjeta de crédito), reglas de retiro/depósito por tipo, creación por fábrica y registro de clientes con tipo de cuenta.
- `monthly-statement`: cálculo polimórfico del estado mensual (intereses y comisiones) por tipo de cuenta y su caso de uso.
- `web-client`: aplicación web Next.js (login, operaciones del cliente, registro por el gerente) con persistencia en localStorage.

### Modified Capabilities
<!-- No hay specs previos en openspec/specs/, por lo que todo se declara como capacidad nueva. -->

## Impact

- Código: `src/domain/aggregates/account/entities/Account.js` (refactor), nuevas entidades y `AccountFactory` en `src/domain`, `src/application/use-cases/{RegisterUser,CreateManager}UseCase.js`, `RegisterUserDTO.js`, nuevo `ApplyMonthlyStatementUseCase.js`, `src/main.js`, repositorios `LocalStorage*` en `src/infraestructure/repositories/`, composition root web en `src/infraestructure/web/`, y `app/` (Next.js).
- Dependencias: `next`, `react`, `react-dom`; `jsconfig.json` con alias `@/*` → `src/*`; vitest debe ignorar `.next/`.
- Restricción: `src/domain` y `src/application` no deben usar APIs `node:*` (solo `ConsolePrompt` lo hace) para poder cargarse en el navegador.
- Tests: nuevos unit tests por subclase, polimorfismo, fábrica, casos de uso y repos LocalStorage.
- Docs: `README.md`, `ARCHITECTURE.md`, `docs/UML-Diagram.mmd`.
