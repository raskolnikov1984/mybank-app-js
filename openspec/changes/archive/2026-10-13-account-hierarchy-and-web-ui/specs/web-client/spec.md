# Spec Delta

## Purpose

Define la aplicación web de Mi Plata para que gerentes y clientes usen en el navegador las mismas operaciones bancarias que ofrece la consola, con los datos guardados en el navegador.

## ADDED Requirements

### Requirement: Web login
The web application SHALL show a login page asking for name and password, SHALL send a manager to the manager view and a client to the client view, and SHALL show a Spanish error message for invalid credentials, unknown users and locked accounts. Lockout rules (3 failed attempts, 24-hour lock) SHALL match the console.

#### Scenario: Manager login
- **WHEN** the user logs in as `gerente` with password `admin`
- **THEN** the manager view is displayed

#### Scenario: Unknown user
- **WHEN** a name with no account is submitted
- **THEN** the page shows "No tiene una cuenta abierta en el Banco Mi Plata" and no session is started

#### Scenario: Lockout
- **WHEN** a wrong password is submitted three times for an existing client
- **THEN** the page shows that the account is locked and further logins for that client are rejected

### Requirement: Default manager available
On first load with empty storage the web application SHALL create the default manager so that login is possible.

#### Scenario: First visit
- **WHEN** the application loads with empty browser storage
- **THEN** logging in as `gerente`/`admin` succeeds

### Requirement: Client operations
The client view SHALL let the logged-in client deposit, withdraw, see their balance (or debt and available credit for a credit card), see their movements, and apply the monthly statement. Domain errors SHALL be shown as readable Spanish messages without leaving the view.

#### Scenario: Deposit
- **WHEN** a savings client with balance 100000 deposits 50000
- **THEN** the displayed balance is 150000 and the movement list shows the deposit

#### Scenario: Rejected withdrawal
- **WHEN** a savings client withdraws more than their balance
- **THEN** an insufficient-funds message is shown and the balance is unchanged

#### Scenario: Product-specific summary
- **WHEN** a credit card client opens the client view
- **THEN** the view shows debt and available credit instead of a plain balance

### Requirement: Manager registers clients
The manager view SHALL let the manager register a client with name, password, product type and (for savings and checking) initial balance, and SHALL show validation errors.

#### Scenario: Register
- **WHEN** the manager registers client "ana" with type `CHECKING` and initial balance 100000
- **THEN** "ana" can later log in and sees a checking account

### Requirement: Session protection
Client and manager views SHALL only be reachable with an active session of the proper role, and logging out SHALL end the session.

#### Scenario: Direct navigation without session
- **WHEN** an unauthenticated visitor opens the client or manager page directly
- **THEN** they are redirected to the login page

#### Scenario: Client opens manager page
- **WHEN** a logged-in client opens the manager page
- **THEN** they are redirected away and cannot register clients

### Requirement: Persistence in the browser
Registered users, product state and movements SHALL persist across page reloads in the same browser, and each product SHALL be restored as the same type it was saved with.

#### Scenario: Reload keeps data
- **WHEN** a credit card client with debt 300000 reloads the page and logs in again
- **THEN** the view still shows a credit card with debt 300000 and the prior movements

### Requirement: Console remains available
The console application SHALL keep working with the same operations, and SHALL let the manager choose the product type when registering a client.

#### Scenario: Console registration with type
- **WHEN** the manager registers a client from the console choosing a checking account
- **THEN** the client is created with a checking account
