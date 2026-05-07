import { describe, it, expect } from "vitest";
import { evaluateFormula, SheetData } from "../lib/formula-evaluator";

describe("formula-evaluator", () => {
	const mockData: SheetData = {
		A1: { value: "10", formula: "" },
		A2: { value: "20", formula: "" },
		B1: { value: "5", formula: "" },
		C1: { value: "Hello", formula: "" },
		D1: { value: "100", formula: "", style: { numberFormat: "currency" } },
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
	});

	describe("Custom Functions", () => {
		it('should evaluate =IF(A1>5, "Yes", "No") to Yes', () => {
			expect(evaluateFormula('=IF(A1>5, "Yes", "No")', mockData)).toBe("Yes");
		});

		it("should evaluate =LEN(C1) to 5", () => {
			expect(evaluateFormula("=LEN(C1)", mockData)).toBe("5");
		});

		it('should evaluate =CONCAT("Foo", "Bar") to FooBar', () => {
			expect(evaluateFormula('=CONCAT("Foo", "Bar")', mockData)).toBe("FooBar");
		});

		it("should evaluate =UPPER(C1) to HELLO", () => {
			expect(evaluateFormula("=UPPER(C1)", mockData)).toBe("HELLO");
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

	describe("Statistical Functions", () => {
		it("should evaluate =MEDIAN(1, 2, 3, 4, 5) to 3", () => {
			expect(evaluateFormula("=MEDIAN(1, 2, 3, 4, 5)", {})).toBe("3");
		});

		it("should evaluate =MEDIAN(1, 2, 3, 4) to 2.5", () => {
			expect(evaluateFormula("=MEDIAN(1, 2, 3, 4)", {})).toBe("2.5");
		});

		it("should evaluate =STDEV(10, 20, 30) to ~8.16", () => {
			const result = Number(evaluateFormula("=STDEV(10, 20, 30)", {}));
			expect(result).toBeGreaterThan(8.16);
			expect(result).toBeLessThan(8.17);
		});
	});

	describe("Financial Functions", () => {
		it("should evaluate PMT(0.05, 12, 1000) correctly", () => {
			const result = Number(evaluateFormula("=PMT(0.05, 12, 1000)", {}));
			expect(result).toBeGreaterThan(85.6);
			expect(result).toBeLessThan(85.7);
		});
	});

	describe("Date Functions", () => {
		it("should extract year, month, day from date string", () => {
			const data = { A1: { value: "2024-12-25", formula: "" } };
			expect(evaluateFormula("=YEAR(A1)", data)).toBe("2024");
			expect(evaluateFormula("=MONTH(A1)", data)).toBe("12");
			expect(evaluateFormula("=DAY(A1)", data)).toBe("25");
		});
	});

	describe("Logical & Info Functions", () => {
		it("should evaluate AND, OR, NOT", () => {
			expect(evaluateFormula("=AND(1>0, 2>1)", {})).toBe("true");
			expect(evaluateFormula("=OR(1>0, 0>1)", {})).toBe("true");
			expect(evaluateFormula("=NOT(1>0)", {})).toBe("false");
		});

		it("should evaluate ISNUMBER, ISTEXT, ISBLANK", () => {
			const data = {
				A1: { value: "100", formula: "" },
				A2: { value: "Hello", formula: "" },
				A3: { value: "", formula: "" },
			};
			expect(evaluateFormula("=ISNUMBER(A1)", data)).toBe("true");
			expect(evaluateFormula("=ISTEXT(A2)", data)).toBe("true");
			expect(evaluateFormula("=ISBLANK(A3)", data)).toBe("true");
		});
	});

	describe("VLOOKUP & Conditional Stats", () => {
		const tableData: SheetData = {
			A1: { value: "Apple", formula: "" },
			B1: { value: "10", formula: "" },
			A2: { value: "Banana", formula: "" },
			B2: { value: "20", formula: "" },
			A3: { value: "Apple", formula: "" },
			B3: { value: "30", formula: "" },
		};

		it("should evaluate VLOOKUP correctly", () => {
			expect(
				evaluateFormula('=VLOOKUP("Banana", A1:B2, 2, true)', tableData),
			).toBe("20");
			expect(
				evaluateFormula('=VLOOKUP("Cherry", A1:B2, 2, true)', tableData),
			).toBe("#N/A");
		});

		it("should evaluate SUMIF correctly", () => {
			expect(evaluateFormula('=SUMIF(A1:A3, "Apple", B1:B3)', tableData)).toBe(
				"40",
			);
		});

		it("should evaluate COUNTIF correctly", () => {
			expect(evaluateFormula('=COUNTIF(A1:A3, "Apple")', tableData)).toBe("2");
		});
	});

	describe("Formatting", () => {
		it("should respect number format for target cell", () => {
			// Assuming targetCellId is D1 which has currency format
			const result = evaluateFormula("=2*50", mockData, { targetCellId: "D1" });
			expect(result).toMatch(/100/);
			expect(result).toMatch(/€/);
		});
	});

	describe("MATCH & INDEX", () => {
		const data: SheetData = {
			A1: { value: "10", formula: "" },
			A2: { value: "20", formula: "" },
			A3: { value: "30", formula: "" },
			B1: { value: "X", formula: "" },
			B2: { value: "Y", formula: "" },
			B3: { value: "Z", formula: "" },
		};

		it("should evaluate MATCH correctly", () => {
			expect(evaluateFormula("=MATCH(20, A1:A3, 0)", data)).toBe("2");
			expect(evaluateFormula("=MATCH(10, A1:A3, 0)", data)).toBe("1");
			expect(evaluateFormula("=MATCH(30, A1:A3, 0)", data)).toBe("3");
			expect(evaluateFormula("=MATCH(40, A1:A3, 0)", data)).toBe("#N/A");
		});

		it("should evaluate INDEX correctly", () => {
			expect(evaluateFormula("=INDEX(A1:A3, 2)", data)).toBe("20");
			expect(evaluateFormula("=INDEX(B1:B3, 3)", data)).toBe("Z");
		});

		it("should evaluate INDEX with 2D array", () => {
			expect(evaluateFormula("=INDEX(A1:B3, 2, 2)", data)).toBe("Y");
			expect(evaluateFormula("=INDEX(A1:B3, 3, 1)", data)).toBe("30");
		});
	});

	describe("XLOOKUP", () => {
		const data: SheetData = {
			A1: { value: "ID01", formula: "" },
			A2: { value: "ID02", formula: "" },
			B1: { value: "Alice", formula: "" },
			B2: { value: "Bob", formula: "" },
		};

		it("should evaluate XLOOKUP correctly", () => {
			expect(evaluateFormula('=XLOOKUP("ID02", A1:A2, B1:B2)', data)).toBe("Bob");
			expect(evaluateFormula('=XLOOKUP("ID03", A1:A2, B1:B2, "Not Found")', data)).toBe("Not Found");
		});
	});

	describe("Text Functions", () => {
		it("should evaluate REPLACE", () => {
			expect(evaluateFormula('=REPLACE("Hello World", 7, 5, "Antigravity")', {})).toBe("Hello Antigravity");
		});

		it("should evaluate SEARCH and FIND", () => {
			expect(evaluateFormula('=SEARCH("world", "Hello World")', {})).toBe("7");
			expect(evaluateFormula('=FIND("World", "Hello World")', {})).toBe("7");
			expect(evaluateFormula('=FIND("world", "Hello World")', {})).toBe("#VALUE!");
		});
	});

	describe("Advanced Logical", () => {
		it("should evaluate IFNA", () => {
			expect(evaluateFormula('=IFNA("#N/A", "Fallback")', {})).toBe("Fallback");
			expect(evaluateFormula('=IFNA(100, "Fallback")', {})).toBe("100");
		});

		it("should evaluate IFS", () => {
			expect(evaluateFormula("=IFS(1>2, 10, 2>3, 20, 3>2, 30)", {})).toBe("30");
			expect(evaluateFormula("=IFS(1>2, 10, 2>3, 20)", {})).toBe("#N/A");
		});
	});
});
