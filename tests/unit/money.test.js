import { describe, expect, it } from "vitest";

describe("Money", () => {
    it("Must be possible to create a valid Money amount", () => {
        let amount = new Money();
        expect(amount.value).toEqual(2000);
    });
});
