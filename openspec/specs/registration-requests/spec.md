# registration-requests Specification

## Purpose
Define el flujo por el cual una persona pide ser cliente del banco desde la web pública y el gerente decide si la acepta, sin crear usuarios directamente desde la página pública.

## Requirements

### Requirement: Submit a registration request
The system SHALL let any visitor submit a registration request with identification (type and number), full name, mobile phone, user name, password with its confirmation, product type (savings, checking or credit card) and, for savings and checking, an initial balance greater than zero. Submitting a request SHALL NOT create a user, a product or a session; it SHALL store a pending request with the identity data and without the password confirmation. Invalid data SHALL be rejected with the same validations as a direct registration and SHALL NOT store anything.

#### Scenario: Valid request
- **WHEN** a visitor submits the name "ana", a valid identification, full name and phone, a password with its confirmation, type `SAVINGS` and initial balance 50000
- **THEN** a pending request for "ana" is stored with those data, no user named "ana" exists and the visitor is told the request will be reviewed by the manager

#### Scenario: Credit card request without balance
- **WHEN** a visitor submits a request with type `CREDIT_CARD`, valid identity data and no initial balance
- **THEN** the pending request is stored

#### Scenario: Invalid data
- **WHEN** a visitor submits an empty name, an empty password, a mismatching confirmation, an invalid identification, an empty full name, an invalid phone, an unknown product type, or a non-positive initial balance for savings
- **THEN** the request is rejected with the corresponding validation error and no request is stored

### Requirement: Unique names across users and requests
A registration request MUST NOT be accepted when its name already belongs to an existing user (rejected with a user-already-exists error) or to another pending request (rejected with a request-already-exists error). Existing users and pending requests SHALL remain unchanged.

#### Scenario: Name of an existing user
- **WHEN** a visitor submits a request with the name "gerente" or the name of an existing client
- **THEN** the request is rejected with a user-already-exists error and nothing is stored

#### Scenario: Name already requested
- **WHEN** a visitor submits a request named "ana" while a pending request named "ana" exists
- **THEN** the request is rejected with a request-already-exists error and the first request is unchanged

### Requirement: List pending requests
The system SHALL let the manager list the pending requests, showing for each one the requested name, full name, identification (type and number), mobile phone, product type, initial balance (if any) and submission date, ordered from oldest to newest. The password SHALL NOT be part of the listed data.

#### Scenario: Pending requests listed
- **WHEN** the manager lists requests and "ana" and "luis" have pending requests
- **THEN** both appear ordered by submission date with full name, identification, phone, product type and initial balance, and no password is shown

#### Scenario: No pending requests
- **WHEN** the manager lists requests and there are none
- **THEN** the list is empty

### Requirement: Approve a request
The system SHALL let the manager approve a pending request. Approving SHALL create the client with the requested name, password, identity data, product type and initial balance, following the registration rules of clients, and SHALL remove the request from the pending list. If the name or the identification has been taken by a user in the meantime, approving SHALL fail with the corresponding already-exists error and the request SHALL remain pending.

#### Scenario: Approve a savings request
- **WHEN** the manager approves the pending request of "ana" for a savings account with initial balance 50000
- **THEN** "ana" exists as a client with a savings account of balance 50000 and the identity data of the request, can log in with the requested password and the request is no longer pending

#### Scenario: Approve a credit card request
- **WHEN** the manager approves a pending credit card request
- **THEN** the client is created with a credit card with zero debt

#### Scenario: Name taken meanwhile
- **WHEN** the manager registers "ana" directly and then approves the pending request of "ana"
- **THEN** the approval fails with a user-already-exists error, the existing "ana" is unchanged and the request stays pending

#### Scenario: Identification taken meanwhile
- **WHEN** the manager registers directly a client with the same identification as a pending request and then approves that request
- **THEN** the approval fails with an identification-already-registered error and the request stays pending

#### Scenario: Unknown request
- **WHEN** the manager approves a request that does not exist
- **THEN** the operation is rejected with a request-not-found error

### Requirement: Reject a request
The system SHALL let the manager reject a pending request. Rejecting SHALL discard the request without creating a user, and the name SHALL become available again for a new request.

#### Scenario: Reject
- **WHEN** the manager rejects the pending request of "ana"
- **THEN** the request is no longer pending, "ana" does not exist as a user and a new request named "ana" can be submitted

#### Scenario: Unknown request
- **WHEN** the manager rejects a request that does not exist
- **THEN** the operation is rejected with a request-not-found error

### Requirement: Only the manager reviews requests
Listing, approving and rejecting registration requests SHALL only be available to a user with the manager role, while submitting a request is available to any visitor.

#### Scenario: Client cannot review
- **WHEN** a logged-in client opens the manager page
- **THEN** they are redirected away and cannot list, approve or reject requests

### Requirement: Requests persist in the browser
Pending requests SHALL persist across page reloads in the same browser until they are approved or rejected.

#### Scenario: Reload keeps the request
- **WHEN** a visitor submits a request and the manager later opens the manager page after a reload
- **THEN** the pending request is listed
