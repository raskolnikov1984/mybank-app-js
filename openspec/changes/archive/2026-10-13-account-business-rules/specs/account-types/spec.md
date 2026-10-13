# Spec Delta

## MODIFIED Requirements

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

### Requirement: Product description by type
Every product SHALL expose a human-readable type name in Spanish and a summary of its current position (balance for savings; balance, overdraft in use and the overdraft limit available for checking; debt and available credit for credit card). Every product SHALL also tell whether it supports a monthly statement (only the credit card does).

#### Scenario: Describe each type
- **WHEN** the description of a savings account, a checking account and a credit card is requested
- **THEN** each returns a different type name and a summary specific to its type

#### Scenario: Monthly statement support by type
- **WHEN** a savings account, a checking account and a credit card are asked whether they support a monthly statement
- **THEN** only the credit card answers yes

### Requirement: Encapsulated state
A product's balance, debt and movement history SHALL only change through withdraw, deposit and, for products that support it, monthly statement operations; no external caller can set them directly.

#### Scenario: Movements are not externally mutable
- **WHEN** a caller modifies the list returned as movement history
- **THEN** the product's own movement history is unchanged
