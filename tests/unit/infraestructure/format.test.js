import { describe, expect, it } from "vitest";
import { formatPesos, MOVEMENT_LABELS, parseAmount } from "../../../src/infraestructure/web/format.js";

describe("format helpers", () => {
    it("Must format an amount as Colombian pesos without decimals", () => {
        expect(formatPesos(1200000)).toContain("1.200.000");
        expect(formatPesos(50000)).toContain("50.000");
        expect(formatPesos(1500.4)).toContain("1.500");
    });

    it("Must label every movement type including transfers", () => {
        expect(MOVEMENT_LABELS.TRANSFER_OUT).toBe("Transferencia enviada");
        expect(MOVEMENT_LABELS.TRANSFER_IN).toBe("Transferencia recibida");
        expect(MOVEMENT_LABELS.INSTALLMENT_PURCHASE).toBe("Compra a cuotas");
        for (const type of ["DEPOSIT", "WITHDRAW", "INTEREST"])
            expect(MOVEMENT_LABELS[type]).toBeTruthy();
    });

    it("Must parse only positive finite amounts", () => {
        expect(parseAmount("100")).toBe(100);
        for (const value of ["", "0", "-5", "abc", undefined, "Infinity"])
            expect(parseAmount(value)).toBeNull();
    });
});
