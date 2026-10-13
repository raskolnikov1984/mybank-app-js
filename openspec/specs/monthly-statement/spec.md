# monthly-statement Specification

## Purpose
Define el cierre mensual de cada producto, donde cada tipo aplica sus propios intereses y comisiones, y la operación que lo ejecuta para un cliente.

## Requirements

### Requirement: Credit card monthly interest
At monthly statement, a credit card SHALL add 2% interest on its debt to the debt. A credit card with no debt SHALL accrue nothing.

#### Scenario: Interest on debt
- **WHEN** the monthly statement is applied to a credit card with debt 500000
- **THEN** the debt becomes 510000 and the result reports interest 10000

#### Scenario: No debt
- **WHEN** the monthly statement is applied to a credit card with debt 0
- **THEN** the debt stays 0 and the reported interest is 0

### Requirement: Apply monthly statement to a client
The system SHALL let a client's monthly statement be applied by client name when the client's product supports it, producing a result with the product type, charges/interests applied and resulting position, without the caller needing to know the product type. For a product that does not support it (savings account, checking account) the system SHALL reject the request with a monthly-statement-not-supported error and leave the product unchanged.

#### Scenario: Unknown client
- **WHEN** the monthly statement is requested for a client that does not exist
- **THEN** the system rejects the request with an account-not-found error

#### Scenario: Same call, different outcome
- **WHEN** the monthly statement is applied to one credit card client with debt 500000 and to one savings client
- **THEN** the credit card result reports interest charged 10000 and the debt becomes 510000, while the savings client's request is rejected as not supported

#### Scenario: Credit card client
- **WHEN** the monthly statement is applied to a client whose product is a credit card with debt 500000
- **THEN** the result reports interest 10000 and the debt becomes 510000

#### Scenario: Savings client not supported
- **WHEN** the monthly statement is requested for a client with a savings account
- **THEN** the system rejects the request with a monthly-statement-not-supported error and the balance and movements are unchanged

#### Scenario: Checking client not supported
- **WHEN** the monthly statement is requested for a client with a checking account
- **THEN** the system rejects the request with a monthly-statement-not-supported error and no fee or interest is charged
