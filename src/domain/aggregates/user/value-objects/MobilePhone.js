import { InvalidPhoneError } from "../errors/InvalidPhoneError.js";

const COLOMBIAN_MOBILE = /^3\d{9}$/;

export class MobilePhone {
    #number;

    constructor(number) {
        if (typeof number !== "string")
            throw new InvalidPhoneError();

        const digits = number.replace(/\s+/g, "");

        if (!COLOMBIAN_MOBILE.test(digits))
            throw new InvalidPhoneError();

        this.#number = digits;
    }

    getNumber() {
        return this.#number;
    }
}
