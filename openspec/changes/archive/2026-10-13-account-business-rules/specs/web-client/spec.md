# Spec Delta

## MODIFIED Requirements

### Requirement: Client operations
The client view SHALL let the logged-in client deposit, withdraw, see their balance (or debt and available credit for a credit card), and see their movements. The view SHALL offer the monthly statement operation only when the client's product supports it (credit card). Domain errors SHALL be shown as readable Spanish messages without leaving the view.

#### Scenario: Deposit
- **WHEN** a savings client with balance 100000 deposits 50000
- **THEN** the displayed balance is 150000 and the movement list shows the deposit

#### Scenario: Rejected withdrawal
- **WHEN** a savings client withdraws more than their balance plus the withdrawal interest
- **THEN** an insufficient-funds message is shown and the balance is unchanged

#### Scenario: Withdrawal shows interest
- **WHEN** a savings client with balance 100000 withdraws 40000
- **THEN** the displayed balance is 61500 and the movement list shows an interest of 1500 and the withdrawal

#### Scenario: Product-specific summary
- **WHEN** a credit card client opens the client view
- **THEN** the view shows debt and available credit instead of a plain balance

#### Scenario: Monthly statement only for credit cards
- **WHEN** a savings client and a checking client open the client view
- **THEN** neither view offers the monthly statement operation, while a credit card client's view does

### Requirement: Console remains available
The console application SHALL keep working with the same operations, SHALL let the manager choose the product type when registering a client, and SHALL offer the monthly statement option only to clients whose product supports it.

#### Scenario: Console registration with type
- **WHEN** the manager registers a client from the console choosing a checking account
- **THEN** the client is created with a checking account

#### Scenario: Console monthly statement unsupported
- **WHEN** a savings client chooses the monthly statement option in the console
- **THEN** the console shows that the product has no monthly statement and nothing changes
