# Spec Delta

## REMOVED Requirements

### Requirement: Credit card monthly interest
**Reason**: Interest is now charged inside each installment purchase; keeping a flat 2% monthly charge on the whole debt would charge interest twice.
**Migration**: Use installment purchases on the credit card (see `credit-card-installments`). Existing debt is kept as it is and no longer grows by a monthly statement.

## MODIFIED Requirements

### Requirement: Apply monthly statement to a client
The system SHALL let a client's monthly statement be requested by client name, producing a result with the product type, charges/interests applied and resulting position when the client's product supports it, without the caller needing to know the product type. No current product (savings account, checking account, credit card) supports a monthly statement, so the system SHALL reject the request for each of them with a monthly-statement-not-supported error and leave the product unchanged.

#### Scenario: Unknown client
- **WHEN** the monthly statement is requested for a client that does not exist
- **THEN** the system rejects the request with an account-not-found error

#### Scenario: Same call, different outcome
- **WHEN** the monthly statement is requested for one credit card client with debt 500000 and for one savings client
- **THEN** both requests are rejected as not supported and neither product changes

#### Scenario: Credit card client
- **WHEN** the monthly statement is requested for a client whose product is a credit card with debt 500000
- **THEN** the system rejects the request with a monthly-statement-not-supported error and the debt stays 500000

#### Scenario: Savings client not supported
- **WHEN** the monthly statement is requested for a client with a savings account
- **THEN** the system rejects the request with a monthly-statement-not-supported error and the balance and movements are unchanged

#### Scenario: Checking client not supported
- **WHEN** the monthly statement is requested for a client with a checking account
- **THEN** the system rejects the request with a monthly-statement-not-supported error and no fee or interest is charged
