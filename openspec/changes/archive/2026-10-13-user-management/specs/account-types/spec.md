# Spec Delta

## MODIFIED Requirements

### Requirement: Register a client with a product type
The system SHALL let a manager register a client choosing the product type (savings, checking or credit card). For savings and checking the initial balance MUST be greater than zero; for a credit card no initial balance is required. The user name MUST be unique: registering a name that already exists SHALL be rejected with a user-already-exists error and SHALL NOT replace the existing user or its product.

#### Scenario: Register client with credit card
- **WHEN** the manager registers a client named "ana" with type `CREDIT_CARD` and no initial balance
- **THEN** the client is stored with a credit card of zero debt

#### Scenario: Register client with savings
- **WHEN** the manager registers a client with type `SAVINGS` and initial balance 50000
- **THEN** the client is stored with a savings account of balance 50000

#### Scenario: Missing type defaults to savings
- **WHEN** the manager registers a client without specifying a type and with initial balance 50000
- **THEN** the client is stored with a savings account

#### Scenario: Duplicate name rejected
- **WHEN** the manager registers a client named "ana" and "ana" already exists with balance 61500
- **THEN** the request is rejected with a user-already-exists error and "ana" keeps its password, product and balance 61500
