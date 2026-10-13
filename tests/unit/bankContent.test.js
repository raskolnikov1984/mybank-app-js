import { describe, expect, it } from "vitest";
import { bank, products, socialLinks } from "../../app/content/bank.js";
import { AccountType } from "../../src/domain/aggregates/account/value-objects/AccountType.js";

const text = (product) => `${product.text} ${product.conditions.join(" ")}`;

describe("Public site content", () => {
    it("Must describe the three products", () => {
        expect(products.map((p) => p.id)).toEqual(["ahorros", "corriente", "tarjeta"]);
        expect(Object.keys(AccountType).length).toBe(products.length);
    });

    it("Must state the savings withdrawal interest as currently implemented", () => {
        expect(text(products[0])).toContain("1,5 %");
    });

    it("Must state the checking overdraft and its example as currently implemented", () => {
        const checking = text(products[1]);

        expect(checking).toContain("20 %");
        expect(checking).toContain("$1.000.000");
        expect(checking).toContain("$1.200.000");
        expect(checking.toLowerCase()).toContain("no genera intereses");
    });

    it("Must state the credit card limit and interest as currently implemented", () => {
        const card = text(products[2]);

        expect(card).toContain("$2.000.000");
        expect(card).toContain("2 %");
    });

    it("Must have corporate data for the footer", () => {
        for (const field of ["legalName", "taxId", "address", "phone", "email", "hours"])
            expect(bank.corporate[field].length).toBeGreaterThan(0);
    });

    it("Must have a mission and values for the about section", () => {
        expect(bank.about.mission.length).toBeGreaterThan(40);
        expect(bank.about.values.length).toBeGreaterThanOrEqual(3);
    });

    it("Must link the four social networks with https addresses", () => {
        expect(socialLinks.map((l) => l.name)).toEqual(["Facebook", "Instagram", "X", "LinkedIn"]);
        for (const link of socialLinks) expect(link.href.startsWith("https://")).toBe(true);
    });
});
