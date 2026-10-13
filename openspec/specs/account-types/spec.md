# account-types Specification

## Purpose
Define los tipos de producto bancario de Mi Plata (cuenta de ahorros, cuenta corriente y tarjeta de crédito), sus reglas de retiro y depósito, y cómo se registra un cliente con un tipo de producto.

## Requirements

### Requirement: Generic accounts cannot be opened
The system SHALL NOT allow creating a product that is not one of the supported types (savings account, checking account, credit card).

#### Scenario: Unknown type rejected
- **WHEN** a product is requested with a type other than `SAVINGS`, `CHECKING` or `CREDIT_CARD`
- **THEN** the system rejects the request with an invalid account type error

### Requirement: Savings account rules
A savings account SHALL, on every accepted withdrawal, first credit an interest of 1.5% of its current balance (rounded to whole pesos) and record it as an interest movement, and then deduct the withdrawn amount. The withdrawn amount SHALL NOT exceed the balance plus that interest; a rejected withdrawal SHALL leave the balance and movements unchanged and credit no interest. A savings account's balance SHALL never be negative and a savings account SHALL require a positive initial balance.

#### Scenario: Withdraw within balance
- **WHEN** a savings account with balance 100000 withdraws 40000
- **THEN** an interest of 1500 is credited, the balance becomes 61500, and two movements are recorded in order: interest 1500 and withdraw 40000

#### Scenario: Withdraw up to balance plus interest
- **WHEN** a savings account with balance 100000 withdraws 101500
- **THEN** the withdrawal is accepted and the balance becomes 0

#### Scenario: Withdraw above balance
- **WHEN** a savings account with balance 100000 withdraws 101501
- **THEN** the operation is rejected with a not-enough-funds error, the balance stays 100000 and no movement is recorded

#### Scenario: Invalid amount credits no interest
- **WHEN** a savings account withdraws 0
- **THEN** the operation is rejected with an invalid amount error and no interest is credited

#### Scenario: Zero initial balance
- **WHEN** a savings account is opened with initial balance 0
- **THEN** the system rejects it with an invalid amount error

### Requirement: Checking account overdraft
A checking account SHALL NOT generate interests or charge fees. It SHALL allow withdrawals beyond its balance up to an additional 20% of its current balance, so the maximum withdrawal equals 120% of the balance, and SHALL reject withdrawals above that limit leaving balance and overdraft unchanged. Once the overdraft is in use no further overdraft SHALL be granted until deposits repay it. Deposits SHALL first repay any overdraft in use.

#### Scenario: Withdraw using overdraft
- **WHEN** a checking account with balance 1000000 withdraws 1200000
- **THEN** the operation succeeds, the balance is 0 and 200000 of overdraft is in use

#### Scenario: Exceed overdraft limit
- **WHEN** a checking account with balance 1000000 withdraws 1200001
- **THEN** the operation is rejected with a not-enough-funds error and balance and overdraft are unchanged

#### Scenario: Withdraw without using overdraft
- **WHEN** a checking account with balance 1000000 withdraws 400000
- **THEN** the balance becomes 600000, no overdraft is in use and only the withdraw movement is recorded

#### Scenario: No more overdraft once in use
- **WHEN** a checking account with balance 1000000 has withdrawn 1100000 and then withdraws 1
- **THEN** the second withdrawal is rejected with a not-enough-funds error

#### Scenario: Deposit repays overdraft first
- **WHEN** a checking account with 200000 of overdraft in use receives a deposit of 250000
- **THEN** the overdraft in use becomes 0 and the balance becomes 50000

### Requirement: Credit card limit
A credit card SHALL start with zero debt, SHALL allow purchases/withdrawals only up to its credit limit, and SHALL treat deposits as payments that reduce the debt. A credit card SHALL report its debt and available credit.

#### Scenario: Purchase within limit
- **WHEN** a credit card with limit 2000000 and debt 0 withdraws 500000
- **THEN** the debt becomes 500000 and available credit becomes 1500000

#### Scenario: Purchase above limit
- **WHEN** a credit card with limit 2000000 and debt 1900000 withdraws 200000
- **THEN** the operation is rejected with a credit limit exceeded error and the debt is unchanged

#### Scenario: Payment reduces debt
- **WHEN** a credit card with debt 500000 receives a deposit of 200000
- **THEN** the debt becomes 300000

### Requirement: Invalid amounts rejected for every type
Every product type SHALL reject non-positive or non-monetary amounts on withdraw and deposit.

#### Scenario: Negative deposit
- **WHEN** any product receives a deposit of 0
- **THEN** the operation is rejected with an invalid amount error

### Requirement: Product description by type
Every product SHALL expose a human-readable type name in Spanish and a summary of its current position (balance for savings; balance, overdraft in use and the overdraft limit available for checking; debt and available credit for credit card). Every product SHALL also tell whether it supports a monthly statement (only the credit card does).

#### Scenario: Describe each type
- **WHEN** the description of a savings account, a checking account and a credit card is requested
- **THEN** each returns a different type name and a summary specific to its type

#### Scenario: Monthly statement support by type
- **WHEN** a savings account, a checking account and a credit card are asked whether they support a monthly statement
- **THEN** only the credit card answers yes

### Requirement: Register a client with a product type
The system SHALL let a manager register a client choosing the product type (savings, checking or credit card) and providing the client's identity data (identification, full name and mobile phone) and a password with its confirmation, following the rules of client identity. For savings and checking the initial balance MUST be greater than zero; for a credit card no initial balance is required. The user name MUST be unique: registering a name that already exists SHALL be rejected with a user-already-exists error and SHALL NOT replace the existing user or its product.

#### Scenario: Register client with credit card
- **WHEN** the manager registers a client named "ana" with valid identity data, type `CREDIT_CARD` and no initial balance
- **THEN** the client is stored with a credit card of zero debt

#### Scenario: Register client with savings
- **WHEN** the manager registers a client with valid identity data, type `SAVINGS` and initial balance 50000
- **THEN** the client is stored with a savings account of balance 50000 and with the identity data given

#### Scenario: Missing type defaults to savings
- **WHEN** the manager registers a client with valid identity data, without specifying a type and with initial balance 50000
- **THEN** the client is stored with a savings account

#### Scenario: Duplicate name rejected
- **WHEN** the manager registers a client named "ana" and "ana" already exists with balance 61500
- **THEN** the request is rejected with a user-already-exists error and "ana" keeps its password, product and balance 61500

#### Scenario: Missing identity data rejected
- **WHEN** the manager registers a client without identification, full name or mobile phone
- **THEN** the registration is rejected with the corresponding validation error and nothing is stored

### Requirement: Encapsulated state
A product's balance, debt and movement history SHALL only change through withdraw, deposit and, for products that support it, monthly statement operations; no external caller can set them directly.

#### Scenario: Movements are not externally mutable
- **WHEN** a caller modifies the list returned as movement history
- **THEN** the product's own movement history is unchanged
