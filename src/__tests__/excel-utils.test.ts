import { describe, it, expect } from "vitest";
import { colLetterToIndex, indexToColLetter, parseCellId, getRangeCells } from "../lib/excel-utils";

describe("excel-utils", () => {
    describe("colLetterToIndex", () => {
        it("should convert A to 0", () => {
            expect(colLetterToIndex("A")).toBe(0);
        });

        it("should convert Z to 25", () => {
            expect(colLetterToIndex("Z")).toBe(25);
        });

        it("should convert AA to 26", () => {
            expect(colLetterToIndex("AA")).toBe(26);
        });

        it("should convert AB to 27", () => {
            expect(colLetterToIndex("AB")).toBe(27);
        });
    });

    describe("indexToColLetter", () => {
        it("should convert 0 to A", () => {
            expect(indexToColLetter(0)).toBe("A");
        });

        it("should convert 25 to Z", () => {
            expect(indexToColLetter(25)).toBe("Z");
        });

        it("should convert 26 to AA", () => {
            expect(indexToColLetter(26)).toBe("AA");
        });

        it("should convert 27 to AB", () => {
            expect(indexToColLetter(27)).toBe("AB");
        });
    });

    describe("parseCellId", () => {
        it("should parse A1 correctly", () => {
            expect(parseCellId("A1")).toEqual({ col: 0, row: 0 });
        });

        it("should parse Z10 correctly", () => {
            expect(parseCellId("Z10")).toEqual({ col: 25, row: 9 });
        });

        it("should parse AA100 correctly", () => {
            expect(parseCellId("AA100")).toEqual({ col: 26, row: 99 });
        });
    });

    describe("getRangeCells", () => {
        it("should return single cell for non-range input", () => {
            expect(getRangeCells("A1")).toEqual(["A1"]);
        });

        it("should expand A1:A3 correctly", () => {
            expect(getRangeCells("A1:A3")).toEqual(["A1", "A2", "A3"]);
        });

        it("should expand A1:C1 correctly", () => {
            expect(getRangeCells("A1:C1")).toEqual(["A1", "B1", "C1"]);
        });

        it("should expand A1:B2 correctly", () => {
            expect(getRangeCells("A1:B2")).toEqual(["A1", "B1", "A2", "B2"]);
        });
    });
});
