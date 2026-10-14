# Spec Delta

## ADDED Requirements

### Requirement: Credit card payments cannot exceed the debt
A credit card SHALL accept a payment (deposit, or the receiving side of a transfer) only when it is positive and does not exceed the debt it owes at that moment. A payment above the debt, including any payment when the debt is zero, SHALL be rejected with a payment-exceeds-debt error and SHALL leave the debt, the credit balance and the movements unchanged, so that no money is ever left unrecorded on the card.

#### Scenario: Payment above the debt
- **WHEN** a credit card with debt 300000 receives a deposit of 450000
- **THEN** the deposit is rejected with a payment-exceeds-debt error, the debt stays 300000 and no movement is recorded

#### Scenario: Payment equal to the debt
- **WHEN** a credit card with debt 300000 receives a deposit of 300000
- **THEN** the debt becomes 0 and the card holds no credit balance

#### Scenario: Payment without debt
- **WHEN** a credit card with debt 0 receives a deposit of 1000
- **THEN** the deposit is rejected with a payment-exceeds-debt error and nothing changes

#### Scenario: Partial payment still works
- **WHEN** a credit card with debt 300000 receives a deposit of 100000
- **THEN** the debt becomes 200000

### Requirement: Credit card withdrawal interest
A credit card SHALL, on every accepted withdrawal, charge an interest of 2% of the withdrawn amount (rounded to whole pesos), add both the amount and the interest to the debt, and record the interest as its own interest movement together with the withdrawal movement. The withdrawn amount plus its interest SHALL fit in the available credit; otherwise the withdrawal SHALL be rejected with a credit-limit-exceeded error leaving the debt and movements unchanged and charging no interest. The same applies when the money leaves the card as a transfer.

#### Scenario: Withdrawal records its interest
- **WHEN** a credit card with limit 2000000 and debt 0 withdraws 300000
- **THEN** the debt becomes 306000, the available credit becomes 1694000, and two movements are recorded in order: interest 6000 and withdraw 300000

#### Scenario: Amount plus interest above the available credit
- **WHEN** a credit card with limit 2000000 and debt 0 withdraws 1980000
- **THEN** the withdrawal is rejected with a credit-limit-exceeded error because 1980000 plus 39600 of interest exceeds 2000000, the debt stays 0 and no interest is recorded

#### Scenario: Amount plus interest exactly at the limit
- **WHEN** a credit card with limit 2000000 and debt 0 withdraws 1960784
- **THEN** the withdrawal is accepted with an interest of 39216 and the debt becomes 2000000

#### Scenario: Withdrawal then payment of everything owed
- **WHEN** a credit card withdraws 300000 and then receives a deposit of 306000
- **THEN** the debt becomes 0 and the deposit is accepted

## MODIFIED Requirements

### Requirement: Credit card limit
A credit card SHALL start with zero debt, SHALL allow withdrawals only while the withdrawn amount plus its withdrawal interest fits in the available credit, and SHALL treat deposits as payments that reduce the debt (see the rules on payments and on withdrawal interest). A credit card SHALL report its debt and available credit, and SHALL also report any credit balance it still holds.

#### Scenario: Purchase within limit
- **WHEN** a credit card with limit 2000000 and debt 0 withdraws 500000
- **THEN** the debt becomes 510000 (500000 plus 10000 of withdrawal interest) and available credit becomes 1490000

#### Scenario: Purchase above limit
- **WHEN** a credit card with limit 2000000 and debt 1900000 withdraws 200000
- **THEN** the operation is rejected with a credit limit exceeded error and the debt is unchanged

#### Scenario: Credit balance is not hidden
- **WHEN** a credit card holds a credit balance of 150000 left from before payments were limited to the debt
- **THEN** its description shows that credit balance next to the debt and the available credit

#### Scenario: Payment reduces debt
- **WHEN** a credit card with debt 500000 receives a deposit of 200000
- **THEN** the debt becomes 300000
