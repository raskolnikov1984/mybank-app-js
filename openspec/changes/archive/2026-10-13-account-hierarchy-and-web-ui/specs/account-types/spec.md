# Spec Delta

## Purpose

Define los tipos de producto bancario de Mi Plata (cuenta de ahorros, cuenta corriente y tarjeta de crédito), sus reglas de retiro y depósito, y cómo se registra un cliente con un tipo de producto.

## ADDED Requirements

### Requirement: Generic accounts cannot be opened
The system SHALL NOT allow creating a product that is not one of the supported types (savings account, checking account, credit card).

#### Scenario: Unknown type rejected
- **WHEN** a product is requested with a type other than `SAVINGS`, `CHECKING` or `CREDIT_CARD`
- **THEN** the system rejects the request with an invalid account type error

### Requirement: Savings account rules
A savings account SHALL NOT allow withdrawals greater than its balance, and its balance SHALL never be negative. A savings account SHALL require a positive initial balance.

#### Scenario: Withdraw within balance
- **WHEN** a savings account with balance 100000 withdraws 40000
- **THEN** the balance becomes 60000 and a withdraw movement is recorded

#### Scenario: Withdraw above balance
- **WHEN** a savings account with balance 100000 withdraws 100001
- **THEN** the operation is rejected with a not-enough-funds error and the balance stays 100000

#### Scenario: Zero initial balance
- **WHEN** a savings account is opened with initial balance 0
- **THEN** the system rejects it with an invalid amount error

### Requirement: Checking account overdraft
A checking account SHALL allow withdrawals beyond its balance up to a fixed overdraft limit, and SHALL reject withdrawals that would exceed balance plus overdraft limit. Deposits SHALL first repay any overdraft in use.

#### Scenario: Withdraw using overdraft
- **WHEN** a checking account with balance 100000 and overdraft limit 500000 withdraws 300000
- **THEN** the operation succeeds, the balance is 0 and 200000 of overdraft is in use

#### Scenario: Exceed overdraft limit
- **WHEN** a checking account with balance 100000 and overdraft limit 500000 withdraws 600001
- **THEN** the operation is rejected with a not-enough-funds error and balance and overdraft are unchanged

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
Every product SHALL expose a human-readable type name in Spanish and a summary of its current position (balance for savings, balance and overdraft for checking, debt and available credit for credit card).

#### Scenario: Describe each type
- **WHEN** the description of a savings account, a checking account and a credit card is requested
- **THEN** each returns a different type name and a summary specific to its type

### Requirement: Register a client with a product type
The system SHALL let a manager register a client choosing the product type (savings, checking or credit card). For savings and checking the initial balance MUST be greater than zero; for a credit card no initial balance is required.

#### Scenario: Register client with credit card
- **WHEN** the manager registers a client named "ana" with type `CREDIT_CARD` and no initial balance
- **THEN** the client is stored with a credit card of zero debt

#### Scenario: Register client with savings
- **WHEN** the manager registers a client with type `SAVINGS` and initial balance 50000
- **THEN** the client is stored with a savings account of balance 50000

#### Scenario: Missing type defaults to savings
- **WHEN** the manager registers a client without specifying a type and with initial balance 50000
- **THEN** the client is stored with a savings account

### Requirement: Encapsulated state
A product's balance, debt and movement history SHALL only change through withdraw, deposit and monthly statement operations; no external caller can set them directly.

#### Scenario: Movements are not externally mutable
- **WHEN** a caller modifies the list returned as movement history
- **THEN** the product's own movement history is unchanged
