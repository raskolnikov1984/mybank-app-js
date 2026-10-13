# Spec Delta

## MODIFIED Requirements

### Requirement: List clients
The system SHALL let the manager list all clients (users with the client role), showing for each one the user name, the full name, the identification (type and number), the mobile phone, the product type, whether the user is locked, and the product position (balance, or debt and available credit, or overdraft in use according to the product). Clients stored without identity data SHALL be listed with those fields as not available. The manager user SHALL NOT appear in the list. The password SHALL NOT be part of the listed data.

#### Scenario: List with several products
- **WHEN** the manager lists clients and "ana" has a credit card, "luis" a checking account and "sofi" a savings account
- **THEN** the list contains the three clients, each with its identity data, product type and position, and does not contain "gerente"

#### Scenario: Empty list
- **WHEN** the manager lists clients and no client has been registered
- **THEN** the list is empty

#### Scenario: Locked client is flagged
- **WHEN** a client has been locked after three failed logins and the manager lists clients
- **THEN** that client is shown as locked

#### Scenario: Client without identity data
- **WHEN** the manager lists clients and one was stored before identity data existed
- **THEN** that client is listed with its user name and product and the identity fields marked as not available
