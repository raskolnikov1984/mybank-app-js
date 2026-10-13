# Spec Delta

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Savings monthly interest
**Reason**: The statement defines savings interest as 1.5% applied at withdrawal time, not as a monthly statement operation.
**Migration**: Interest is credited automatically on each withdrawal (see `account-types`, "Savings account rules").

### Requirement: Checking monthly fee and overdraft interest
**Reason**: The statement says a checking account generates no interests; the management fee is not part of the requirements.
**Migration**: None. A checking account only has the overdraft rule in `account-types`.
