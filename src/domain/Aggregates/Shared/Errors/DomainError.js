export class DomainError extends Error {
    constructor(message) {
        if (new.target === DomainError) {
            throw new TypeError(
                "You can't create an instance of an abstract class.",
            );
        }

        super(message);
        this.name = this.constructor.name;
    }

    errorCode() {
        throw new Error("NOT_IMPLEMENTED_ERROR");
    }

    throwError() {
        return this.errorCode();
    }
}
