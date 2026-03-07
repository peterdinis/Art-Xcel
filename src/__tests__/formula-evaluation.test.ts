import { describe, it, expect } from "vitest";
import { evaluateFormula, SheetData } from "../lib/formula-evaluator";

describe("formula-evaluator", () => {
    const mockData: SheetData = {
        "A1": { value: "10", formula: "" },
        "A2": { value: "20", formula: "" },
        "B1": { value: "5", formula: "" },
        "C1": { value: "Hello", formula: "" },
        "D1": { value: "100", formula: "", style: { numberFormat: "currency" } }
    };

    describe("Basic Arithmetic", () => {
        it("should evaluate =1+2 to 3", () => {
            expect(evaluateFormula("=1+2", {})).toBe("3");
        });

        it("should evaluate =10-5 to 5", () => {
            expect(evaluateFormula("=10-5", {})).toBe("5");
        });

        it("should evaluate =3*4 to 12", () => {
            expect(evaluateFormula("=3*4", {})).toBe("12");
        });

        it("should evaluate =20/4 to 5", () => {
            expect(evaluateFormula("=20/4", {})).toBe("5");
        });
    });

    describe("Cell References", () => {
        it("should evaluate =A1 to 10", () => {
            expect(evaluateFormula("=A1", mockData)).toBe("10");
        });

        it("should evaluate =A1+A2 to 30", () => {
            expect(evaluateFormula("=A1+A2", mockData)).toBe("30");
        });

        it("should evaluate =A1*B1 to 50", () => {
            expect(evaluateFormula("=A1*B1", mockData)).toBe("50");
        });
    });

    describe("Range Functions", () => {
        it("should evaluate =SUM(A1:A2) to 30", () => {
            expect(evaluateFormula("=SUM(A1:A2)", mockData)).toBe("30");
        });

        it("should evaluate =AVERAGE(A1:A2) to 15", () => {
            expect(evaluateFormula("=AVERAGE(A1:A2)", mockData)).toBe("15");
        });

        it("should evaluate =MAX(A1:A2, B1) to 20", () => {
            expect(evaluateFormula("=MAX(A1:A2, B1)", mockData)).toBe("20");
        });

        it("should evaluate =MIN(A1:A2, B1) to 5", () => {
            expect(evaluateFormula("=MIN(A1:A2, B1)", mockData)).toBe("5");
        });

        it("should evaluate =COUNT(A1:A2, B1) to 3", () => {
            expect(evaluateFormula("=COUNT(A1:A2, B1)", mockData)).toBe("3");
        });

        it("should evaluate =MEDIAN(10, 20, 5) to 10", () => {
            expect(evaluateFormula("=MEDIAN(10, 20, 5)", mockData)).toBe("10");
        });

        it("should evaluate =ROUND(1.56, 1) to 1.6", () => {
            expect(evaluateFormula("=ROUND(1.56, 1)", mockData)).toBe("1.6");
        });
    });

    describe("Custom Functions", () => {
        it("should evaluate =IF(A1>5, \"Yes\", \"No\") to Yes", () => {
            expect(evaluateFormula("=IF(A1>5, \"Yes\", \"No\")", mockData)).toBe("Yes");
        });

        it("should evaluate =LEN(C1) to 5", () => {
            expect(evaluateFormula("=LEN(C1)", mockData)).toBe("5");
        });

        it("should evaluate =CONCAT(\"Foo\", \"Bar\") to FooBar", () => {
            expect(evaluateFormula("=CONCAT(\"Foo\", \"Bar\")", mockData)).toBe("FooBar");
        });

        it("should evaluate =UPPER(C1) to HELLO", () => {
            expect(evaluateFormula("=UPPER(C1)", mockData)).toBe("HELLO");
        });

        it("should evaluate =LEFT(C1, 2) to He", () => {
            expect(evaluateFormula("=LEFT(C1, 2)", mockData)).toBe("He");
        });

        it("should evaluate =RIGHT(C1, 2) to lo", () => {
            expect(evaluateFormula("=RIGHT(C1, 2)", mockData)).toBe("lo");
        });

        it("should evaluate =AND(1, 1) to true", () => {
            expect(evaluateFormula("=AND(1, 1)", mockData)).toBe("true");
        });

        it("should evaluate =OR(1, 0) to true", () => {
            expect(evaluateFormula("=OR(1, 0)", mockData)).toBe("true");
        });

        it("should evaluate =ISNUMBER(10) to true", () => {
            expect(evaluateFormula("=ISNUMBER(10)", mockData)).toBe("true");
        });

        it("should evaluate =ISTEXT(C1) to true", () => {
            expect(evaluateFormula("=ISTEXT(C1)", mockData)).toBe("true");
        });

        it("should evaluate =TODAY()", () => {
            // Just verify it doesn't throw and returns a string
            const res = evaluateFormula("=TODAY()", mockData);
            expect(typeof res).toBe("string");
            expect(res.length).toBeGreaterThan(0);
        });

        it("should evaluate =PMT(0.05, 12, 1000) correctly", () => {
            const res = evaluateFormula("=PMT(0.05, 12, 1000)", mockData);
            expect(Number(res)).toBeCloseTo(85.61, 2);
        });

        it("should evaluate =SUMIF(A1:A2, 10) to 10", () => {
            expect(evaluateFormula("=SUMIF(A1:A2, 10)", mockData)).toBe("10");
        });

        it("should evaluate =COUNTIF(A1:A2, 20) to 1", () => {
            expect(evaluateFormula("=COUNTIF(A1:A2, 20)", mockData)).toBe("1");
        });
    });

    describe("Error Handling", () => {
        it("should return #REF! for invalid formulas", () => {
            expect(evaluateFormula("=INVALID_FUNC()", {})).toBe("#REF!");
        });

        it("should return #REF! for division by zero (or infinity depending on mathjs)", () => {
            // mathjs returns Infinity for 1/0
            expect(evaluateFormula("=1/0", {})).toBe("Infinity");
        });
    });

    describe("Formatting", () => {
        it("should respect number format for target cell", () => {
            // Assuming targetCellId is D1 which has currency format
            const result = evaluateFormula("=2*50", mockData, { targetCellId: "D1" });
            // sk-SK currency format for 100 EUR usually is "100,00 €" or similar
            expect(result).toMatch(/100/);
            expect(result).toMatch(/€/);
        });
    });
});
