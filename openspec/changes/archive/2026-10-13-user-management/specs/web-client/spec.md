# Spec Delta

## MODIFIED Requirements

### Requirement: Manager registers clients
The manager view SHALL let the manager register a client with name, password, product type and (for savings and checking) initial balance, and SHALL show validation errors, including the error for a name that already exists.

#### Scenario: Register
- **WHEN** the manager registers client "ana" with type `CHECKING` and initial balance 100000
- **THEN** "ana" can later log in and sees a checking account

#### Scenario: Duplicate name shows an error
- **WHEN** the manager registers a client with a name that already exists
- **THEN** the view shows an error saying the user already exists and the existing client is unchanged

### Requirement: Console remains available
The console application SHALL keep working with the same operations, SHALL let the manager choose the product type when registering a client, SHALL offer the monthly statement option only to clients whose product supports it, and SHALL offer the manager the user administration operations (list, change password, unlock and delete with confirmation).

#### Scenario: Console registration with type
- **WHEN** the manager registers a client from the console choosing a checking account
- **THEN** the client is created with a checking account

#### Scenario: Console monthly statement unsupported
- **WHEN** a savings client chooses the monthly statement option in the console
- **THEN** the console shows that the product has no monthly statement and nothing changes

#### Scenario: Console delete asks for confirmation
- **WHEN** the manager chooses to delete a client from the console and answers anything other than an explicit yes
- **THEN** the client is not deleted

## ADDED Requirements

### Requirement: Web user administration
The manager view SHALL include a client administration section showing the list of clients with their product type, status and position, and SHALL let the manager change a client's password, unlock a client, and delete a client after an explicit confirmation step. Errors SHALL be shown as readable Spanish messages and the list SHALL refresh after each successful operation.

#### Scenario: Change password from the list
- **WHEN** the manager changes the password of "ana" from the list
- **THEN** a success message is shown and "ana" can log in with the new password

#### Scenario: Unlock from the list
- **WHEN** the manager unlocks a locked client from the list
- **THEN** the client is shown as active

#### Scenario: Delete requires confirmation
- **WHEN** the manager presses delete on a client
- **THEN** a confirmation step naming the client is shown and nothing is deleted until the manager confirms

#### Scenario: Delete rejected for open balance
- **WHEN** the manager confirms the deletion of a client whose product has a balance
- **THEN** a message explains the product must be at zero and the client remains in the list

#### Scenario: Deleted client disappears
- **WHEN** the manager confirms the deletion of a client at zero
- **THEN** the client is removed from the list and can no longer log in
