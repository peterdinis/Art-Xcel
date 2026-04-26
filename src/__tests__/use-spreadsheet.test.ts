import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpreadsheet } from "../hooks/use-spreadsheet";

describe("useSpreadsheet hook", () => {
	it("should initialize with one sheet named Sheet1", () => {
		const { result } = renderHook(() => useSpreadsheet());
		expect(result.current.sheetNames).toEqual(["Sheet1"]);
		expect(result.current.currentSheetIndex).toBe(0);
	});

	it("should update a cell value", () => {
		const { result } = renderHook(() => useSpreadsheet());
		act(() => {
			result.current.updateCell("A1", "Hello");
		});
		expect(result.current.data["A1"].value).toBe("Hello");
	});

	it("should evaluate a formula", () => {
		const { result } = renderHook(() => useSpreadsheet());
		act(() => {
			result.current.updateCell("A1", "10");
			result.current.updateCell("A2", "20");
			result.current.updateCell("A3", "=A1+A2");
		});
		expect(result.current.data["A3"].value).toBe("30");
	});

	it("should handle adding and switching sheets", () => {
		const { result } = renderHook(() => useSpreadsheet());
		act(() => {
			result.current.addSheet("Sheet2");
		});
		expect(result.current.sheetNames).toEqual(["Sheet1", "Sheet2"]);

		act(() => {
			result.current.switchSheet(1);
		});
		expect(result.current.currentSheetIndex).toBe(1);
	});

	it("should handle deleting sheets", () => {
		const { result } = renderHook(() => useSpreadsheet());
		act(() => {
			result.current.addSheet("Sheet2");
		});
		act(() => {
			result.current.deleteSheet(0); // Delete Sheet1
		});
		expect(result.current.sheetNames).toEqual(["Sheet2"]);
		expect(result.current.currentSheetIndex).toBe(0);
	});

	it("should handle undo and redo", () => {
		const { result } = renderHook(() => useSpreadsheet());
		act(() => {
			result.current.updateCell("A1", "First");
		});
		act(() => {
			result.current.updateCell("A1", "Second");
		});
		expect(result.current.data["A1"].value).toBe("Second");

		act(() => {
			result.current.undo();
		});
		expect(result.current.data["A1"].value).toBe("First");

		act(() => {
			result.current.redo();
		});
		expect(result.current.data["A1"].value).toBe("Second");
	});

	it("should handle inserting rows", () => {
		const { result } = renderHook(() => useSpreadsheet());
		act(() => {
			result.current.updateCell("A1", "Value1");
			result.current.updateCell("A2", "Value2");
		});
		act(() => {
			result.current.insertRow(1); // Insert at index 1 (between 1 and 2)
		});
	});
});
