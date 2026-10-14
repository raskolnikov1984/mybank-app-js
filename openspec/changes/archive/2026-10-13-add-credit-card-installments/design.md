# Design

## Context

`CreditCard` extiende `Account` y hoy solo "retira" hasta el cupo (la deuda es `creditUsed`) y aplica 2 % mensual en `monthlyStatement()`. `Movement` guarda tipo, monto y fecha; los snapshots serializan los movimientos con esos tres campos y `Account.restoreState` los reconstruye. Los casos de uso ya siguen el patrón DTO → cuenta del repositorio → operación polimórfica → guardar (`WithdrawUseCase`, `ApplyMonthlyStatementUseCase`). Ver proposal.md para la motivación y las decisiones de negocio ya tomadas (deuda = capital + intereses totales; estado mensual de la tarjeta eliminado).

## Goals / Non-Goals

**Goals:**
- Una sola fuente del cálculo de tasa y cuota, reutilizada por la compra y por la vista previa de la UI.
- Mantener polimorfismo: quien llama no usa `instanceof`; los productos sin cuotas rechazan con un error propio.
- Datos de cuotas en el historial sin romper snapshots existentes.

**Non-Goals:**
- Calendario de vencimientos, pago de cuotas individuales o amortización mes a mes: la deuda es un único total que baja con consignaciones.
- Compras a cuotas en la consola (`src/main.js`) y en cuentas de ahorro o corriente.
- Tasas configurables por el cliente o por el gerente.

## Decisions

1. **`InstallmentPlan` (value object de dominio)** con `InstallmentPlan.quote(capital: Money, installments)` que valida el plazo (entero de 1 a 36) y devuelve `{ installments, rate, monthlyPayment, totalToPay, interest }` como `Money`. Las tasas viven ahí como tabla (≤2 → 0, 3–6 → 0,019, ≥7 → 0,023). Alternativa descartada: el cálculo dentro de `CreditCard`, que obligaría a la UI a duplicarlo para la vista previa.
2. **Redondeo:** cuota = `Math.round` de la fórmula; total = cuota × n; interés = total − capital. Con tasa 0 el total es el capital exacto (la cuota mostrada va redondeada). Los ejemplos del spec (177924, 96310, 207648) se fijan como pruebas.
3. **Operación polimórfica en `Account`:** `supportsInstallments()` (false) y `purchaseInInstallments(amount, installments)` que lanza `InstallmentsNotSupportedError`; `CreditCard` lo sobrescribe. Mismo patrón que `monthlyStatement()`. La compra calcula el plan, comprueba que el total quepa en el cupo disponible (si no, `CreditLimitExceededError` existente), suma el total a `creditUsed` y registra un movimiento.
4. **`Movement` con datos opcionales de cuotas** (`installments`, `monthlyPayment`, `totalToPay`) como cuarto parámetro, expuestos con `getInstallments()` y similares (nulos cuando no aplica). Nuevo `MovementType.INSTALLMENT_PURCHASE`; el monto del movimiento es el capital. Los snapshots añaden esos campos solo cuando existen, y `restoreState` los lee si están presentes, de modo que los datos guardados siguen cargando sin migración.
5. **Estado mensual de la tarjeta:** `CreditCard.supportsMonthlyStatement()` pasa a false y se elimina su `monthlyStatement()` y la constante del 2 %; hereda el rechazo de `Account`. Se conservan el caso de uso, el error y el gancho polimórfico (ningún producto los usa hoy) para no ampliar el alcance con un borrado de funcionalidad. La sección de la UI web ya es condicional al soporte y desaparece sola; la consola ya informa que el producto no tiene estado mensual.
6. **Casos de uso:** `PurchaseUseCase({ accountId, amount, installments })` con `PurchaseDTO`, y `QuoteInstallmentsUseCase({ amount, installments })` sin cuenta ni efectos, solo para la vista previa. `PurchaseUseCase` devuelve `{ purchase: { amount, installments, rate, monthlyPayment, totalToPay, interest }, debt, availableCredit }`. `GetBalanceUseCase` suma `supportsInstallments`.
7. **Errores nuevos:** `InvalidInstallmentsError` (`INVALID_INSTALLMENTS_ERROR`) e `InstallmentsNotSupportedError` (`INSTALLMENTS_NOT_SUPPORTED_ERROR`), con mensajes en español en `errorMessages.js`.
8. **UI:** sección "Compra a cuotas" solo cuando `supportsInstallments`, con monto, número de cuotas (1–36) y una vista previa en vivo (tasa, cuota y total) calculada con `QuoteInstallmentsUseCase` mientras los valores sean válidos. La tabla de movimientos añade una columna "Cuota mensual" que muestra el valor para compras a cuotas y "—" para el resto, y las etiquetas de `MOVEMENT_LABELS` suman la compra a cuotas. `bank.js` reemplaza "Interés mensual del 2 %" por las tasas por plazo.

## Risks / Trade-offs

- [Deuda = capital + intereses totales: pagar antes de tiempo no ahorra intereses] → Aceptado por decisión de negocio; no hay amortización por cuota (ver Non-Goals).
- [Quitar el 2 % cambia el comportamiento de tarjetas con deuda ya guardada: dejan de generar interés mensual] → La deuda existente se conserva tal cual; no se migra ni se recalcula.
- [Un retiro simple en la tarjeta sigue permitido y no cobra interés] → Se conserva por compatibilidad (equivale a una compra en 1 cuota); la UI promueve la compra a cuotas como forma de compra.
- [Tope de 36 cuotas es un supuesto] → Constante única en `InstallmentPlan`; cambiarla no afecta a nada más.
- [Redondeo a pesos enteros hace que cuota × n difiera en pesos de la fórmula exacta] → Es el total que se cobra y muestra; documentado en el spec.

## Open Questions

- ¿El tope de 36 cuotas es el deseado? Se asume 36 y es fácil de ajustar.
