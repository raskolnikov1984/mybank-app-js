import { describe, expect, it } from "vitest";
import { InMemoryUserRepository } from "../../../src/infraestructure/repositories/InMemoryUserRepository.js";
import { InMemoryAccountRepository } from "../../../src/infraestructure/repositories/InMemoryAccountRepository.js";
import { User } from "../../../src/domain/aggregates/user/entities/User.js";
import { SavingsAccount } from "../../../src/domain/aggregates/account/entities/SavingsAccount.js";
import { ClientProfile } from "../../../src/domain/aggregates/user/value-objects/ClientProfile.js";
import { Identification } from "../../../src/domain/aggregates/user/value-objects/Identification.js";
import { Money } from "../../../src/domain/shared/value-objects/Money.js";

const newUser = (name) => new User(name, "pw", new SavingsAccount(new Money(1000)));

describe("InMemoryUserRepository", () => {
    it("Must list every saved user", () => {
        const repository = new InMemoryUserRepository();
        repository.save(newUser("ana"));
        repository.save(newUser("luis"));

        expect(repository.findAll().map((u) => u.getName()).sort()).toEqual(["ana", "luis"]);
    });

    it("Must list nothing when it is empty", () => {
        expect(new InMemoryUserRepository().findAll()).toEqual([]);
    });

    it("Must delete a user", () => {
        const repository = new InMemoryUserRepository();
        repository.save(newUser("ana"));

        repository.delete("ana");

        expect(repository.exists("ana")).toBe(false);
        expect(repository.findByName("ana")).toBeNull();
    });

    it("Must not fail when deleting an unknown user", () => {
        expect(() => new InMemoryUserRepository().delete("nobody")).not.toThrow();
    });
});

describe("InMemoryAccountRepository", () => {
    it("Must delete an account", () => {
        const repository = new InMemoryAccountRepository();
        repository.save("ana", new SavingsAccount(new Money(1000)));

        repository.delete("ana");

        expect(repository.findById("ana")).toBeNull();
    });

    it("Must not fail when deleting an unknown account", () => {
        expect(() => new InMemoryAccountRepository().delete("nobody")).not.toThrow();
    });
});

describe("InMemoryUserRepository identification lookup", () => {
    const withProfile = (name, type, number) =>
        new User(
            name,
            "pw",
            new SavingsAccount(new Money(1000)),
            "CLIENTE",
            new ClientProfile({ fullName: "Ana Pérez", identificationType: type, identificationNumber: number, phone: "3001234567" }),
        );

    it("Must find a stored identification and ignore others", () => {
        const repository = new InMemoryUserRepository();
        repository.save(withProfile("ana", "CEDULA", "1020304050"));

        expect(repository.existsByIdentification(new Identification("CEDULA", "1020304050"))).toBe(true);
        expect(repository.existsByIdentification(new Identification("CEDULA", "1020304051"))).toBe(false);
    });

    it("Must treat the same number with another type as different", () => {
        const repository = new InMemoryUserRepository();
        repository.save(withProfile("ana", "CEDULA", "123456"));

        expect(repository.existsByIdentification(new Identification("PASSPORT", "123456"))).toBe(false);
    });

    it("Must match passports regardless of the case typed", () => {
        const repository = new InMemoryUserRepository();
        repository.save(withProfile("ana", "PASSPORT", "ab123456"));

        expect(repository.existsByIdentification(new Identification("PASSPORT", "AB123456"))).toBe(true);
    });

    it("Must not match users without profile and must free it once the user is deleted", () => {
        const repository = new InMemoryUserRepository();
        repository.save(newUser("viejo"));
        repository.save(withProfile("ana", "CEDULA", "1020304050"));

        expect(repository.existsByIdentification(new Identification("CEDULA", "1020304050"))).toBe(true);
        repository.delete("ana");
        expect(repository.existsByIdentification(new Identification("CEDULA", "1020304050"))).toBe(false);
    });
});
