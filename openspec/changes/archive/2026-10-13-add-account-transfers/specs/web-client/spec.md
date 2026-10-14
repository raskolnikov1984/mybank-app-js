# Spec Delta

## MODIFIED Requirements

### Requirement: Client operations
The client view SHALL let the logged-in client deposit, withdraw, transfer to another registered client, see their balance (or debt and available credit for a credit card), and see their movements. The transfer form SHALL let the client open a list of the available accounts, choose one recipient from it and enter an amount, and SHALL show the list's accounts by user name, full name when known, and product type. The view SHALL offer the monthly statement operation only when the client's product supports it (credit card). Domain errors SHALL be shown as readable Spanish messages without leaving the view.

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

#### Scenario: Recipient list is displayed
- **WHEN** a client opens the transfer form and expands the list of available accounts
- **THEN** the other registered clients are listed with their user name and product type, and the client themself and the manager are absent

#### Scenario: Successful transfer
- **WHEN** a client chooses a recipient from the list, enters a valid amount and confirms
- **THEN** a success message is shown, the displayed balance is updated and the movement list shows the transfer sent

#### Scenario: Transfer without a chosen recipient
- **WHEN** the client submits the transfer form without choosing a recipient
- **THEN** a Spanish message asks to choose a recipient and nothing changes

#### Scenario: No recipients available
- **WHEN** the client is the only registered client and opens the list of available accounts
- **THEN** the view states that there are no other accounts available to transfer to

#### Scenario: Rejected transfer
- **WHEN** the client transfers more than their product allows
- **THEN** an insufficient-funds message is shown in the view and the balance is unchanged
