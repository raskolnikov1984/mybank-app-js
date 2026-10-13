# Spec Delta

## MODIFIED Requirements

### Requirement: Web login
The web application SHALL show a login page at `/login` asking for name and password and showing the attempts counter, SHALL send a manager to the manager view and a client to the client view, and SHALL show a Spanish error message for invalid credentials, unknown users and locked accounts. Lockout rules (3 failed attempts, 24-hour lock) SHALL match the console.

#### Scenario: Manager login
- **WHEN** the user logs in as `gerente` with password `admin`
- **THEN** the manager view is displayed

#### Scenario: Unknown user
- **WHEN** a name with no account is submitted
- **THEN** the page shows "No tiene una cuenta abierta en el Banco Mi Plata" and no session is started

#### Scenario: Lockout
- **WHEN** a wrong password is submitted three times for an existing client
- **THEN** the page shows that the account is locked and further logins for that client are rejected

#### Scenario: Counter shown on the login page
- **WHEN** a visitor opens the login page and then fails twice as an existing client
- **THEN** the counter reads "Intentos restantes: 3 de 3" at first, then 2 and 1 of 3, and the last error tells how many attempts remain

#### Scenario: Blocked message at the third failure
- **WHEN** the third failure happens
- **THEN** the counter reads "0 de 3" and the page shows an informative message that the account is blocked for 24 hours

### Requirement: Manager registers clients
The manager view SHALL let the manager register a client with identification (type and number), full name, mobile phone, user name, password with confirmation, product type and (for savings and checking) initial balance, and SHALL show validation errors, including the errors for a name or an identification that already exists and for a confirmation that does not match.

#### Scenario: Register
- **WHEN** the manager registers client "ana" with valid identity data, type `CHECKING` and initial balance 100000
- **THEN** "ana" can later log in and sees a checking account

#### Scenario: Duplicate name shows an error
- **WHEN** the manager registers a client with a name that already exists
- **THEN** the view shows an error saying the user already exists and the existing client is unchanged

#### Scenario: Validation errors shown
- **WHEN** the manager submits an invalid identification, an invalid phone, a missing full name, a mismatching confirmation, or an identification already used
- **THEN** the view shows a readable Spanish error for each case and nothing is stored

### Requirement: Web registration request review
The manager view SHALL include a "Solicitudes de registro" section listing the pending requests with their full name, identification, phone, product type, initial balance and date, and SHALL let the manager approve or reject each one. Errors SHALL be shown as readable Spanish messages and the section and the client list SHALL refresh after each operation.

#### Scenario: Approve from the list
- **WHEN** the manager approves a pending request
- **THEN** a success message is shown, the request disappears from the pending list and the new client appears in the client list with its identity data

#### Scenario: Reject from the list
- **WHEN** the manager rejects a pending request
- **THEN** the request disappears from the pending list and no client is created

#### Scenario: Approval error shown
- **WHEN** the manager approves a request whose name was taken meanwhile
- **THEN** a message explains that the user already exists and the request remains in the list

#### Scenario: No pending requests
- **WHEN** the manager opens the view and there are no pending requests
- **THEN** the section shows that there are no pending requests

#### Scenario: Identity data visible to the manager
- **WHEN** the manager opens the view with a pending request
- **THEN** the request row shows the full name, the identification with its type, and the phone, and never the password

### Requirement: Web registration page
The web application SHALL provide a public registration page at `/registro` with the fields identification type, identification number, full name, mobile phone, user name, password, password confirmation, product type and (for savings and checking) initial balance, SHALL submit a registration request, SHALL show a confirmation that the request awaits the manager's review or the Spanish validation error, and SHALL NOT start a session or create a user.

#### Scenario: Request submitted
- **WHEN** a visitor completes the form with valid data and submits it
- **THEN** a confirmation says the request was sent and will be reviewed, the form is cleared and the visitor cannot yet log in with those credentials

#### Scenario: Balance field depends on the product
- **WHEN** a visitor selects the credit card product
- **THEN** the initial balance field is not shown

#### Scenario: Validation errors
- **WHEN** a visitor submits a name that already exists
- **THEN** the page shows an error saying the name is already in use and nothing is stored

#### Scenario: Password confirmation mismatch
- **WHEN** a visitor enters a confirmation different from the password
- **THEN** the page shows that the passwords do not match and nothing is stored

#### Scenario: Identity validation messages
- **WHEN** a visitor submits an invalid identification number, an invalid phone, an empty full name, or an identification already registered
- **THEN** the page shows a readable Spanish message for the problem and nothing is stored

### Requirement: Console remains available
The console application SHALL keep working with the same operations, SHALL let the manager choose the product type and enter the identity data and password confirmation when registering a client, SHALL offer the monthly statement option only to clients whose product supports it, SHALL offer the manager the user administration operations (list, change password, unlock and delete with confirmation), and SHALL show the login attempts counter.

#### Scenario: Console registration with type
- **WHEN** the manager registers a client from the console choosing a checking account and entering valid identity data
- **THEN** the client is created with a checking account and the identity data

#### Scenario: Console monthly statement unsupported
- **WHEN** a savings client chooses the monthly statement option in the console
- **THEN** the console shows that the product has no monthly statement and nothing changes

#### Scenario: Console delete asks for confirmation
- **WHEN** the manager chooses to delete a client from the console and answers anything other than an explicit yes
- **THEN** the client is not deleted

#### Scenario: Console attempts counter
- **WHEN** a user types an existing user name in the console login and then fails the password
- **THEN** the console shows "Intentos restantes: 3 de 3" before asking the password and the updated remaining attempts after the failure
