export class GetLoginStatusUseCase {
    #userRepository;

    constructor(userRepository) {
        this.#userRepository = userRepository;
    }

    // Read-only: never saves nor changes the user. Unknown names get no attempt data.
    execute({ name } = {}) {
        const user = typeof name === "string" && name.trim().length > 0 ? this.#userRepository.findByName(name) : null;

        if (!user)
            return { exists: false };

        return { exists: true, ...user.getLoginStatus() };
    }
}
