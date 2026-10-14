# account-transfers Specification

## Purpose

Permite que un cliente registrado envíe dinero de su producto al producto de otro cliente registrado, eligiendo el destinatario entre las cuentas disponibles y dejando constancia en el historial de ambos.

## Requirements

### Requirement: List available transfer recipients
The system SHALL let a client list the accounts available to receive a transfer. The list SHALL contain every registered client except the requesting client and the manager, ordered by user name, and each entry SHALL show the user name, the full name when the client has one, and the product type. The list SHALL NOT reveal balances, debts or movements of other clients.

#### Scenario: Recipients exclude the sender and the manager
- **WHEN** clients `ana`, `luis` and `maria` are registered and `ana` lists her available recipients
- **THEN** the list contains `luis` and `maria`, in that order, and contains neither `ana` nor the manager

#### Scenario: No other clients
- **WHEN** `ana` is the only registered client and lists her available recipients
- **THEN** the list is empty

#### Scenario: No balances exposed
- **WHEN** a client lists the available recipients
- **THEN** no entry includes the balance, debt or movements of the listed client

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

### Requirement: Valid transfer recipients
The system SHALL reject a transfer whose recipient is the sender, does not exist, or is the manager, and SHALL leave every account unchanged in those cases.

#### Scenario: Transfer to self
- **WHEN** `ana` transfers 1000 to `ana`
- **THEN** the system rejects it with a same-account transfer error and her balance is unchanged

#### Scenario: Unknown recipient
- **WHEN** `ana` transfers 1000 to a user name that is not registered
- **THEN** the system rejects it with an account-not-found error and her balance is unchanged

#### Scenario: Manager as recipient
- **WHEN** `ana` transfers 1000 to the manager
- **THEN** the system rejects the transfer and her balance is unchanged

#### Scenario: Locked recipient
- **WHEN** `ana` transfers 1000 to a client whose login is locked
- **THEN** the transfer succeeds, because receiving funds does not require the recipient to log in

### Requirement: Transfers in the movement history
The system SHALL record a transfer as a "transfer sent" movement in the sender's history and a "transfer received" movement in the recipient's history, both with the transferred amount and the date, distinguishable from withdrawals and deposits. Interest charged by the sender's product SHALL still appear as its own interest movement.

#### Scenario: Both histories show the transfer
- **WHEN** `ana` transfers 100000 to `luis`
- **THEN** `ana`'s movements include a transfer sent of 100000 and `luis`'s movements include a transfer received of 100000

#### Scenario: Transfers survive persistence
- **WHEN** a transfer is made and the stored data is loaded again
- **THEN** both histories still show the transfer movements with their original type, amount and date
