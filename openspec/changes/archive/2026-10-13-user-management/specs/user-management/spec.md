# Spec Delta

## Purpose

Define cómo el gerente administra los usuarios clientes del banco: listarlos, corregir su contraseña, desbloquearlos y eliminarlos con confirmación.

## ADDED Requirements

### Requirement: List clients
The system SHALL let the manager list all clients (users with the client role), showing for each one the user name, the product type, whether the user is locked, and the product position (balance, or debt and available credit, or overdraft in use according to the product). The manager user SHALL NOT appear in the list.

#### Scenario: List with several products
- **WHEN** the manager lists clients and "ana" has a credit card, "luis" a checking account and "sofi" a savings account
- **THEN** the list contains the three clients, each with its product type and position, and does not contain "gerente"

#### Scenario: Empty list
- **WHEN** the manager lists clients and no client has been registered
- **THEN** the list is empty

#### Scenario: Locked client is flagged
- **WHEN** a client has been locked after three failed logins and the manager lists clients
- **THEN** that client is shown as locked

### Requirement: Change a client's password
The system SHALL let the manager set a new password for an existing client. The new password MUST NOT be empty. The user name, product type, balance and movements SHALL NOT change.

#### Scenario: Password changed
- **WHEN** the manager sets the password of "ana" to "nueva123"
- **THEN** "ana" can log in with "nueva123" and can no longer log in with the old password

#### Scenario: Empty password rejected
- **WHEN** the manager sets an empty password for "ana"
- **THEN** the request is rejected with a password-required error and the old password still works

#### Scenario: Unknown client
- **WHEN** the manager changes the password of a name that does not exist
- **THEN** the request is rejected with a user-not-found error

### Requirement: Unlock a client
The system SHALL let the manager unlock a locked client, clearing the failed attempts and the lock, so the client can log in again with the current password.

#### Scenario: Unlock after lockout
- **WHEN** "ana" is locked after three failed logins and the manager unlocks "ana"
- **THEN** "ana" can log in with the correct password and the failed attempts count is zero

#### Scenario: Unlock a client that is not locked
- **WHEN** the manager unlocks a client that is not locked
- **THEN** the operation succeeds and nothing observable changes

### Requirement: Delete a client with confirmation
The system SHALL let the manager delete a client only after an explicit confirmation, and only when the client's product is at zero: balance 0, no debt and no overdraft in use. Deleting SHALL remove the user, the product and its movements. A rejected or unconfirmed deletion SHALL leave everything unchanged.

#### Scenario: Delete a client at zero
- **WHEN** the manager confirms the deletion of "luis", whose checking account has balance 0 and no overdraft in use
- **THEN** "luis" no longer exists, does not appear in the list and cannot log in

#### Scenario: Deletion not confirmed
- **WHEN** the manager starts deleting "luis" and cancels the confirmation
- **THEN** "luis" still exists and nothing changes

#### Scenario: Client with balance
- **WHEN** the manager confirms the deletion of "sofi", whose savings account has balance 61500
- **THEN** the request is rejected with an open-balance error and "sofi" still exists

#### Scenario: Client with debt
- **WHEN** the manager confirms the deletion of "ana", whose credit card has debt 300000
- **THEN** the request is rejected with an open-balance error and "ana" still exists

#### Scenario: Client with overdraft in use
- **WHEN** the manager confirms the deletion of a client whose checking account has balance 0 and 200000 of overdraft in use
- **THEN** the request is rejected with an open-balance error and the client still exists

#### Scenario: Unknown client
- **WHEN** the manager deletes a name that does not exist
- **THEN** the request is rejected with a user-not-found error

#### Scenario: The manager cannot be deleted
- **WHEN** the manager tries to delete the user "gerente"
- **THEN** the request is rejected and "gerente" still exists

#### Scenario: A name can be reused after deletion
- **WHEN** "luis" has been deleted and the manager registers a client named "luis"
- **THEN** the registration succeeds with a new product and no previous movements

### Requirement: Only the manager administers users
The administration operations (list, change password, unlock, delete) SHALL only be available to a user with the manager role.

#### Scenario: Client cannot administer
- **WHEN** a logged-in client opens the administration page
- **THEN** they are redirected away and cannot list or modify users
