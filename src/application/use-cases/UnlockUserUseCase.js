import { findManagedClient } from "./findManagedClient.js";

export class UnlockUserUseCase {
    #userRepository;

    constructor(userRepository) {
        this.#userRepository = userRepository;
    }

    execute({ name }) {
        const user = findManagedClient(this.#userRepository, name);

        user.unlock();
        this.#userRepository.save(user);

        return { name: user.getName() };
    }
}
