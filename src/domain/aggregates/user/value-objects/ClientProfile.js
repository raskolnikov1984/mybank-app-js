import { FullName } from "./FullName.js";
import { Identification } from "./Identification.js";
import { MobilePhone } from "./MobilePhone.js";

// Identity data of a client. The manager and clients created before it existed have none.
export class ClientProfile {
    #fullName;
    #identification;
    #phone;

    constructor({ fullName, identificationType, identificationNumber, phone }) {
        this.#identification = new Identification(identificationType, identificationNumber);
        this.#fullName = new FullName(fullName);
        this.#phone = new MobilePhone(phone);
    }

    getFullName() {
        return this.#fullName.getValue();
    }

    getIdentification() {
        return this.#identification;
    }

    getPhone() {
        return this.#phone.getNumber();
    }

    toSnapshot() {
        return {
            fullName: this.getFullName(),
            identificationType: this.#identification.getType(),
            identificationNumber: this.#identification.getNumber(),
            phone: this.getPhone(),
        };
    }

    static restore(snapshot) {
        return new ClientProfile(snapshot);
    }
}
