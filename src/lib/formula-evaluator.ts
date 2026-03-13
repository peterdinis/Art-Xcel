import { all, create } from "mathjs";
import {
	parseCellId,
	getRangeCells,
	formatNumber,
	indexToColLetter,
} from "./excel-utils";

const math = create(all);

export type SheetData = Record<
	string,
	{
		value: string;
		formula: string;
		style?: {
			numberFormat?: string;
		};
	}
>;

let customFunctionsRegistered = false;

export const registerCustomFunctions = () => {
	if (customFunctionsRegistered) return;
	try {
		math.import(
			{
				if: (condition: unknown, trueVal: unknown, falseVal: unknown) =>
					condition ? trueVal : falseVal,
				sumif: (range: unknown[], criteria: unknown, sumRange?: unknown[]) => {
					const targetRange = (sumRange || range) as (number | string)[];
					let sum = 0;
					range.forEach((val, idx) => {
						if (val == criteria) {
							sum += Number(targetRange[idx]) || 0;
						}
					});
					return sum;
				},
				countif: (range: unknown[], criteria: unknown) => {
					return range.filter((val) => val == criteria).length;
				},
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
				len: (str: string) => String(str).length,
				upper: (str: string) => String(str).toUpperCase(),
				lower: (str: string) => String(str).toLowerCase(),
				concat: (...args: unknown[]) => args.join(""),
				left: (str: string, num: number) => String(str).substring(0, num),
				right: (str: string, num: number) => {
					const s = String(str);
					return s.substring(s.length - num);
				},
				today: () => new Date().toLocaleDateString(),
				now: () => new Date().toLocaleString(),
				year: (dateStr: string) => new Date(dateStr).getFullYear(),
				month: (dateStr: string) => new Date(dateStr).getMonth() + 1,
				day: (dateStr: string) => new Date(dateStr).getDate(),
				and: (...args: boolean[]) => args.every(Boolean),
				or: (...args: boolean[]) => args.some(Boolean),
				not: (arg: boolean) => !arg,
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
				isnumber: (val: unknown) => typeof val === "number" && !isNaN(val),
				istext: (val: unknown) => typeof val === "string",
				isblank: (val: unknown) =>
					val === undefined || val === null || val === "",
			},
			{ override: true },
		);
		customFunctionsRegistered = true;
	} catch (e) {
		console.warn("MathJS custom functions registration failed:", e);
	}
};

const getVal = (cellId: string, currentData: SheetData) => {
	const val = currentData[cellId]?.value || "";
	if (val !== "" && !isNaN(Number(val))) {
		return Number(val);
	}
	return val;
};

const getRangeValues = (range: string, currentData: SheetData) => {
	const cells = getRangeCells(range);
	return cells.map((cellId) => {
		const val = currentData[cellId]?.value || "";
		if (val !== "" && !isNaN(Number(val))) {
			return Number(val);
		}
		return val;
	});
};

const getRange2D = (range: string, currentData: SheetData) => {
	const [start, end] = range.split(":");
	const { col: startCol, row: startRow } = parseCellId(start);
	const { col: endCol, row: endRow } = parseCellId(end);

	const grid: unknown[][] = [];
	for (
		let r = Math.min(startRow, endRow);
		r <= Math.max(startRow, endRow);
		r++
	) {
		const row: unknown[] = [];
		for (
			let c = Math.min(startCol, endCol);
			c <= Math.max(startCol, endCol);
			c++
		) {
			const cellId = `${indexToColLetter(c)}${r + 1}`;
			const val = currentData[cellId]?.value || "";
			row.push(!isNaN(Number(val)) && val !== "" ? Number(val) : val);
		}
		grid.push(row);
	}
	return grid;
};

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
	// Custom functions (ensure they are lowercase in mathjs scope)
	if: "if",
	sumif: "sumif",
	countif: "countif",
	vlookup: "vlookup",
	len: "len",
	upper: "upper",
	lower: "lower",
	concat: "concat",
	left: "left",
	right: "right",
	today: "today",
	now: "now",
	year: "year",
	month: "month",
	day: "day",
	and: "and",
	or: "or",
	not: "not",
	pmt: "pmt",
	fv: "fv",
	pv: "pv",
	stdev: "stdev",
	var: "var",
	median: "median",
	isnumber: "isnumber",
	istext: "istext",
	isblank: "isblank",
};

export const evaluateFormula = (
	formula: string,
	currentData: SheetData,
	options: {
		targetCellId?: string;
		namedRanges?: Record<string, string>;
	} = {},
): string => {
	if (!formula.startsWith("=")) return formula;

	registerCustomFunctions();

	let expression = formula.substring(1);

	// Replace named ranges
	if (options.namedRanges) {
		Object.entries(options.namedRanges).forEach(([name, range]) => {
			const rangeValues = getRangeValues(range, currentData);
			const regex = new RegExp(`\\b${name}\\b`, "gi");
			const items = rangeValues.map((v) =>
				typeof v === "string" ? `"${v.replace(/"/g, '\\"')}"` : v,
			);
			expression = expression.replace(regex, `[${items.join(",")}]`);
		});
	}

	// 1. Pre-process Ranges
	const rangeRegex = /\b([a-zA-Z]+[0-9]+:[a-zA-Z]+[0-9]+)\b/g;
	expression = expression.replace(rangeRegex, (match) => {
		if (expression.toLowerCase().includes("vlookup")) {
			const values2D = getRange2D(match.toUpperCase(), currentData);
			return JSON.stringify(values2D);
		}
		const values = getRangeValues(match.toUpperCase(), currentData);
		const items = values.map((v) =>
			typeof v === "string" ? `"${v.replace(/"/g, '\\"')}"` : v,
		);
		return `[${items.join(",")}]`;
	});

	// 2. Pre-process Cell References
	const cellRegex = /\b([a-zA-Z]+[0-9]+)\b/g;
	expression = expression.replace(cellRegex, (match) => {
		const val = getVal(match.toUpperCase(), currentData);
		return typeof val === "string"
			? `"${val.replace(/"/g, '\\"')}"`
			: String(val);
	});

	Object.entries(functionMap).forEach(([excel, mathjs]) => {
		const regex = new RegExp(`\\b${excel}\\(`, "gi");
		expression = expression.replace(regex, `${mathjs}(`);
	});

	try {
		const result = math.evaluate(expression);
		let finalResult: string;

		if (Array.isArray(result)) {
			finalResult = result.length > 0 ? String(result[0]) : "";
		} else {
			const cellId = options.targetCellId;
			if (cellId && currentData[cellId]?.style?.numberFormat) {
				finalResult = formatNumber(
					result,
					currentData[cellId].style!.numberFormat!,
				);
			} else {
				finalResult = String(result);
			}
		}

		return finalResult;
	} catch (e) {
		console.error("Formula evaluation error:", e, "Expression:", expression);
		return "#REF!";
	}
};
