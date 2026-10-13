# Spec Delta

## MODIFIED Requirements

### Requirement: Web login
The web application SHALL show a login page at `/login` asking for name and password, SHALL send a manager to the manager view and a client to the client view, and SHALL show a Spanish error message for invalid credentials, unknown users and locked accounts. Lockout rules (3 failed attempts, 24-hour lock) SHALL match the console.

#### Scenario: Manager login
- **WHEN** the user logs in as `gerente` with password `admin`
- **THEN** the manager view is displayed

#### Scenario: Unknown user
- **WHEN** a name with no account is submitted
- **THEN** the page shows "No tiene una cuenta abierta en el Banco Mi Plata" and no session is started

#### Scenario: Lockout
- **WHEN** a wrong password is submitted three times for an existing client
- **THEN** the page shows that the account is locked and further logins for that client are rejected

### Requirement: Session protection
Client and manager views SHALL only be reachable with an active session of the proper role, and logging out SHALL end the session and return to the landing page.

#### Scenario: Direct navigation without session
- **WHEN** an unauthenticated visitor opens the client or manager page directly
- **THEN** they are redirected to the login page at `/login`

#### Scenario: Client opens manager page
- **WHEN** a logged-in client opens the manager page
- **THEN** they are redirected away and cannot register clients

#### Scenario: Logout returns to the landing
- **WHEN** a logged-in user logs out
- **THEN** the session ends and the landing page is displayed

## ADDED Requirements

### Requirement: Web registration request review
The manager view SHALL include a "Solicitudes de registro" section listing the pending requests with their product type, initial balance and date, and SHALL let the manager approve or reject each one. Errors SHALL be shown as readable Spanish messages and the section and the client list SHALL refresh after each operation.

#### Scenario: Approve from the list
- **WHEN** the manager approves a pending request
- **THEN** a success message is shown, the request disappears from the pending list and the new client appears in the client list

#### Scenario: Reject from the list
- **WHEN** the manager rejects a pending request
- **THEN** the request disappears from the pending list and no client is created

#### Scenario: Approval error shown
- **WHEN** the manager approves a request whose name was taken meanwhile
- **THEN** a message explains that the user already exists and the request remains in the list

#### Scenario: No pending requests
- **WHEN** the manager opens the view and there are no pending requests
- **THEN** the section shows that there are no pending requests

### Requirement: Web registration page
The web application SHALL provide a public registration page at `/registro` with the fields name, password, product type and (for savings and checking) initial balance, SHALL submit a registration request, SHALL show a confirmation that the request awaits the manager's review or the Spanish validation error, and SHALL NOT start a session or create a user.

#### Scenario: Request submitted
- **WHEN** a visitor completes the form with valid data and submits it
- **THEN** a confirmation says the request was sent and will be reviewed, the form is cleared and the visitor cannot yet log in with those credentials

#### Scenario: Balance field depends on the product
- **WHEN** a visitor selects the credit card product
- **THEN** the initial balance field is not shown

#### Scenario: Validation errors
- **WHEN** a visitor submits a name that already exists
- **THEN** the page shows an error saying the name is already in use and nothing is stored
