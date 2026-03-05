import { useState, useCallback } from "react";
import { all, create } from "mathjs";

export interface CellData {
	value: string;
	formula: string;
	style?: {
		bold?: boolean;
		italic?: boolean;
		underline?: boolean;
		align?: "left" | "center" | "right";
		color?: string;
		backgroundColor?: string;
		fontSize?: number;
		fontFamily?: string;
		borderTop?: string;
		borderBottom?: string;
		borderLeft?: string;
		borderRight?: string;
		numberFormat?:
			| "general"
			| "number"
			| "currency"
			| "percentage"
			| "date"
			| "time";
		verticalAlign?: "top" | "middle" | "bottom";
	};
	note?: string;
	validation?: {
		type: "number" | "text" | "list" | "date";
		min?: number;
		max?: number;
		list?: string[];
		required?: boolean;
	};
}

export type SheetData = Record<string, CellData>;

export interface SpreadsheetState {
	data: SheetData;
	selectedCell: string | null;
	selectionRange: string[] | null;
	clipboard: {
		data: SheetData;
		type: "copy" | "cut";
	} | null;
	undoStack: SheetData[];
	redoStack: SheetData[];
	sheetNames: string[];
	currentSheetIndex: number;
	formulas: Record<string, string>;
	namedRanges: Record<string, string>;
}

const math = create(all);

export interface ChartData {
	id: string;
	type: "bar" | "line" | "pie";
	range: string;
	title: string;
	position: { x: number; y: number };
	size: { width: number; height: number };
}

export interface ImageData {
	id: string;
	src: string;
	position: { x: number; y: number };
	size: { width: number; height: number };
}

export interface ShapeData {
	id: string;
	type: "rectangle" | "circle" | "line";
	position: { x: number; y: number };
	size: { width: number; height: number };
	style?: {
		fill?: string;
		stroke?: string;
		strokeWidth?: number;
	};
}

export interface IconData {
	id: string;
	iconName: string;
	position: { x: number; y: number };
	size: number;
	color?: string;
}

export interface Sheet {
	name: string;
	data: SheetData;
	charts: ChartData[];
	images: ImageData[];
	shapes: ShapeData[];
	icons: IconData[];
	selectedCell: string | null;
	selectionRange: string[] | null;
	namedRanges: Record<string, string>;
	hiddenRows: Set<number>;
}

export const useSpreadsheet = (initialData: SheetData = {}) => {
	const [sheets, setSheets] = useState<Sheet[]>([
		{
			name: "Sheet1",
			data: initialData,
			charts: [],
			images: [],
			shapes: [],
			icons: [],
			selectedCell: "A1",
			selectionRange: null,
			namedRanges: {},
			hiddenRows: new Set(),
		},
	]);
	const [currentSheetIndex, setCurrentSheetIndex] = useState(0);

	const [clipboard, setClipboard] = useState<{
		data: SheetData;
		type: "copy" | "cut";
	} | null>(null);
	const [undoStack, setUndoStack] = useState<SheetData[]>([]);
	const [redoStack, setRedoStack] = useState<SheetData[]>([]);
	const [formulaCells, setFormulaCells] = useState<Set<string>>(new Set());
	const [formulaCache, setFormulaCache] = useState<Record<string, string>>({});

	// Derived state for the current sheet
	const currentSheet = sheets[currentSheetIndex];
	const data = currentSheet.data;
	const selectedCell = currentSheet.selectedCell;
	const selectionRange = currentSheet.selectionRange;
	const charts = currentSheet.charts;
	const images = currentSheet.images;
	const shapes = currentSheet.shapes;
	const icons = currentSheet.icons;
	const namedRanges = currentSheet.namedRanges;
	const hiddenRows = currentSheet.hiddenRows;
	const sheetNames = sheets.map((s) => s.name);

	// Helper to update current sheet properties
	const updateCurrentSheet = useCallback(
		(updates: Partial<Sheet>) => {
			setSheets((prev) =>
				prev.map((sheet, i) =>
					i === currentSheetIndex ? { ...sheet, ...updates } : sheet,
				),
			);
		},
		[currentSheetIndex],
	);

	// Setters that now update the sheets array
	const setData = useCallback(
		(newData: SheetData | ((prev: SheetData) => SheetData)) => {
			setSheets((prev) =>
				prev.map((sheet, i) =>
					i === currentSheetIndex
						? {
								...sheet,
								data:
									typeof newData === "function" ? newData(sheet.data) : newData,
							}
						: sheet,
				),
			);
		},
		[currentSheetIndex],
	);

	const setSelectedCell = useCallback(
		(cell: string | null) => updateCurrentSheet({ selectedCell: cell }),
		[updateCurrentSheet],
	);

	const setSelectionRange = useCallback(
		(range: string[] | null) => updateCurrentSheet({ selectionRange: range }),
		[updateCurrentSheet],
	);

	const setCharts = useCallback(
		(newCharts: ChartData[] | ((prev: ChartData[]) => ChartData[])) => {
			setSheets((prev) =>
				prev.map((sheet, i) =>
					i === currentSheetIndex
						? {
								...sheet,
								charts:
									typeof newCharts === "function"
										? newCharts(sheet.charts)
										: newCharts,
							}
						: sheet,
				),
			);
		},
		[currentSheetIndex],
	);

	const setImages = useCallback(
		(newImages: ImageData[] | ((prev: ImageData[]) => ImageData[])) => {
			setSheets((prev) =>
				prev.map((sheet, i) =>
					i === currentSheetIndex
						? {
								...sheet,
								images:
									typeof newImages === "function"
										? newImages(sheet.images)
										: newImages,
							}
						: sheet,
				),
			);
		},
		[currentSheetIndex],
	);

	const setShapes = useCallback(
		(newShapes: ShapeData[] | ((prev: ShapeData[]) => ShapeData[])) => {
			setSheets((prev) =>
				prev.map((sheet, i) =>
					i === currentSheetIndex
						? {
								...sheet,
								shapes:
									typeof newShapes === "function"
										? newShapes(sheet.shapes)
										: newShapes,
							}
						: sheet,
				),
			);
		},
		[currentSheetIndex],
	);

	const setIcons = useCallback(
		(newIcons: IconData[] | ((prev: IconData[]) => IconData[])) => {
			setSheets((prev) =>
				prev.map((sheet, i) =>
					i === currentSheetIndex
						? {
								...sheet,
								icons:
									typeof newIcons === "function"
										? newIcons(sheet.icons)
										: newIcons,
							}
						: sheet,
				),
			);
		},
		[currentSheetIndex],
	);

	const setNamedRanges = useCallback(
		(
			newNamedRanges:
				| Record<string, string>
				| ((prev: Record<string, string>) => Record<string, string>),
		) => {
			setSheets((prev) =>
				prev.map((sheet, i) =>
					i === currentSheetIndex
						? {
								...sheet,
								namedRanges:
									typeof newNamedRanges === "function"
										? newNamedRanges(sheet.namedRanges)
										: newNamedRanges,
							}
						: sheet,
				),
			);
		},
		[currentSheetIndex],
	);

	const setHiddenRows = useCallback(
		(newHiddenRows: Set<number> | ((prev: Set<number>) => Set<number>)) => {
			setSheets((prev) =>
				prev.map((sheet, i) =>
					i === currentSheetIndex
						? {
								...sheet,
								hiddenRows:
									typeof newHiddenRows === "function"
										? newHiddenRows(sheet.hiddenRows)
										: newHiddenRows,
							}
						: sheet,
				),
			);
		},
		[currentSheetIndex],
	);

	// Helper to get cell value as number (or 0)
	const getVal = useCallback((cellId: string, currentData: SheetData) => {
		const val = currentData[cellId]?.value;
		return val && !isNaN(Number(val)) ? Number(val) : 0;
	}, []);

	// Helper to expand ranges like A1:A5 to array of values
	const getRangeValues = useCallback(
		(range: string, currentData: SheetData) => {
			const [start, end] = range.split(":");
			const startCol = start.match(/[A-Z]+/)?.[0] || "";
			const startRow = parseInt(start.match(/[0-9]+/)?.[0] || "1");
			const endCol = end.match(/[A-Z]+/)?.[0] || "";
			const endRow = parseInt(end.match(/[0-9]+/)?.[0] || "1");

			const values: (number | string)[] = [];
			const startColIdx = startCol.charCodeAt(0);
			const endColIdx = endCol.charCodeAt(0);

			for (let c = startColIdx; c <= endColIdx; c++) {
				for (let r = startRow; r <= endRow; r++) {
					const cellId = `${String.fromCharCode(c)}${r}`;
					const val = currentData[cellId]?.value || "";
					values.push(!isNaN(Number(val)) && val !== "" ? Number(val) : val);
				}
			}
			return values;
		},
		[],
	);

	// Get range of cells as strings
	const getRange = useCallback((range: string): string[] => {
		const [start, end] = range.split(":");
		const startCol = start.match(/[A-Z]+/)?.[0] || "";
		const startRow = parseInt(start.match(/[0-9]+/)?.[0] || "1");
		const endCol = end.match(/[A-Z]+/)?.[0] || "";
		const endRow = parseInt(end.match(/[0-9]+/)?.[0] || "1");

		const cells: string[] = [];
		const startColIdx = startCol.charCodeAt(0);
		const endColIdx = endCol.charCodeAt(0);

		for (let c = startColIdx; c <= endColIdx; c++) {
			for (let r = startRow; r <= endRow; r++) {
				cells.push(`${String.fromCharCode(c)}${r}`);
			}
		}
		return cells;
	}, []);

	// Get range as 2D array of values
	const getRange2D = useCallback((range: string, currentData: SheetData) => {
		const [start, end] = range.split(":");
		const startCol = start.match(/[A-Z]+/)?.[0] || "";
		const startRow = parseInt(start.match(/[0-9]+/)?.[0] || "1");
		const endCol = end.match(/[A-Z]+/)?.[0] || "";
		const endRow = parseInt(end.match(/[0-9]+/)?.[0] || "1");

		const grid: unknown[][] = [];
		const startColIdx = startCol.charCodeAt(0);
		const endColIdx = endCol.charCodeAt(0);

		for (let r = startRow; r <= endRow; r++) {
			const row: unknown[] = [];
			for (let c = startColIdx; c <= endColIdx; c++) {
				const cellId = `${String.fromCharCode(c)}${r}`;
				const val = currentData[cellId]?.value || "";
				row.push(!isNaN(Number(val)) && val !== "" ? Number(val) : val);
			}
			grid.push(row);
		}
		return grid;
	}, []);

	// Format number based on format type
	const formatNumber = useCallback((value: unknown, format: string): string => {
		const num = Number(value);
		if (isNaN(num)) return String(value);

		switch (format) {
			case "currency":
				return new Intl.NumberFormat("sk-SK", {
					style: "currency",
					currency: "EUR",
				}).format(num);
			case "percentage":
				return new Intl.NumberFormat("sk-SK", {
					style: "percent",
					minimumFractionDigits: 2,
				}).format(num / 100);
			case "date":
				return new Date(num).toLocaleDateString("sk-SK");
			case "time":
				return new Date(num).toLocaleTimeString("sk-SK");
			case "number":
				return new Intl.NumberFormat("sk-SK").format(num);
			default:
				return String(value);
		}
	}, []);

	// Custom MathJS functions for Excel compatibility
	const registerCustomFunctions = useCallback(() => {
		try {
			// IF(condition, true_val, false_val)
			math.import({
				if: (condition: unknown, trueVal: unknown, falseVal: unknown) =>
					condition ? trueVal : falseVal,
				// SUMIF(range_array, criteria, [sum_range_array])
				sumif: (
					range: unknown[],
					criteria: unknown,
					sumRange?: unknown[],
				) => {
					const targetRange = (sumRange || range) as (number | string)[];
					let sum = 0;
					range.forEach((val, idx) => {
						if (val == criteria) {
							sum += Number(targetRange[idx]) || 0;
						}
					});
					return sum;
				},
				// COUNTIF(range_array, criteria)
				countif: (range: unknown[], criteria: unknown) => {
					return range.filter((val) => val == criteria).length;
				},
				// VLOOKUP(lookup_value, table_array, col_index, [exact_match])
				vlookup: (
					lookupValue: unknown,
					table: unknown[][],
					colIndex: number,
					exactMatch: boolean = true,
				) => {
					if (!Array.isArray(table) || table.length === 0) return "#N/A";
					for (const row of table) {
						if (!Array.isArray(row)) continue;
						const firstCell = row[0];
						let match = false;
						if (exactMatch) {
							match = firstCell == lookupValue;
						} else {
							match = String(firstCell)
								.toLowerCase()
								.includes(String(lookupValue).toLowerCase());
						}
						if (match) return row[colIndex - 1] ?? "#REF!";
					}
					return "#N/A";
				},
				// Text Functions
				len: (str: string) => String(str).length,
				upper: (str: string) => String(str).toUpperCase(),
				lower: (str: string) => String(str).toLowerCase(),
				concat: (...args: unknown[]) => args.join(""),
				left: (str: string, num: number) => String(str).substring(0, num),
				right: (str: string, num: number) => {
					const s = String(str);
					return s.substring(s.length - num);
				},
				// Date Functions
				today: () => new Date().toLocaleDateString(),
				now: () => new Date().toLocaleString(),
				year: (dateStr: string) => new Date(dateStr).getFullYear(),
				month: (dateStr: string) => new Date(dateStr).getMonth() + 1,
				day: (dateStr: string) => new Date(dateStr).getDate(),
				// Logical Functions
				and: (...args: boolean[]) => args.every(Boolean),
				or: (...args: boolean[]) => args.some(Boolean),
				not: (arg: boolean) => !arg,
				// Financial Functions (Simplified)
				pmt: (rate: number, nper: number, pv: number) => {
					const r = rate / 12;
					const pmt =
						(pv * r * Math.pow(1 + r, nper)) / (Math.pow(1 + r, nper) - 1);
					return isFinite(pmt) ? pmt : 0;
				},
				fv: (rate: number, nper: number, pmt: number, pv = 0) => {
					const r = rate;
					const fv =
						pv * Math.pow(1 + r, nper) +
						pmt * ((Math.pow(1 + r, nper) - 1) / r);
					return isFinite(fv) ? fv : 0;
				},
				pv: (rate: number, nper: number, pmt: number, fv = 0) => {
					const r = rate;
					const pv =
						(fv - pmt * ((Math.pow(1 + r, nper) - 1) / r)) /
						Math.pow(1 + r, nper);
					return isFinite(pv) ? pv : 0;
				},
				// Statistical Functions
				stdev: (...args: number[]) => {
					const nums = args.map(Number).filter((n) => !isNaN(n));
					if (nums.length === 0) return 0;
					const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
					const std = Math.sqrt(
						nums.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) /
							nums.length,
					);
					return isFinite(std) ? std : 0;
				},
				var: (...args: number[]) => {
					const nums = args.map(Number).filter((n) => !isNaN(n));
					if (nums.length === 0) return 0;
					const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
					const v =
						nums.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) /
						nums.length;
					return isFinite(v) ? v : 0;
				},
				median: (...args: number[]) => {
					const nums = args.map(Number).filter((n) => !isNaN(n));
					if (nums.length === 0) return 0;
					const sorted = [...nums].sort((a, b) => a - b);
					const mid = Math.floor(sorted.length / 2);
					return sorted.length % 2 !== 0
						? sorted[mid]
						: (sorted[mid - 1] + sorted[mid]) / 2;
				},
				// Information Functions
				isnumber: (val: unknown) => typeof val === "number" && !isNaN(val),
				istext: (val: unknown) => typeof val === "string",
				isblank: (val: unknown) =>
					val === undefined || val === null || val === "",
				// Lookup & Reference
				index: (arr: unknown[] | unknown[][], row: number, col?: number) => {
					const r = Math.max(0, Math.floor(Number(row)) - 1);
					if (Array.isArray(arr[0]) && Array.isArray(arr)) {
						const grid = arr as unknown[][];
						const rowArr = grid[r];
						if (!rowArr) return "#REF!";
						const c = col != null ? Math.max(0, Math.floor(Number(col)) - 1) : 0;
						return rowArr[c] ?? "#REF!";
					}
					const vec = arr as unknown[];
					return vec[r] ?? "#REF!";
				},
					match: (
						lookup: unknown,
						lookupArray: unknown[],
						matchType: number = 0,
					) => {
						if (matchType === 0) {
							const idx = lookupArray.findIndex((v) => v == lookup);
							return idx >= 0 ? idx + 1 : "#N/A";
						}
						const nums = lookupArray
							.map(Number)
							.filter((n) => !isNaN(n))
							.sort((a, b) => a - b);
						const l = Number(lookup);
						if (matchType === 1) {
							let i = nums.findIndex((n) => n > l);
							if (i < 0) i = nums.length;
							return i + 1; // 1-based position
						}
						let i = nums.findIndex((n) => n >= l);
						if (i < 0) i = nums.length;
						return i + 1;
					},
				// Conditional aggregation
				countifs: (...args: unknown[]) => {
					if (args.length < 2 || args.length % 2 !== 0) return 0;
					const range = args[0] as unknown[];
					const criteria = args[1];
					let count = 0;
					range.forEach((val, i) => {
						let match = val == criteria;
						for (let j = 2; j < args.length; j += 2) {
							const r = args[j] as unknown[];
							const c = args[j + 1];
							if (r[i] != c) match = false;
						}
						if (match) count++;
					});
					return count;
				},
				sumifs: (sumRange: unknown[], ...pairs: unknown[]) => {
					if (pairs.length < 2) return 0;
					let sum = 0;
					sumRange.forEach((_, i) => {
						let match = true;
						for (let j = 0; j < pairs.length; j += 2) {
							const r = pairs[j] as unknown[];
							const c = pairs[j + 1];
							if (r[i] != c) match = false;
						}
						if (match) sum += Number(sumRange[i]) || 0;
					});
					return sum;
				},
				averageif: (
					range: unknown[],
					criteria: unknown,
					averageRange?: unknown[],
				) => {
					const target = averageRange || range;
					const vals: number[] = [];
					range.forEach((val, i) => {
						if (val == criteria)
							vals.push(Number(target[i]) || 0);
					});
					if (vals.length === 0) return "#DIV/0!";
					return vals.reduce((a, b) => a + b, 0) / vals.length;
				},
				averageifs: (...args: unknown[]) => {
					if (args.length < 3) return "#DIV/0!";
					const averageRange = args[0] as unknown[];
					const pairs = args.slice(1);
					if (pairs.length % 2 !== 0) return "#DIV/0!";
					const vals: number[] = [];
					averageRange.forEach((_, i) => {
						let match = true;
						for (let j = 0; j < pairs.length; j += 2) {
							const r = pairs[j] as unknown[];
							const c = pairs[j + 1];
							if (r[i] != c) match = false;
						}
						if (match) vals.push(Number(averageRange[i]) || 0);
					});
					if (vals.length === 0) return "#DIV/0!";
					return vals.reduce((a, b) => a + b, 0) / vals.length;
				},
				// Multiple conditions
				ifs: (...args: unknown[]) => {
					for (let i = 0; i < args.length - 1; i += 2) {
						if (args[i]) return args[i + 1];
					}
					return args.length % 2 === 1 ? args[args.length - 1] : "#N/A";
				},
				switch: (expr: unknown, ...pairs: unknown[]) => {
					for (let i = 0; i < pairs.length - 1; i += 2) {
						if (pairs[i] == expr) return pairs[i + 1];
					}
					return pairs.length % 2 === 1 ? pairs[pairs.length - 1] : "#N/A";
				},
				// Text
				text: (value: unknown, format: string) => {
					const n = Number(value);
					if (!isNaN(n) && format.toLowerCase().includes("0")) {
						const dec = (format.match(/\.0+/)?.[0]?.length ?? 1) - 1;
						return n.toFixed(dec);
					}
					return String(value);
				},
				trim: (str: string) => String(str).trim(),
				mid: (str: string, start: number, numChars: number) => {
					const s = String(str);
					const startIdx = Math.max(0, Math.floor(Number(start)) - 1);
					return s.substring(startIdx, startIdx + Math.floor(Number(numChars)));
				},
				find: (findText: string, withinText: string, startNum: number = 1) => {
					const idx = String(withinText).indexOf(String(findText), Math.max(0, Math.floor(Number(startNum)) - 1));
					return idx < 0 ? "#VALUE!" : idx + 1;
				},
				substitute: (text: string, oldText: string, newText: string, instance?: number) => {
					let s = String(text);
					const o = String(oldText);
					const n = String(newText);
					if (instance != null) {
						let idx = 0;
						for (let i = 0; i < instance; i++) {
							const i2 = s.indexOf(o, idx);
							if (i2 < 0) return s;
							if (i === instance - 1) return s.substring(0, i2) + n + s.substring(i2 + o.length);
							idx = i2 + 1;
						}
						return s;
					}
					return s.split(o).join(n);
				},
				rept: (text: string, count: number) =>
					String(text).repeat(Math.max(0, Math.floor(Number(count)))),
				roundup: (num: number, digits: number) => {
					const d = Math.pow(10, Math.floor(Number(digits)));
					return Math.ceil(Number(num) * d) / d;
				},
				rounddown: (num: number, digits: number) => {
					const d = Math.pow(10, Math.floor(Number(digits)));
					return Math.floor(Number(num) * d) / d;
				},
				mround: (num: number, multiple: number) => {
					const m = Number(multiple);
					if (m === 0) return 0;
					return Math.round(Number(num) / m) * m;
				},
				int: (num: number) => Math.floor(Number(num)),
			}, { override: true });
		} catch (e) {
			console.warn("MathJS custom functions registration failed:", e);
		}
	}, []);

	// Formula evaluator using MathJS
	const evaluateFormula = useCallback(
		(
			formula: string,
			currentData: SheetData,
			targetCellId?: string,
		): string => {
			if (!formula.startsWith("=")) return formula;

			registerCustomFunctions();

			let expression = formula.substring(1);

			// Replace named ranges
			Object.entries(namedRanges).forEach(([name, range]) => {
				const rangeValues = getRangeValues(range, currentData);
				const regex = new RegExp(`\\b${name}\\b`, "gi");
				expression = expression.replace(regex, `[${rangeValues.join(",")}]`);
			});

			// 1. Pre-process Ranges: Replace A1:B2 with [val1, val2, ...] or [[val1, val2], ...]
			const rangeRegex = /\b([a-zA-Z]+[0-9]+:[a-zA-Z]+[0-9]+)\b/g;
			const needs2D = /vlookup|index\s*\(/i.test(expression);
			expression = expression.replace(rangeRegex, (match) => {
				if (needs2D) {
					const values2D = getRange2D(match.toUpperCase(), currentData);
					return JSON.stringify(values2D);
				}
				const values = getRangeValues(match.toUpperCase(), currentData);
				return `[${values.join(",")}]`;
			});

			// 2. Pre-process Cell References: Replace A1 with value
			const cellRegex = /\b([a-zA-Z]+[0-9]+)\b/g;
			expression = expression.replace(cellRegex, (match) => {
				const val = getVal(match.toUpperCase(), currentData);
				return String(val);
			});

			// 3. Lowercase the rest
			expression = expression.toLowerCase();

			// 4. Map Excel functions to MathJS or custom (custom are registered above)
			const functionMap: Record<string, string> = {
				average: "mean",
				avg: "mean",
				sum: "sum",
				max: "max",
				min: "min",
				count: "count",
				round: "round",
				floor: "floor",
				ceil: "ceil",
				abs: "abs",
				sin: "sin",
				cos: "cos",
				tan: "tan",
				pi: "pi",
				power: "pow",
				sqrt: "sqrt",
				log: "log",
				exp: "exp",
				mod: "mod",
				concatenate: "concat",
			};

			Object.entries(functionMap).forEach(([excel, mathjs]) => {
				const regex = new RegExp(`\\b${excel}\\(`, "gi");
				expression = expression.replace(regex, `${mathjs}(`);
			});

			try {
				// Check cache
				if (formulaCache[expression]) {
					return formulaCache[expression];
				}

				const result = math.evaluate(expression);
				let finalResult: string;

				if (Array.isArray(result)) {
					finalResult = result.length > 0 ? String(result[0]) : "";
				} else {
					const cellId = targetCellId || selectedCell;
					if (cellId && currentData[cellId]?.style?.numberFormat) {
						finalResult = formatNumber(
							result,
							currentData[cellId].style.numberFormat,
						);
					} else {
						finalResult = String(result);
					}
				}

				// Update cache
				setFormulaCache((prev) => ({ ...prev, [expression]: finalResult }));

				return finalResult;
			} catch (e) {
				console.error(
					"Formula evaluation error:",
					e,
					"Expression:",
					expression,
				);
				return "#REF!";
			}
		},
		[
			formatNumber,
			getRange2D,
			getRangeValues,
			getVal,
			namedRanges,
			registerCustomFunctions,
			selectedCell,
			formulaCache,
		],
	);

	// Save state to undo stack
	const saveToUndo = useCallback(() => {
		// Since we treat data as immutable, we can just store the reference
		setUndoStack((prev) => [...prev, data]);
		setRedoStack([]);
	}, [data]);

	// Update cell with undo support
	const updateCell = useCallback(
		(cellId: string, input: string) => {
			saveToUndo();

			setData((prev) => {
				const newData = { ...prev };
				const evaluated = evaluateFormula(input, prev, cellId);

				newData[cellId] = {
					...(prev[cellId] || { value: "", formula: "" }),
					value: evaluated,
					formula: input,
				};

				// Track formula cells
				if (input.startsWith("=")) {
					setFormulaCells((prevSet) => {
						const next = new Set(prevSet);
						next.add(cellId);
						return next;
					});
				} else {
					setFormulaCells((prevSet) => {
						if (prevSet.has(cellId)) {
							const next = new Set(prevSet);
							next.delete(cellId);
							return next;
						}
						return prevSet;
					});
				}

				// Re-evaluate ONLY formula cells
				formulaCells.forEach((key) => {
					if (key !== cellId) {
						newData[key].value = evaluateFormula(
							newData[key].formula,
							newData,
							key,
						);
					}
				});

				return newData;
			});
		},
		[evaluateFormula, formulaCells, saveToUndo, setData],
	);

	// Update multiple cells
	const updateCells = useCallback(
		(updates: Record<string, string>) => {
			saveToUndo();

			setData((prev) => {
				const newData = { ...prev };

				Object.entries(updates).forEach(([cellId, input]) => {
					const evaluated = evaluateFormula(input, newData, cellId);
					newData[cellId] = {
						...(prev[cellId] || { value: "", formula: "" }),
						value: evaluated,
						formula: input,
					};
				});

				// Re-evaluate all formulas
				Object.keys(newData).forEach((key) => {
					if (newData[key].formula?.startsWith("=")) {
						newData[key].value = evaluateFormula(
							newData[key].formula,
							newData,
							key,
						);
					}
				});

				return newData;
			});
		},
		[evaluateFormula, saveToUndo, setData],
	);

	// Update cell style
	const updateCellStyle = useCallback(
		(cellId: string, style: Partial<NonNullable<CellData["style"]>>) => {
			saveToUndo();

			setData((prev) => ({
				...prev,
				[cellId]: {
					...(prev[cellId] || { value: "", formula: "" }),
					style: {
						...prev[cellId]?.style,
						...style,
					},
				},
			}));
		},
		[saveToUndo, setData],
	);

	// Copy cells
	const copyCells = useCallback(
		(cells: string[]) => {
			const copiedData: SheetData = {};
			cells.forEach((cellId) => {
				if (data[cellId]) {
					// Clone individual cell data to avoid references
					copiedData[cellId] = {
						...data[cellId],
						style: data[cellId].style ? { ...data[cellId].style } : undefined,
					};
				}
			});
			setClipboard({ data: copiedData, type: "copy" });
		},
		[data],
	);

	// Cut cells
	const cutCells = useCallback(
		(cells: string[]) => {
			const cutData: SheetData = {};
			cells.forEach((cellId) => {
				if (data[cellId]) {
					cutData[cellId] = JSON.parse(JSON.stringify(data[cellId]));
				}
			});
			setClipboard({ data: cutData, type: "cut" });
		},
		[data],
	);

	// Paste cells
	const pasteCells = useCallback(
		(targetCell: string) => {
			if (!clipboard) return;

			saveToUndo();

			setData((prev) => {
				const newData = { ...prev };

				// If cut, delete original cells
				if (clipboard.type === "cut") {
					Object.keys(clipboard.data).forEach((cellId) => {
						delete newData[cellId];
					});
				}

				// Parse target cell
				const targetCol = targetCell.match(/[A-Z]+/)?.[0] || "";
				const targetRow = parseInt(targetCell.match(/\d+/)?.[0] || "1");
				const targetColNum = targetCol.charCodeAt(0);

				// Paste at new location
				Object.entries(clipboard.data).forEach(([sourceId, cellData]) => {
					const sourceCol = sourceId.match(/[A-Z]+/)?.[0] || "";
					const sourceRow = parseInt(sourceId.match(/\d+/)?.[0] || "1");
					const sourceColNum = sourceCol.charCodeAt(0);

					const colOffset = sourceColNum - 65;
					const rowOffset = sourceRow - 1;

					const newCol = String.fromCharCode(targetColNum + colOffset);
					const newRow = targetRow + rowOffset;
					const newCellId = `${newCol}${newRow}`;

					newData[newCellId] = JSON.parse(JSON.stringify(cellData));
				});

				return newData;
			});

			if (clipboard.type === "cut") {
				setClipboard(null);
			}
		},
		[clipboard, saveToUndo, setData],
	);

	// Undo
	const undo = useCallback(() => {
		if (undoStack.length === 0) return;

		const previous = undoStack[undoStack.length - 1];
		setRedoStack((prev) => [...prev, data]);
		setData(previous);
		setUndoStack((prev) => prev.slice(0, -1));
	}, [undoStack, data, setData]);

	// Redo
	const redo = useCallback(() => {
		if (redoStack.length === 0) return;

		const next = redoStack[redoStack.length - 1];
		setUndoStack((prev) => [...prev, data]);
		setData(next);
		setRedoStack((prev) => prev.slice(0, -1));
	}, [redoStack, data, setData]);

	// Insert row
	const insertRow = useCallback(
		(rowIndex: number) => {
			saveToUndo();

			setData((prev) => {
				const newData: SheetData = {};

				// Shift all rows below
				Object.entries(prev).forEach(([cellId, cellData]) => {
					const col = cellId.match(/[A-Z]+/)?.[0] || "";
					const row = parseInt(cellId.match(/\d+/)?.[0] || "1");

					if (row >= rowIndex) {
						const newRow = row + 1;
						newData[`${col}${newRow}`] = cellData;
					} else {
						newData[cellId] = cellData;
					}
				});

				return newData;
			});
		},
		[saveToUndo, setData],
	);

	// Delete row
	const deleteRow = useCallback(
		(rowIndex: number) => {
			saveToUndo();

			setData((prev) => {
				const newData: SheetData = {};

				// Remove row and shift others up
				Object.entries(prev).forEach(([cellId, cellData]) => {
					const col = cellId.match(/[A-Z]+/)?.[0] || "";
					const row = parseInt(cellId.match(/\d+/)?.[0] || "1");

					if (row < rowIndex) {
						newData[cellId] = cellData;
					} else if (row > rowIndex) {
						const newRow = row - 1;
						newData[`${col}${newRow}`] = cellData;
					}
					// Skip the deleted row
				});

				return newData;
			});
		},
		[saveToUndo, setData],
	);

	// Insert column
	const insertColumn = useCallback(
		(colIndex: number) => {
			saveToUndo();

			setData((prev) => {
				const newData: SheetData = {};

				// Shift all columns to the right
				Object.entries(prev).forEach(([cellId, cellData]) => {
					const col = cellId.match(/[A-Z]+/)?.[0] || "";
					const row = parseInt(cellId.match(/\d+/)?.[0] || "1");
					const colNum = col.charCodeAt(0);

					if (colNum >= colIndex + 65) {
						const newCol = String.fromCharCode(colNum + 1);
						newData[`${newCol}${row}`] = cellData;
					} else {
						newData[cellId] = cellData;
					}
				});

				return newData;
			});
		},
		[saveToUndo, setData],
	);

	// Delete column
	const deleteColumn = useCallback(
		(colIndex: number) => {
			saveToUndo();

			setData((prev) => {
				const newData: SheetData = {};

				// Remove column and shift others left
				Object.entries(prev).forEach(([cellId, cellData]) => {
					const col = cellId.match(/[A-Z]+/)?.[0] || "";
					const row = parseInt(cellId.match(/\d+/)?.[0] || "1");
					const colNum = col.charCodeAt(0);

					if (colNum < colIndex + 65) {
						newData[cellId] = cellData;
					} else if (colNum > colIndex + 65) {
						const newCol = String.fromCharCode(colNum - 1);
						newData[`${newCol}${row}`] = cellData;
					}
					// Skip the deleted column
				});

				return newData;
			});
		},
		[saveToUndo, setData],
	);

	// Sort range
	const sortRange = useCallback(
		(range: string, column: number, ascending: boolean = true) => {
			saveToUndo();

			const cells = getRange(range);
			const rows = new Map<number, Map<number, CellData>>();

			// Organize by row
			cells.forEach((cellId) => {
				const col = cellId.match(/[A-Z]+/)?.[0] || "";
				const row = parseInt(cellId.match(/\d+/)?.[0] || "1");
				const colNum = col.charCodeAt(0);

				if (!rows.has(row)) {
					rows.set(row, new Map());
				}
				if (data[cellId]) {
					rows.get(row)!.set(colNum, data[cellId]);
				}
			});

			// Sort rows
			const sortedRows = Array.from(rows.entries()).sort((a, b) => {
				const valA = a[1].get(column + 65)?.value || "";
				const valB = b[1].get(column + 65)?.value || "";

				if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
					return ascending
						? Number(valA) - Number(valB)
						: Number(valB) - Number(valA);
				}

				return ascending
					? String(valA).localeCompare(String(valB))
					: String(valB).localeCompare(String(valA));
			});

			// Rebuild data
			setData((prev) => {
				const newData = { ...prev };
				const firstRow = Math.min(...Array.from(rows.keys()));

				sortedRows.forEach(([, rowData], index) => {
					const newRow = firstRow + index;
					rowData.forEach((cellData, colNum) => {
						const cellId = `${String.fromCharCode(colNum)}${newRow}`;
						newData[cellId] = cellData;
					});
				});

				return newData;
			});
		},
		[data, saveToUndo, getRange, setData],
	);

	// Filter range
	const filterRange = useCallback(
		(range: string, column: number, predicate: (value: string) => boolean) => {
			const cells = getRange(range);
			const rowsInRange = new Set<number>();
			const matches = new Set<number>();

			cells.forEach((cellId) => {
				const colIdx = cellId.match(/[A-Z]+/)?.[0].charCodeAt(0) || 0;
				const row = parseInt(cellId.match(/\d+/)?.[0] || "1");
				rowsInRange.add(row);

				if (
					colIdx === column + 65 &&
					data[cellId] &&
					predicate(data[cellId].value)
				) {
					matches.add(row);
				}
			});

			setHiddenRows((prev) => {
				const next = new Set(prev);
				rowsInRange.forEach((row) => {
					if (matches.has(row)) {
						next.delete(row);
					} else {
						next.add(row);
					}
				});
				return next;
			});

			return { visibleRows: matches };
		},
		[data, getRange, setHiddenRows],
	);

	// Add note to cell
	const addNote = useCallback((cellId: string, note: string) => {
		setData((prev) => ({
			...prev,
			[cellId]: {
				...(prev[cellId] || { value: "", formula: "" }),
				note,
			},
		}));
	}, [setData]);

	// Add data validation
	const addValidation = useCallback(
		(cellId: string, validation: NonNullable<CellData["validation"]>) => {
			setData((prev) => ({
				...prev,
				[cellId]: {
					...(prev[cellId] || { value: "", formula: "" }),
					validation,
				},
			}));
		},
		[setData],
	);

	// Validate cell value
	const validateCell = useCallback(
		(cellId: string, value: string): boolean => {
			const cell = data[cellId];
			if (!cell?.validation) return true;

			const { type, min, max, list, required } = cell.validation;

			if (required && !value) return false;

			switch (type) {
				case "number":
					const num = Number(value);
					if (isNaN(num)) return false;
					if (min !== undefined && num < min) return false;
					if (max !== undefined && num > max) return false;
					break;
				case "list":
					if (list && !list.includes(value)) return false;
					break;
				case "date":
					if (isNaN(Date.parse(value))) return false;
					break;
			}

			return true;
		},
		[data],
	);

	// Create named range
	const createNamedRange = useCallback((name: string, range: string) => {
		setNamedRanges((prev) => ({ ...prev, [name]: range }));
	}, [setNamedRanges]);

	// Delete named range
	const deleteNamedRange = useCallback((name: string) => {
		setNamedRanges((prev) => {
			const { [name]: _, ...rest } = prev;
			return rest;
		});
	}, [setNamedRanges]);

	// Remove duplicates from a range based on a column
	const removeDuplicates = useCallback(
		(range: string, column: number) => {
			saveToUndo();
			const cells = getRange(range);
			const rowsInRange = Array.from(
				new Set(cells.map((c) => parseInt(c.match(/\d+/)?.[0] || "1"))),
			).sort((a, b) => a - b);

			const seen = new Set();
			const rowsToDelete: number[] = [];

			rowsInRange.forEach((row) => {
				const colIdx = column + 65;
				const cellId = `${String.fromCharCode(colIdx)}${row}`;
				const val = data[cellId]?.value || "";
				if (seen.has(val)) {
					rowsToDelete.push(row);
				} else {
					seen.add(val);
				}
			});

			setData((prev) => {
				const newData = { ...prev };
				rowsToDelete.forEach((row) => {
					cells.forEach((cellId) => {
						if (parseInt(cellId.match(/\d+/)?.[0] || "0") === row) {
							delete newData[cellId];
						}
					});
				});
				return newData;
			});
		},
		[data, getRange, saveToUndo, setData],
	);

	// Text to columns (split by delimiter)
	const textToColumns = useCallback(
		(range: string, delimiter: string) => {
			saveToUndo();
			const cells = getRange(range);

			setData((prev) => {
				const newData = { ...prev };
				cells.forEach((cellId) => {
					const val = prev[cellId]?.value || "";
					if (val.includes(delimiter)) {
						const parts = val.split(delimiter);
						const colMatch = cellId.match(/[A-Z]+/)?.[0] || "";
						const row = cellId.match(/\d+/)?.[0] || "";
						const startColNum = colMatch.charCodeAt(0);

						parts.forEach((part, i) => {
							const newCol = String.fromCharCode(startColNum + i);
							const newCellId = `${newCol}${row}`;
							newData[newCellId] = {
								...(newData[newCellId] || { formula: "" }),
								value: part.trim(),
							};
						});
					}
				});
				return newData;
			});
		},
		[getRange, saveToUndo, setData],
	);

	// Find and replace
	const findAndReplace = useCallback(
		(
			find: string,
			replace: string,
			options?: { matchCase?: boolean; wholeCell?: boolean },
		) => {
			saveToUndo();

			setData((prev) => {
				const newData = { ...prev };

				Object.entries(newData).forEach(([cellId, cellData]) => {
					if (cellData.value) {
						let newValue = cellData.value;

						if (options?.wholeCell) {
							if (options?.matchCase) {
								if (cellData.value === find) {
									newValue = replace;
								}
							} else {
								if (cellData.value.toLowerCase() === find.toLowerCase()) {
									newValue = replace;
								}
							}
						} else {
							if (options?.matchCase) {
								newValue = cellData.value.replace(
									new RegExp(find, "g"),
									replace,
								);
							} else {
								newValue = cellData.value.replace(
									new RegExp(find, "gi"),
									replace,
								);
							}
						}

						if (newValue !== cellData.value) {
							newData[cellId] = {
								...cellData,
								value: newValue,
							};
						}
					}
				});

				return newData;
			});
		},
		[saveToUndo, setData],
	);

	// Clear sheet
	const clearSheet = useCallback(() => {
		saveToUndo();
		setData({});
		setSelectedCell("A1");
		setSelectionRange(null);
	}, [saveToUndo, setData, setSelectedCell, setSelectionRange]);

	// Add new sheet
	const addSheet = useCallback((name: string) => {
		setSheets((prev) => [
			...prev,
			{
				name,
				data: {},
				charts: [],
				images: [],
				shapes: [],
				icons: [],
				selectedCell: "A1",
				selectionRange: null,
				namedRanges: {},
				hiddenRows: new Set(),
			},
		]);
	}, []);

	// Delete sheet
	const deleteSheet = useCallback((index: number) => {
		setSheets((prev) => prev.filter((_, i) => i !== index));
	}, []);

	// Rename sheet
	const renameSheet = useCallback((index: number, newName: string) => {
		setSheets((prev) =>
			prev.map((sheet, i) =>
				i === index ? { ...sheet, name: newName } : sheet,
			),
		);
	}, []);

	// Switch sheet
	const switchSheet = useCallback((index: number) => {
		setCurrentSheetIndex(index);
	}, []);

	// Chart operations
	const addChart = useCallback((chart: Omit<ChartData, "id">) => {
		const newChart = { ...chart, id: `chart-${Date.now()}` };
		setCharts((prev) => [...prev, newChart]);
	}, [setCharts]);

	const removeChart = useCallback((id: string) => {
		setCharts((prev) => prev.filter((c) => c.id !== id));
	}, [setCharts]);

	const updateChart = useCallback((id: string, updates: Partial<ChartData>) => {
		setCharts((prev) =>
			prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
		);
	}, [setCharts]);

	// Image operations
	const addImage = useCallback((image: Omit<ImageData, "id">) => {
		const newImage = { ...image, id: `image-${Date.now()}` };
		setImages((prev) => [...prev, newImage]);
	}, [setImages]);

	const removeImage = useCallback((id: string) => {
		setImages((prev) => prev.filter((i) => i.id !== id));
	}, [setImages]);

	const updateImage = useCallback((id: string, updates: Partial<ImageData>) => {
		setImages((prev) =>
			prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
		);
	}, [setImages]);

	// Shape operations
	const addShape = useCallback((shape: Omit<ShapeData, "id">) => {
		const newShape = { ...shape, id: `shape-${Date.now()}` };
		setShapes((prev) => [...prev, newShape]);
	}, [setShapes]);

	const removeShape = useCallback((id: string) => {
		setShapes((prev) => prev.filter((s) => s.id !== id));
	}, [setShapes]);

	const updateShape = useCallback((id: string, updates: Partial<ShapeData>) => {
		setShapes((prev) =>
			prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
		);
	}, [setShapes]);

	// Icon operations
	const addIcon = useCallback((icon: Omit<IconData, "id">) => {
		const newIcon = { ...icon, id: `icon-${Date.now()}` };
		setIcons((prev) => [...prev, newIcon]);
	}, [setIcons]);

	const removeIcon = useCallback((id: string) => {
		setIcons((prev) => prev.filter((i) => i.id !== id));
	}, [setIcons]);

	const updateIcon = useCallback((id: string, updates: Partial<IconData>) => {
		setIcons((prev) =>
			prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
		);
	}, [setIcons]);

	// Get cell formula
	const getCellFormula = useCallback(
		(cellId: string) => {
			return data[cellId]?.formula || "";
		},
		[data],
	);

	// Get cell value
	const getCellValue = useCallback(
		(cellId: string) => {
			return data[cellId]?.value || "";
		},
		[data],
	);

	// Select cell
	const selectCell = useCallback((cellId: string) => {
		setSelectedCell(cellId);
	}, [setSelectedCell]);

	// Select range
	const selectRange = useCallback((range: string) => {
		const cells = getRange(range);
		setSelectionRange(cells);
		if (cells.length > 0) {
			setSelectedCell(cells[0]);
		}
	}, [getRange, setSelectionRange, setSelectedCell]);

	// Update sheet name (placeholder - actual name is in EditorPage)
	const updateSheetName = useCallback((name: string) => {
		console.log("Sheet name updated:", name);
	}, []);

	return {
		// Core data
		data,
		selectedCell,
		selectionRange,
		sheetNames,
		currentSheetIndex,
		namedRanges,
		hiddenRows,

		// Cell operations
		updateCell,
		updateCells,
		updateCellStyle,
		getCellValue,
		getCellFormula,
		selectCell,
		selectRange,

		// Row/Column operations
		insertRow,
		deleteRow,
		insertColumn,
		deleteColumn,

		// Clipboard
		copyCells,
		cutCells,
		pasteCells,

		// Undo/Redo
		undo,
		redo,
		undoStack,
		redoStack,

		// Data operations
		sortRange,
		filterRange,
		findAndReplace,
		removeDuplicates,
		textToColumns,

		// Cell features
		addNote,
		addValidation,
		validateCell,

		// Named ranges
		createNamedRange,
		deleteNamedRange,

		// Sheet management
		addSheet,
		deleteSheet,
		renameSheet,
		switchSheet,

		// Charts and Images
		charts,
		images,
		addChart,
		removeChart,
		updateChart,
		addImage,
		removeImage,
		updateImage,
		shapes,
		icons,
		addShape,
		removeShape,
		updateShape,
		addIcon,
		removeIcon,
		updateIcon,

		// Utilities
		clearSheet,
		setData,
		updateSheetName,
	};
};