import { UserRole } from "../../domain/aggregates/user/value-objects/UserRole.js";

// Accounts a client can send money to: every other client, never exposing their position.
export class ListTransferRecipientsUseCase {
    #userRepository;

    constructor(userRepository) {
        this.#userRepository = userRepository;
    }

    execute({ name } = {}) {
        const recipients = this.#userRepository
            .findAll()
            .filter((user) => user.getRole() === UserRole.CLIENTE && user.getName() !== name)
            .map((user) => {
                const profile = user.getProfile();
                const account = user.getAccount();

                return {
                    name: user.getName(),
                    fullName: profile ? profile.getFullName() : null,
                    type: account.accountType(),
                    typeName: account.typeName(),
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        return { recipients };
    }
}
