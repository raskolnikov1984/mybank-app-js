# Spec Delta

## MODIFIED Requirements

### Requirement: Register a client with a product type
The system SHALL let a manager register a client choosing the product type (savings, checking or credit card) and providing the client's identity data (identification, full name and mobile phone) and a password with its confirmation, following the rules of client identity. For savings and checking the initial balance MUST be greater than zero; for a credit card no initial balance is required. The user name MUST be unique: registering a name that already exists SHALL be rejected with a user-already-exists error and SHALL NOT replace the existing user or its product.

#### Scenario: Register client with credit card
- **WHEN** the manager registers a client named "ana" with valid identity data, type `CREDIT_CARD` and no initial balance
- **THEN** the client is stored with a credit card of zero debt

#### Scenario: Register client with savings
- **WHEN** the manager registers a client with valid identity data, type `SAVINGS` and initial balance 50000
- **THEN** the client is stored with a savings account of balance 50000 and with the identity data given

#### Scenario: Missing type defaults to savings
- **WHEN** the manager registers a client with valid identity data, without specifying a type and with initial balance 50000
- **THEN** the client is stored with a savings account

#### Scenario: Duplicate name rejected
- **WHEN** the manager registers a client named "ana" and "ana" already exists with balance 61500
- **THEN** the request is rejected with a user-already-exists error and "ana" keeps its password, product and balance 61500

#### Scenario: Missing identity data rejected
- **WHEN** the manager registers a client without identification, full name or mobile phone
- **THEN** the registration is rejected with the corresponding validation error and nothing is stored
