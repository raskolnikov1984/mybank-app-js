let sequence = 0;

// Valid, unique identity data for tests that register clients. Pass overrides to break a rule on purpose.
export function identity(overrides = {}) {
    sequence += 1;

    return {
        identificationType: "CEDULA",
        identificationNumber: String(1000000 + sequence),
        fullName: "Persona de Prueba",
        phone: "3001234567",
        ...overrides,
    };
}

// Completes a registration input with identity data and a matching confirmation.
export function withIdentity(input, overrides = {}) {
    return {
        ...identity(),
        confirmPassword: input.password,
        ...input,
        ...overrides,
    };
}
