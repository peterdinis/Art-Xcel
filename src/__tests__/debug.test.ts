import { describe, it, expect } from "vitest";
import { evaluateFormula } from "../lib/formula-evaluator";

describe("debug", () => {
	it("should evaluate =MAX(A1:A2, B1)", () => {
		const mockData = {
			A1: { value: "10", formula: "" },
			A2: { value: "20", formula: "" },
			B1: { value: "5", formula: "" },
		};
		const result = evaluateFormula("=MAX(A1:A2, B1)", mockData as any);
		console.log("DEBUG RESULT:", result);
		expect(result).toBe("20");
	});
});
