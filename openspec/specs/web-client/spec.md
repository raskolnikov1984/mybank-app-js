# web-client Specification

## Purpose
Define la aplicación web de Mi Plata para que gerentes y clientes usen en el navegador las mismas operaciones bancarias que ofrece la consola, con los datos guardados en el navegador.

## Requirements

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

### Requirement: Default manager available
On first load with empty storage the web application SHALL create the default manager so that login is possible.

#### Scenario: First visit
- **WHEN** the application loads with empty browser storage
- **THEN** logging in as `gerente`/`admin` succeeds

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

### Requirement: Persistence in the browser
Registered users, product state and movements SHALL persist across page reloads in the same browser, and each product SHALL be restored as the same type it was saved with.

#### Scenario: Reload keeps data
- **WHEN** a credit card client with debt 300000 reloads the page and logs in again
- **THEN** the view still shows a credit card with debt 300000 and the prior movements

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
