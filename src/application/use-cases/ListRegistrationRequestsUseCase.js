export class ListRegistrationRequestsUseCase {
    #requestRepository;

    constructor(requestRepository) {
        this.#requestRepository = requestRepository;
    }

    // Plain views for the manager. The password is never part of them.
    execute() {
        const requests = this.#requestRepository.findAll().map((request) => ({
            name: request.getName(),
            fullName: request.getProfile().getFullName(),
            identificationType: request.getProfile().getIdentification().getType(),
            identification: request.getProfile().getIdentification().getNumber(),
            phone: request.getProfile().getPhone(),
            accountType: request.getAccountType(),
            initialBalance: request.getInitialBalance(),
            createdAt: request.getCreatedAt(),
        }));

        return { requests };
    }
}
