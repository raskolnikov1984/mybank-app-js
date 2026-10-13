import { FullNameInvalidError } from "../errors/FullNameInvalidError.js";

const MIN_LENGTH = 3;
const MAX_LENGTH = 80;
const ALLOWED = /^\p{L}[\p{L} '.-]*$/u;

export class FullName {
    #value;

    constructor(value) {
        if (typeof value !== "string" || value.trim().length === 0)
            throw new FullNameInvalidError("El nombre completo es obligatorio");

        const clean = value.trim().replace(/\s+/g, " ");

        if (clean.length < MIN_LENGTH || clean.length > MAX_LENGTH || !ALLOWED.test(clean))
            throw new FullNameInvalidError(
                "El nombre completo debe tener entre 3 y 80 caracteres y solo letras, espacios, apóstrofos, guiones y puntos",
            );

        this.#value = clean;
    }

    getValue() {
        return this.#value;
    }
}
