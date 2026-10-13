# Spec Delta

## Purpose

Define el cierre mensual de cada producto, donde cada tipo aplica sus propios intereses y comisiones, y la operación que lo ejecuta para un cliente.

## ADDED Requirements

### Requirement: Savings monthly interest
At monthly statement, a savings account SHALL credit interest of 1% of its balance and record it as a movement.

#### Scenario: Interest credited
- **WHEN** the monthly statement is applied to a savings account with balance 100000
- **THEN** the balance becomes 101000 and the result reports interest 1000

### Requirement: Checking monthly fee and overdraft interest
At monthly statement, a checking account SHALL charge a fixed management fee of 10000 and, if overdraft is in use, an interest of 3% of the overdraft in use. Charges SHALL increase the overdraft in use when the balance cannot cover them.

#### Scenario: Fee charged from balance
- **WHEN** the monthly statement is applied to a checking account with balance 100000 and no overdraft in use
- **THEN** the balance becomes 90000 and the result reports fee 10000

#### Scenario: Fee plus overdraft interest
- **WHEN** the monthly statement is applied to a checking account with balance 0 and 100000 of overdraft in use
- **THEN** the overdraft in use becomes 113000 (100000 + 3000 interest + 10000 fee)

### Requirement: Credit card monthly interest
At monthly statement, a credit card SHALL add 2% interest on its debt to the debt. A credit card with no debt SHALL accrue nothing.

#### Scenario: Interest on debt
- **WHEN** the monthly statement is applied to a credit card with debt 500000
- **THEN** the debt becomes 510000 and the result reports interest 10000

#### Scenario: No debt
- **WHEN** the monthly statement is applied to a credit card with debt 0
- **THEN** the debt stays 0 and the reported interest is 0

### Requirement: Apply monthly statement to a client
The system SHALL let a client's monthly statement be applied by client name, producing a result with the product type, charges/interests applied and resulting position, without the caller needing to know the product type.

#### Scenario: Unknown client
- **WHEN** the monthly statement is requested for a client that does not exist
- **THEN** the system rejects the request with an account-not-found error

#### Scenario: Same call, different outcome
- **WHEN** the monthly statement is applied to one savings client and one credit card client with debt
- **THEN** the savings result shows interest earned and the credit card result shows interest charged
