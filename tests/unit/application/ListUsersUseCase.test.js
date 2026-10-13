import { describe, expect, it, beforeEach } from "vitest";
import { ListUsersUseCase } from "../../../src/application/use-cases/ListUsersUseCase.js";
import { RegisterUserUseCase } from "../../../src/application/use-cases/RegisterUserUseCase.js";
import { CreateManagerUseCase } from "../../../src/application/use-cases/CreateManagerUseCase.js";
import { LoginUseCase } from "../../../src/application/use-cases/LoginUseCase.js";
import { MockUserRepository, MockAccountRepository } from "./mockRepositories.js";
import { withIdentity } from "./clientData.js";

describe("ListUsersUseCase", () => {
    let users;
    let accounts;
    let register;

    beforeEach(() => {
        users = new MockUserRepository();
        accounts = new MockAccountRepository();
        register = new RegisterUserUseCase(users, accounts);
    });

    it("Must be empty when there are no clients", () => {
        new CreateManagerUseCase(users, accounts).execute();

        expect(new ListUsersUseCase(users).execute().users).toEqual([]);
    });

    it("Must list clients with product type and position, without the manager", () => {
        new CreateManagerUseCase(users, accounts).execute();
        register.execute(withIdentity({ name: "sofi", password: "pw", initialBalance: 100000, accountType: "SAVINGS" }));
        register.execute(withIdentity({ name: "ana", password: "pw", accountType: "CREDIT_CARD" }));
        register.execute(withIdentity({ name: "luis", password: "pw", initialBalance: 1000000, accountType: "CHECKING" }));

        const list = new ListUsersUseCase(users).execute().users;

        expect(list.map((u) => u.name)).toEqual(["ana", "luis", "sofi"]);
        expect(list.map((u) => u.type)).toEqual(["CREDIT_CARD", "CHECKING", "SAVINGS"]);
        expect(list[0].typeName).toBe("Tarjeta de Credito");
        expect(list[0].summary).toContain("Deuda");
        expect(list[2].summary).toContain("Saldo");
        expect(list.some((u) => u.name === "gerente")).toBe(false);
    });

    it("Must flag a locked client", () => {
        register.execute(withIdentity({ name: "ana", password: "pw", initialBalance: 1000 }));
        const login = new LoginUseCase(users);
        for (let i = 0; i < 3; i++)
            expect(() => login.execute({ name: "ana", password: "bad" })).toThrow();

        expect(new ListUsersUseCase(users).execute().users[0].isLocked).toBe(true);
    });
});
