import { describe, expect, it } from "vitest";
import { FakeStorage } from "./FakeStorage.js";
import { InMemoryRegistrationRequestRepository } from "../../../src/infraestructure/repositories/InMemoryRegistrationRequestRepository.js";
import { LocalStorageRegistrationRequestRepository } from "../../../src/infraestructure/repositories/LocalStorageRegistrationRequestRepository.js";
import { ClientProfile } from "../../../src/domain/aggregates/user/value-objects/ClientProfile.js";
import { Identification } from "../../../src/domain/aggregates/user/value-objects/Identification.js";
import { RegistrationRequest } from "../../../src/domain/aggregates/registration/entities/RegistrationRequest.js";

const profileFor = (name) =>
    new ClientProfile({
        fullName: `Persona ${name}`.replace(/\d/g, "x"),
        identificationType: "CEDULA",
        identificationNumber: String(100000 + [...name].reduce((n, c) => n + c.charCodeAt(0), 0)),
        phone: "3001234567",
    });

const request = (name, createdAt, extra = {}) =>
    new RegistrationRequest({
        name,
        password: "pw",
        accountType: "SAVINGS",
        initialBalance: 1000,
        profile: profileFor(name),
        createdAt,
        ...extra,
    });

const factories = {
    InMemory: () => new InMemoryRegistrationRequestRepository(),
    LocalStorage: () => new LocalStorageRegistrationRequestRepository(new FakeStorage()),
};

describe.each(Object.entries(factories))("%s registration request repository", (_, create) => {
    it("Must return null for an unknown request and an empty list", () => {
        const repository = create();

        expect(repository.findByName("ana")).toBeNull();
        expect(repository.findAll()).toEqual([]);
    });

    it("Must save and find a request by name", () => {
        const repository = create();
        repository.save(request("ana", new Date("2026-01-01")));

        expect(repository.findByName("ana").getName()).toBe("ana");
        expect(repository.findByName("ana").getInitialBalance()).toBe(1000);
    });

    it("Must list requests from the oldest to the newest", () => {
        const repository = create();
        repository.save(request("tarde", new Date("2026-03-01")));
        repository.save(request("temprano", new Date("2026-01-01")));
        repository.save(request("medio", new Date("2026-02-01")));

        expect(repository.findAll().map((r) => r.getName())).toEqual(["temprano", "medio", "tarde"]);
    });

    it("Must find a request by identification and free it when the request is deleted", () => {
        const repository = create();
        const ana = request("ana", new Date());
        repository.save(ana);
        const identification = ana.getProfile().getIdentification();

        expect(repository.findByIdentification(identification).getName()).toBe("ana");
        expect(repository.findByIdentification(new Identification("PASSPORT", identification.getNumber()))).toBeNull();
        repository.delete("ana");
        expect(repository.findByIdentification(identification)).toBeNull();
    });

    it("Must delete a request and not fail deleting an unknown one", () => {
        const repository = create();
        repository.save(request("ana", new Date()));

        repository.delete("ana");

        expect(repository.findByName("ana")).toBeNull();
        expect(() => repository.delete("nobody")).not.toThrow();
    });
});

describe("LocalStorageRegistrationRequestRepository persistence", () => {
    it("Must keep requests after reopening the storage and not bring back deleted ones", () => {
        const storage = new FakeStorage();
        const first = new LocalStorageRegistrationRequestRepository(storage);
        first.save(request("ana", new Date("2026-01-01"), { accountType: "CREDIT_CARD", initialBalance: undefined }));
        first.save(request("luis", new Date("2026-01-02")));
        first.delete("luis");

        const second = new LocalStorageRegistrationRequestRepository(storage);

        expect(second.findAll().map((r) => r.getName())).toEqual(["ana"]);
        expect(second.findByName("ana").getAccountType()).toBe("CREDIT_CARD");
        expect(second.findByName("ana").getInitialBalance()).toBeNull();
    });

    it("Must use its own storage key", () => {
        const storage = new FakeStorage();
        new LocalStorageRegistrationRequestRepository(storage).save(request("ana", new Date()));

        expect(storage.getItem("mi-plata:v1:registration-requests")).toContain("ana");
        expect(storage.getItem("mi-plata:v1:users")).toBeNull();
    });

    it("Must ignore corrupted content and invalid snapshots", () => {
        const storage = new FakeStorage();
        storage.setItem("mi-plata:v1:registration-requests", "{not json");
        expect(new LocalStorageRegistrationRequestRepository(storage).findAll()).toEqual([]);

        storage.setItem(
            "mi-plata:v1:registration-requests",
            JSON.stringify({ roto: { name: "", password: "x" }, ok: request("ok", new Date()).toSnapshot() }),
        );
        const repository = new LocalStorageRegistrationRequestRepository(storage);

        expect(repository.findAll().map((r) => r.getName())).toEqual(["ok"]);
        expect(repository.findByName("roto")).toBeNull();
    });
});
