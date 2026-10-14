# Proposal

## Why

Los clientes de Mi Plata solo pueden consignar y retirar sobre su propio producto. No hay forma de mover dinero a otro cliente registrado sin pasar por un retiro y una consignación manuales, que además no dejan rastro de que ambas operaciones están relacionadas.

## What Changes

- Nueva operación de **transferencia** entre clientes registrados: el monto sale del producto del remitente y entra al producto del destinatario en una sola operación.
- El cliente puede **desplegar la lista de cuentas disponibles** (los demás clientes registrados) para elegir el destinatario de la transferencia.
- El historial de movimientos distingue transferencias enviadas y recibidas de los retiros y consignaciones.
- La vista web del cliente incorpora un formulario de transferencia con selector de destinatario y monto.
- No hay cambios que rompan el comportamiento existente.

## Capabilities

### New Capabilities
- `account-transfers`: transferencia de dinero entre clientes registrados, listado de destinatarios disponibles, reglas de validación y registro en el historial.

### Modified Capabilities
- `web-client`: la operación "Client operations" del cliente suma la transferencia con el selector de destinatarios.

## Impact

- Dominio: tipos de movimiento nuevos (transferencia enviada/recibida) y un error nuevo para transferencias a la misma cuenta; `Account` permite registrar el tipo de movimiento al retirar/consignar.
- Aplicación: casos de uso nuevos para listar destinatarios y transferir, con su DTO.
- Infraestructura web: registro en el contenedor, etiquetas de movimientos y mensajes de error en español.
- UI: `app/(panel)/cliente/page.js`.
- Persistencia: los movimientos nuevos se guardan en los snapshots existentes sin cambio de formato; los datos ya guardados siguen siendo válidos.
- Documentación: diagrama UML en `docs/UML-Diagram.mmd`.
