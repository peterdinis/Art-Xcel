import { describe, it, expect } from "vitest";
import { getRowSelection } from "@/lib/grid-selection";

describe("getRowSelection", () => {
	it("selects a single full row (A..lastCol)", () => {
		// totalCols = 52 => last index 51 => AZ
		const { anchorCell, range } = getRowSelection(1, 52);
		expect(anchorCell).toBe("A1");
		expect(range).toBe("A1:AZ1");
	});

	it("extends selection from anchor cell row when provided", () => {
		const { anchorCell, range } = getRowSelection(4, 52, { extendFromCell: "B2" });
		expect(anchorCell).toBe("A2");
		expect(range).toBe("A2:AZ4");
	});
});

