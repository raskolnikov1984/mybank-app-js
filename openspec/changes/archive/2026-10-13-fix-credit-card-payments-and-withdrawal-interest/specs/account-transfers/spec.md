# Spec Delta

## MODIFIED Requirements

### Requirement: Transfer between clients
The system SHALL let a client transfer a positive amount from their own product to the product of another registered client. The transfer SHALL be one operation: the sender's position decreases by the amount and the recipient's position increases by the amount, or neither changes. The sender SHALL be subject to the same funds rules as a withdrawal from their product type, and the recipient SHALL receive the amount with the same rules as a deposit into their product type, including the rule that a credit card only accepts payments up to its debt.

#### Scenario: Successful transfer between savings accounts
- **WHEN** `ana` (savings, balance 500000) transfers 100000 to `luis` (savings, balance 200000)
- **THEN** `luis` has balance 300000 and `ana` has her balance reduced by 100000 plus the withdrawal interest her savings product charges

#### Scenario: Transfer to a credit card pays its debt
- **WHEN** a client transfers 100000 to a credit card client whose debt is 500000
- **THEN** the credit card debt becomes 400000

#### Scenario: Transfer from a credit card uses the available credit
- **WHEN** a credit card client with a 2000000 limit and no debt transfers 300000 to another client
- **THEN** the credit card debt becomes 306000 (the amount plus 6000 of withdrawal interest, recorded as its own interest movement) and the recipient receives 300000

#### Scenario: Transfer above the debt of a credit card recipient
- **WHEN** a client transfers 450000 to a credit card client whose debt is 300000
- **THEN** the system rejects the transfer with a payment-exceeds-debt error and neither the sender nor the recipient changes

#### Scenario: Insufficient funds
- **WHEN** a client transfers more than their product allows to withdraw
- **THEN** the system rejects the transfer with the same error as an equivalent withdrawal, and neither the sender nor the recipient changes

#### Scenario: Invalid amount
- **WHEN** a transfer is requested with an amount that is zero, negative or not a number
- **THEN** the system rejects it with an invalid-amount error and nothing changes
