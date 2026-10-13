# Spec Delta

## Purpose

Define cómo el sistema informa cuántos intentos de inicio de sesión le quedan a un usuario, para que el contador sea visible durante todo el proceso y coincida con el bloqueo por intentos fallidos.

## ADDED Requirements

### Requirement: Login attempts status
The system SHALL provide the login status of an existing user: the maximum number of attempts (3), the remaining attempts, and whether the account is currently locked. A user with no failed attempts SHALL have 3 remaining attempts; each failed attempt SHALL reduce them by one; a successful login SHALL restore them to 3; a locked account SHALL have 0 remaining attempts. A lock older than 24 hours SHALL NOT count as active, so the status of that user SHALL show 3 remaining attempts and not locked. Asking for the status SHALL NOT change the user.

#### Scenario: Fresh user
- **WHEN** the status of a client with no failed attempts is requested
- **THEN** it reports 3 of 3 remaining attempts and not locked

#### Scenario: After failures
- **WHEN** a client fails to log in once and then twice
- **THEN** the status reports 2 and then 1 remaining attempts

#### Scenario: Lockout
- **WHEN** a client fails three times
- **THEN** the status reports 0 remaining attempts and locked

#### Scenario: Success restores attempts
- **WHEN** a client with 2 failed attempts logs in successfully
- **THEN** the status reports 3 of 3 remaining attempts

#### Scenario: Expired lock
- **WHEN** a client was locked more than 24 hours ago
- **THEN** the status reports 3 remaining attempts and not locked, without modifying the stored user

#### Scenario: Unknown user
- **WHEN** the status of a name that has no account is requested
- **THEN** the system reports that the user does not exist and no attempt data

### Requirement: Failed login message with the counter
When a login fails because of wrong credentials, the error SHALL tell the number of the failed attempt and the remaining attempts (for example "Intento 1 de 3. Intentos restantes: 2"). On the third failed attempt the error SHALL be the lockout message stating that the account is blocked for 24 hours.

#### Scenario: First failure
- **WHEN** a client logs in with a wrong password for the first time
- **THEN** the error says it was attempt 1 of 3 and that 2 attempts remain

#### Scenario: Third failure
- **WHEN** a client fails a third consecutive time
- **THEN** the error says the account is blocked for 24 hours and no remaining attempts are offered

#### Scenario: Locked account rejects the correct password
- **WHEN** a locked client logs in with the correct password within 24 hours
- **THEN** the login is rejected with the lockout message

### Requirement: Visible attempts counter
The login form SHALL show an attempts counter at all times, with the text "Intentos restantes: N de 3". It SHALL show "3 de 3" when no user name has been typed or when the typed name does not belong to a user; it SHALL show the real remaining attempts once the typed name belongs to an existing user and after every failed attempt; and it SHALL show "0 de 3" with the lockout information when the account is locked. The counter SHALL be announced to assistive technologies when it changes. The counter SHALL NOT reveal whether a name exists beyond what the login errors already reveal.

#### Scenario: Counter visible from the start
- **WHEN** a visitor opens the login page
- **THEN** the counter "Intentos restantes: 3 de 3" is displayed before typing anything

#### Scenario: Counter follows an existing user
- **WHEN** a visitor types the name of a client that has already failed once
- **THEN** the counter shows "Intentos restantes: 2 de 3"

#### Scenario: Counter after each failure
- **WHEN** a visitor fails to log in once, twice and a third time as the same client
- **THEN** the counter shows 2, 1 and 0 of 3, and after the third failure the account is shown as blocked with an informative message

#### Scenario: Unknown name keeps the default counter
- **WHEN** a visitor types a name that does not exist
- **THEN** the counter keeps showing "Intentos restantes: 3 de 3"

#### Scenario: Counter is persistent
- **WHEN** a client with 1 remaining attempt reloads the login page and types their name again
- **THEN** the counter shows "Intentos restantes: 1 de 3"
