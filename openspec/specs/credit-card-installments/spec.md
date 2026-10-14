# credit-card-installments Specification

## Purpose

Permite financiar compras con la tarjeta de crédito a un número de cuotas elegido por el cliente, con una tasa de interés mensual que depende del plazo y mostrando en cada compra el valor de la cuota mensual resultante.

## Requirements

### Requirement: Installment purchase with the credit card
The system SHALL let a client whose product is a credit card make a purchase by providing a positive purchase amount and a number of installments that is a whole number from 1 to 36. The purchase SHALL be rejected, leaving debt and movements unchanged, when the amount is not positive, when the number of installments is not a whole number in that range, or when the client's product is not a credit card.

#### Scenario: Purchase accepted
- **WHEN** a credit card client with limit 2000000 and debt 0 buys 600000 in 3 installments
- **THEN** the purchase is accepted and a purchase movement is recorded

#### Scenario: Invalid installments
- **WHEN** a credit card client buys 100000 in 0, -1, 2.5 or 37 installments
- **THEN** the system rejects the purchase with an invalid-installments error and the debt is unchanged

#### Scenario: Invalid amount
- **WHEN** a credit card client buys 0 or a negative amount in 3 installments
- **THEN** the system rejects the purchase with an invalid-amount error and the debt is unchanged

#### Scenario: Product without installments
- **WHEN** a savings or checking client requests a purchase in installments
- **THEN** the system rejects it with an installments-not-supported error and the balance and movements are unchanged

#### Scenario: Unknown client
- **WHEN** an installment purchase is requested for a client that does not exist
- **THEN** the system rejects it with an account-not-found error

### Requirement: Monthly interest rate by term
The monthly interest rate applied to a purchase SHALL depend only on its number of installments: 0 % for 1 or 2 installments (no interest), 1.9 % monthly for 3 to 6 installments, and 2.3 % monthly for 7 or more installments.

#### Scenario: No interest up to two installments
- **WHEN** a purchase of 1000000 is made in 1 installment and another in 2 installments
- **THEN** both are financed at 0 % and their total to pay is 1000000

#### Scenario: Moderate interest from three to six installments
- **WHEN** a purchase is made in 3 installments and another in 6 installments
- **THEN** both are financed at 1.9 % monthly

#### Scenario: High interest from seven installments
- **WHEN** a purchase is made in 7 installments and another in 36 installments
- **THEN** both are financed at 2.3 % monthly

### Requirement: Monthly payment calculation
The monthly payment SHALL be `(capital × rate) / (1 − (1 + rate)^(−n))`, where capital is the purchase amount, rate is the monthly rate as a decimal and n is the number of installments, rounded to whole pesos. When the rate is 0 the monthly payment SHALL be the capital divided by n, rounded to whole pesos. The total to pay SHALL be the monthly payment times n, except at 0 % where it SHALL be exactly the capital. The financing interest SHALL be the total to pay minus the capital.

#### Scenario: Six installments
- **WHEN** a purchase of 1000000 is made in 6 installments
- **THEN** the monthly payment is 177924, the total to pay is 1067544 and the interest is 67544

#### Scenario: Twelve installments
- **WHEN** a purchase of 1000000 is made in 12 installments
- **THEN** the monthly payment is 96310, the total to pay is 1155720 and the interest is 155720

#### Scenario: Three installments
- **WHEN** a purchase of 600000 is made in 3 installments
- **THEN** the monthly payment is 207648 and the total to pay is 622944

#### Scenario: Without interest
- **WHEN** a purchase of 1000000 is made in 2 installments
- **THEN** the monthly payment is 500000, the total to pay is 1000000 and the interest is 0

#### Scenario: Without interest and not divisible
- **WHEN** a purchase of 100001 is made in 2 installments
- **THEN** the total to pay is exactly 100001 and the monthly payment is shown rounded to whole pesos

### Requirement: Debt and credit limit with installments
An installment purchase SHALL increase the card's debt by the total to pay (capital plus the interest of the whole term), and that total SHALL count against the available credit. The purchase SHALL be rejected with a credit-limit-exceeded error, leaving the debt unchanged, when the total to pay exceeds the available credit. Payments (deposits) SHALL keep reducing the debt as before.

#### Scenario: Debt includes the interest
- **WHEN** a credit card client with limit 2000000 and debt 0 buys 1000000 in 6 installments
- **THEN** the debt becomes 1067544 and the available credit becomes 932456

#### Scenario: Total above the available credit
- **WHEN** a credit card client with limit 2000000 and debt 0 buys 1900000 in 12 installments
- **THEN** the purchase is rejected with a credit-limit-exceeded error because the total to pay exceeds 2000000, and the debt stays 0

#### Scenario: Purchase that fits only without interest
- **WHEN** a credit card client with limit 2000000 and debt 0 buys 2000000 in 2 installments
- **THEN** the purchase is accepted and the debt becomes 2000000

#### Scenario: Payments reduce the debt
- **WHEN** a credit card client with debt 1067544 deposits 177924
- **THEN** the debt becomes 889620

### Requirement: Monthly payment shown on every transaction
The result of an installment purchase SHALL report the purchase amount, the number of installments, the monthly rate, the monthly payment, the total to pay and the interest, and the movement recorded for it SHALL keep the number of installments, the monthly payment and the total to pay so that every purchase in the history shows its resulting monthly payment. Withdrawals and deposits recorded on a credit card SHALL NOT carry installment data.

#### Scenario: Result of a purchase
- **WHEN** a credit card client buys 1000000 in 6 installments
- **THEN** the result reports amount 1000000, 6 installments, rate 1.9 %, monthly payment 177924, total 1067544 and interest 67544

#### Scenario: Movement history
- **WHEN** the movements of a credit card client who bought 1000000 in 6 installments are listed
- **THEN** the purchase movement shows 6 installments, a monthly payment of 177924 and a total to pay of 1067544

#### Scenario: Installment data survives persistence
- **WHEN** an installment purchase is made and the stored data is loaded again
- **THEN** the movement still shows its original installments, monthly payment, total to pay, amount and date

### Requirement: No separate monthly interest on the card
A credit card SHALL NOT accrue any additional monthly interest on its debt, because the interest of each purchase is already included in its installments.

#### Scenario: No second interest
- **WHEN** a credit card has debt from an installment purchase and any later period passes
- **THEN** the system charges no extra interest and the debt changes only by purchases and payments
