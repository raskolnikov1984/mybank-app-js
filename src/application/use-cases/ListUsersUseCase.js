import { UserRole } from "../../domain/aggregates/user/value-objects/UserRole.js";

export class ListUsersUseCase {
    #userRepository;

    constructor(userRepository) {
        this.#userRepository = userRepository;
    }

    execute() {
        const users = this.#userRepository
            .findAll()
            .filter((user) => user.getRole() === UserRole.CLIENTE)
            .map((user) => {
                const account = user.getAccount();
                const profile = user.getProfile();

                return {
                    name: user.getName(),
                    fullName: profile ? profile.getFullName() : null,
                    identificationType: profile ? profile.getIdentification().getType() : null,
                    identification: profile ? profile.getIdentification().getNumber() : null,
                    phone: profile ? profile.getPhone() : null,
                    type: account.accountType(),
                    typeName: account.typeName(),
                    isLocked: user.isLocked(),
                    summary: account.describe(),
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        return { users };
    }
}
