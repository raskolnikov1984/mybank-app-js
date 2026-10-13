import { InvalidIdentificationError } from "../errors/InvalidIdentificationError.js";
import { IdentificationType } from "./IdentificationType.js";

const CEDULA_PATTERN = /^\d{6,10}$/;
const PASSPORT_PATTERN = /^[A-Za-z0-9]{6,12}$/;

export class Identification {
    #type;
    #number;

    constructor(type, number) {
        if (!Object.values(IdentificationType).includes(type))
            throw new InvalidIdentificationError("El tipo de identificación no es válido");

        if (typeof number !== "string" || number.trim().length === 0)
            throw new InvalidIdentificationError("El número de identificación es obligatorio");

        const clean = number.trim();

        if (type === IdentificationType.CEDULA) {
            if (!CEDULA_PATTERN.test(clean))
                throw new InvalidIdentificationError("La cédula debe tener entre 6 y 10 dígitos");
            this.#number = clean;
        } else {
            if (!PASSPORT_PATTERN.test(clean))
                throw new InvalidIdentificationError("El pasaporte debe tener entre 6 y 12 letras o números");
            this.#number = clean.toUpperCase();
        }

        this.#type = type;
    }

    getType() {
        return this.#type;
    }

    getNumber() {
        return this.#number;
    }

    // Same number with a different type is a different identification.
    key() {
        return `${this.#type}:${this.#number}`;
    }

    equals(other) {
        return other instanceof Identification && this.key() === other.key();
    }
}
