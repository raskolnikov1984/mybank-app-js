# Spec Delta

## MODIFIED Requirements

### Requirement: Product description by type
Every product SHALL expose a human-readable type name in Spanish and a summary of its current position (balance for savings; balance, overdraft in use and the overdraft limit available for checking; debt and available credit for credit card). Every product SHALL also tell whether it supports a monthly statement (none currently does).

#### Scenario: Describe each type
- **WHEN** the description of a savings account, a checking account and a credit card is requested
- **THEN** each returns a different type name and a summary specific to its type

#### Scenario: Monthly statement support by type
- **WHEN** a savings account, a checking account and a credit card are asked whether they support a monthly statement
- **THEN** all three answer no
