import { Money } from "../../../shared/value-objects/Money.js";
import { Account } from "../entities/Account.js";
import { CheckingAccount } from "../entities/CheckingAccount.js";
import { CreditCard } from "../entities/CreditCard.js";
import { SavingsAccount } from "../entities/SavingsAccount.js";
import { InvalidAccountTypeError } from "../errors/InvalidAccountTypeError.js";
import { AccountType } from "../value-objects/AccountType.js";

export class AccountFactory {
    static create(type, initialBalance) {
        switch (type) {
            case AccountType.SAVINGS:
                return new SavingsAccount(new Money(initialBalance));
            case AccountType.CHECKING:
                return new CheckingAccount(new Money(initialBalance));
            case AccountType.CREDIT_CARD:
                return new CreditCard();
            default:
                throw new InvalidAccountTypeError(
                    `The account type "${type}" is not supported`,
                );
        }
    }

    static restore(snapshot) {
        const currency = snapshot.currency;
        let account;

        switch (snapshot.type) {
            case AccountType.SAVINGS:
                account = new SavingsAccount(new Money(1, currency));
                break;
            case AccountType.CHECKING:
                account = new CheckingAccount(new Money(1, currency));
                break;
            case AccountType.CREDIT_CARD:
                account = new CreditCard(new Money(snapshot.limit, currency));
                break;
            default:
                throw new InvalidAccountTypeError(
                    `The account type "${snapshot.type}" is not supported`,
                );
        }

        return Account.restoreState(account, snapshot);
    }
}
