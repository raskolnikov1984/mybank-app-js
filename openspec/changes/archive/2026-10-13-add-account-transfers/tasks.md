# Tasks

## 1. Dominio: movimientos y errores de transferencia

- [x] 1.1 Agregar `TRANSFER_OUT` y `TRANSFER_IN` a `MovementType` y permitir un tipo de movimiento opcional en `Account.withdrawFunds`/`depositFunds` (también reenviado en `SavingsAccount.withdrawFunds`); verificar con tests unitarios en `tests/unit/` que los retiros y consignaciones sin tipo siguen registrando `WITHDRAW`/`DEPOSIT` y que con tipo registran el pedido, en ahorros, corriente y tarjeta, y que el snapshot restaura los tipos nuevos
- [x] 1.2 Crear `SameAccountTransferError` (código `SAME_ACCOUNT_TRANSFER_ERROR`) y verificar con un test unitario de su código y mensaje, siguiendo el de los demás errores de dominio

## 2. Aplicación: transferir y listar destinatarios

- [x] 2.1 Crear `TransferDTO` y `TransferUseCase` (validaciones previas, retiro en origen, consignación en destino, guardado de ambas cuentas); verificar con tests unitarios en `tests/unit/application/` los escenarios del spec `account-transfers`: transferencia exitosa entre ahorros, a tarjeta con deuda, desde tarjeta, fondos insuficientes sin cambios, monto inválido, destinatario propio, inexistente y gerente, y destinatario bloqueado
- [x] 2.2 Crear `ListTransferRecipientsUseCase` que excluye al solicitante y al gerente, ordena por nombre y no expone saldos; verificar con tests unitarios de lista, lista vacía y ausencia de saldos

## 3. Infraestructura web y persistencia

- [x] 3.1 Registrar `transfer` y `listTransferRecipients` en `getContainer()`, agregar etiquetas de `TRANSFER_OUT`/`TRANSFER_IN` en `format.js` y el mensaje de `SAME_ACCOUNT_TRANSFER_ERROR` en `errorMessages.js`; verificar con los tests existentes de `format` y `errorMessages` ampliados con los casos nuevos
- [x] 3.2 Verificar con un test de repositorios `localStorage` que, tras una transferencia, ambos historiales recargados conservan los movimientos de transferencia con su tipo, monto y fecha

## 4. Interfaz del cliente

- [ ] 4.1 Agregar a `app/(panel)/cliente/page.js` la sección "Transferir" (`CollapsibleSection`) con el desplegable de cuentas disponibles, el campo de monto, el mensaje "Elige un destinatario" sin selección y el texto de lista vacía; verificar ejecutando `npm run dev` e iniciando sesión con dos clientes: la transferencia actualiza saldo y movimientos, y los errores se muestran en español sin salir de la vista
- [x] 4.2 Ejecutar `npm test` y `npm run build` y verificar que pasan sin errores

## 5. Documentación

- [x] 5.1 Actualizar `docs/UML-Diagram.mmd` con los casos de uso, el DTO, el error y los tipos de movimiento nuevos y verificar que renderiza con mermaid-cli; actualizar el README si lista las operaciones del cliente
