# client-identity Specification

## Purpose
Define los datos de identidad que el banco registra de cada cliente (identificación, nombre completo y celular), sus reglas de validación, la confirmación de contraseña y la unicidad de la identificación, tanto en el registro directo como en las solicitudes de registro.

## Requirements

### Requirement: Identification document
Registering a client SHALL require an identification made of a type (cédula or passport) and a number. A cédula number MUST contain only digits and be 6 to 10 digits long. A passport number MUST contain only letters and digits, be 6 to 12 characters long, and SHALL be stored in uppercase. Surrounding spaces SHALL be ignored. An invalid or missing identification SHALL be rejected with an invalid-identification error and nothing SHALL be stored.

#### Scenario: Valid cédula
- **WHEN** a client is registered with type cédula and number "1020304050"
- **THEN** the client is stored with that identification

#### Scenario: Cédula with letters
- **WHEN** a client is registered with type cédula and number "10A0304050"
- **THEN** the registration is rejected with an invalid-identification error

#### Scenario: Cédula length
- **WHEN** a client is registered with type cédula and a number of 5 digits or of 11 digits
- **THEN** the registration is rejected with an invalid-identification error

#### Scenario: Valid passport normalized
- **WHEN** a client is registered with type passport and number " ab123456 "
- **THEN** the client is stored with the passport number "AB123456"

#### Scenario: Passport with symbols
- **WHEN** a client is registered with type passport and number "AB-12345"
- **THEN** the registration is rejected with an invalid-identification error

#### Scenario: Unknown type or missing number
- **WHEN** a client is registered with an unknown identification type, or with an empty number
- **THEN** the registration is rejected with an invalid-identification error

### Requirement: Full name
Registering a client SHALL require a full name. The name MUST be 3 to 80 characters long after removing surrounding spaces, and MUST contain only letters (including accents and ñ), spaces, apostrophes, hyphens and periods. Repeated inner spaces SHALL be collapsed into one. An empty or invalid full name SHALL be rejected with a full-name error and nothing SHALL be stored.

#### Scenario: Valid full name
- **WHEN** a client is registered with the full name "  María  José Pérez-Núñez "
- **THEN** the client is stored with the full name "María José Pérez-Núñez"

#### Scenario: Empty full name
- **WHEN** a client is registered with an empty or blank full name
- **THEN** the registration is rejected with a full-name error

#### Scenario: Full name with digits
- **WHEN** a client is registered with the full name "Ana 2"
- **THEN** the registration is rejected with a full-name error

### Requirement: Mobile phone
Registering a client SHALL require a Colombian mobile phone number of 10 digits that starts with 3. Spaces SHALL be accepted and removed. A missing or invalid phone SHALL be rejected with an invalid-phone error and nothing SHALL be stored.

#### Scenario: Valid phone with spaces
- **WHEN** a client is registered with the phone "300 123 4567"
- **THEN** the client is stored with the phone "3001234567"

#### Scenario: Phone that does not start with 3
- **WHEN** a client is registered with the phone "6011234567"
- **THEN** the registration is rejected with an invalid-phone error

#### Scenario: Phone with wrong length or letters
- **WHEN** a client is registered with a phone of 9 digits, 11 digits, or containing letters
- **THEN** the registration is rejected with an invalid-phone error

### Requirement: Password confirmation
Registering a client SHALL require a password confirmation equal to the password. If they differ, or the confirmation is missing, the registration SHALL be rejected with a password-mismatch error and nothing SHALL be stored. The confirmation SHALL NOT be stored.

#### Scenario: Matching confirmation
- **WHEN** a client is registered with the password "clave123" and the confirmation "clave123"
- **THEN** the registration proceeds and only the password is stored

#### Scenario: Different confirmation
- **WHEN** a client is registered with the password "clave123" and the confirmation "clave124"
- **THEN** the registration is rejected with a password-mismatch error and nothing is stored

#### Scenario: Missing confirmation
- **WHEN** a client is registered without a password confirmation
- **THEN** the registration is rejected with a password-mismatch error

### Requirement: Unique identification
An identification (type and number) MUST NOT belong to more than one client or pending registration request. Registering a client or submitting a request with an identification already used by a client, or by a pending request, SHALL be rejected with an identification-already-registered error and existing data SHALL remain unchanged. A deleted client or a rejected request SHALL free its identification. The same number with a different identification type SHALL be considered a different identification.

#### Scenario: Identification of an existing client
- **WHEN** a registration uses the cédula "1020304050" and a client with that cédula exists
- **THEN** it is rejected with an identification-already-registered error

#### Scenario: Identification of a pending request
- **WHEN** a request is submitted with a cédula that already has a pending request
- **THEN** it is rejected with an identification-already-registered error and the first request is unchanged

#### Scenario: Identification freed
- **WHEN** the client with cédula "1020304050" is deleted and a new registration uses that cédula
- **THEN** the registration succeeds

#### Scenario: Same number, different type
- **WHEN** a passport registration uses the number "123456" and a client with the cédula "123456" exists
- **THEN** the registration is not rejected for identification

### Requirement: Clients without identity data keep working
Users stored before identity data existed (the default manager and older clients) SHALL keep loading, authenticating and operating, and SHALL be shown without identity data (no identification, full name or phone). The manager is never required to have identity data.

#### Scenario: Older client
- **WHEN** a client stored without identity data logs in
- **THEN** the login succeeds and the client operates normally

#### Scenario: Older client in the list
- **WHEN** the manager lists clients and one has no identity data
- **THEN** it appears with its user name and product, and the identity fields are shown as not available
