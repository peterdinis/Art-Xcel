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
				sumif: (range: unknown, criteria: unknown, sumRange?: unknown) => {
					const r = (
						range && (range as any).toArray ? (range as any).toArray() : range
					) as unknown[];
					const sr = (
						sumRange && (sumRange as any).toArray
							? (sumRange as any).toArray()
							: r
					) as (number | string)[];
					let sum = 0;
					if (!Array.isArray(r)) return 0;
					r.forEach((val, idx) => {
						if (val == criteria) {
							sum += Number(sr[idx]) || 0;
						}
					});
					return sum;
				},
				countif: (range: unknown, criteria: unknown) => {
					const r = (
						range && (range as any).toArray ? (range as any).toArray() : range
					) as unknown[];
					if (!Array.isArray(r)) return 0;
					return r.filter((val) => val == criteria).length;
				},
				vlookup: (
					lookupValue: unknown,
					table: unknown,
					colIndex: number,
					exactMatch: boolean = true,
				) => {
					const t = (
						table && (table as any).toArray ? (table as any).toArray() : table
					) as unknown[][];
					if (!Array.isArray(t) || t.length === 0) return "#N/A";
					for (const row of t) {
						const r = Array.isArray(row)
							? row
							: row && (row as any).toArray
								? (row as any).toArray()
								: [row];
						if (!Array.isArray(r)) continue;
						const firstCell = r[0];
						let match = false;
						if (exactMatch) {
							match = firstCell == lookupValue;
						} else {
							match = String(firstCell)
								.toLowerCase()
								.includes(String(lookupValue).toLowerCase());
						}
						if (match) return r[colIndex - 1] ?? "#REF!";
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
				/** IFERROR(expr, fallback) — returns fallback when expr throws */
				iferror: (val: unknown, fallback: unknown) => {
					if (
						val === null ||
						val === undefined ||
						(typeof val === "string" &&
							(val.startsWith("#") || val === "NaN"))
					)
						return fallback;
					return val;
				},
				/** AVERAGEIF(range, criteria, avgRange?) */
				averageif: (
					range: unknown,
					criteria: unknown,
					avgRange?: unknown,
				) => {
					const r = (
						range && (range as any).toArray
							? (range as any).toArray()
							: range
					) as unknown[];
					const ar = (
						avgRange && (avgRange as any).toArray
							? (avgRange as any).toArray()
							: r
					) as (number | string)[];
					if (!Array.isArray(r)) return 0;
					const matching: number[] = [];
					r.forEach((val, idx) => {
						if (val == criteria) {
							const n = Number(ar[idx]);
							if (!isNaN(n)) matching.push(n);
						}
					});
					return matching.length > 0
						? matching.reduce((a, b) => a + b, 0) / matching.length
						: 0;
				},
				/** TRIM — remove leading/trailing/extra internal spaces */
				trim: (str: string) =>
					String(str)
						.trim()
						.replace(/\s+/g, " "),
				/** PROPER — title case */
				proper: (str: string) =>
					String(str)
						.toLowerCase()
						.replace(/(?:^|\s)\S/g, (c) => c.toUpperCase()),
				/** SUBSTITUTE(text, old, new, [instance]) */
				substitute: (
					text: string,
					oldText: string,
					newText: string,
					instance?: number,
				) => {
					const s = String(text);
					const o = String(oldText);
					const n = String(newText);
					if (instance === undefined)
						return s.split(o).join(n);
					let count = 0;
					return s.replace(
						new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
						(match) => {
							count++;
							return count === instance ? n : match;
						},
					);
				},
				/** REPT(text, count) — repeat text N times */
				rept: (str: string, count: number) =>
					String(str).repeat(Math.max(0, Math.floor(Number(count)))),
				sum: (...args: unknown[]) => {
					const nums = args
						.flatMap((arg) =>
							arg && (arg as any).toArray ? (arg as any).toArray() : arg,
						)
						.flat(Infinity)
						.map(Number)
						.filter((n) => !isNaN(n));
					return nums.reduce((a, b) => a + b, 0);
				},
				max: (...args: unknown[]) => {
					const nums = args
						.flatMap((arg) =>
							arg && (arg as any).toArray ? (arg as any).toArray() : arg,
						)
						.flat(Infinity)
						.map(Number)
						.filter((n) => !isNaN(n));
					return nums.length > 0 ? Math.max(...nums) : 0;
				},
				min: (...args: unknown[]) => {
					const nums = args
						.flatMap((arg) =>
							arg && (arg as any).toArray ? (arg as any).toArray() : arg,
						)
						.flat(Infinity)
						.map(Number)
						.filter((n) => !isNaN(n));
					return nums.length > 0 ? Math.min(...nums) : 0;
				},
				mean: (...args: unknown[]) => {
					const nums = args
						.flatMap((arg) =>
							arg && (arg as any).toArray ? (arg as any).toArray() : arg,
						)
						.flat(Infinity)
						.map(Number)
						.filter((n) => !isNaN(n));
					return nums.length > 0
						? nums.reduce((a, b) => a + b, 0) / nums.length
						: 0;
				},
				/** MATCH(lookup_value, lookup_array, [match_type]) */
				match: (lookupValue: unknown, lookupArray: unknown, matchType: number = 1) => {
					let arr = (
						lookupArray && (lookupArray as any).toArray ? (lookupArray as any).toArray() : lookupArray
					) as unknown[];
					if (!Array.isArray(arr)) return "#N/A";

					// Flatten 2D array if it's 1D-like
					if (Array.isArray(arr[0])) {
						const flatArr = arr.flat();
						// If original was 2D with multiple cols, this might be wrong, but usually MATCH takes a 1D range
						arr = flatArr;
					}

					if (matchType === 0) {
						const idx = arr.findIndex(v => v == lookupValue);
						return idx !== -1 ? idx + 1 : "#N/A";
					} else if (matchType === 1) {
						// Less than (assumes sorted ascending)
						let bestIdx = -1;
						for (let i = 0; i < arr.length; i++) {
							if (arr[i] == lookupValue) return i + 1;
							if (Number(arr[i]) < Number(lookupValue)) {
								bestIdx = i;
							} else if (Number(arr[i]) > Number(lookupValue)) {
								break;
							}
						}
						return bestIdx !== -1 ? bestIdx + 1 : "#N/A";
					} else if (matchType === -1) {
						// Greater than (assumes sorted descending)
						let bestIdx = -1;
						for (let i = 0; i < arr.length; i++) {
							if (arr[i] == lookupValue) return i + 1;
							if (Number(arr[i]) > Number(lookupValue)) {
								bestIdx = i;
							} else if (Number(arr[i]) < Number(lookupValue)) {
								break;
							}
						}
						return bestIdx !== -1 ? bestIdx + 1 : "#N/A";
					}
					return "#VALUE!";
				},
				/** INDEX(array, row_num, [column_num]) */
				index: (array: unknown, rowNum: number, colNum?: number) => {
					const arr = (
						array && (array as any).toArray ? (array as any).toArray() : array
					) as any[];
					if (!Array.isArray(arr)) return "#VALUE!";
					
					// Handle 2D array
					if (Array.isArray(arr[0])) {
						const r = Math.floor(rowNum) - 1;
						const c = colNum ? Math.floor(colNum) - 1 : 0;
						if (arr[r] && arr[r][c] !== undefined) return arr[r][c];
						// If colNum not provided, and it's a single column/row array, handle it
						if (colNum === undefined) {
							const flat = arr.flat();
							if (flat[r] !== undefined) return flat[r];
						}
						return "#REF!";
					}
					
					// Handle 1D array
					const idx = Math.floor(rowNum) - 1;
					if (arr[idx] !== undefined) return arr[idx];
					return "#REF!";
				},
				/** XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode]) */
				xlookup: (
					lookupValue: unknown,
					lookupArray: unknown,
					returnArray: unknown,
					ifNotFound: unknown = "#N/A",
					matchMode: number = 0,
					searchMode: number = 1
				) => {
					let lArr = (
						lookupArray && (lookupArray as any).toArray ? (lookupArray as any).toArray() : lookupArray
					) as unknown[];
					let rArr = (
						returnArray && (returnArray as any).toArray ? (returnArray as any).toArray() : returnArray
					) as unknown[];
					
					if (!Array.isArray(lArr) || !Array.isArray(rArr)) return "#VALUE!";

					if (Array.isArray(lArr[0])) lArr = lArr.flat();
					if (Array.isArray(rArr[0])) rArr = rArr.flat();

					const findIdx = () => {
						if (matchMode === 0) { // Exact match
							if (searchMode === 1) return lArr.indexOf(lookupValue);
							if (searchMode === -1) return lArr.lastIndexOf(lookupValue);
						}
						// Simplified match modes for now
						return lArr.findIndex(v => v == lookupValue);
					};

					const idx = findIdx();
					if (idx !== -1) return rArr[idx] ?? "#REF!";
					return ifNotFound;
				},
				/** REPLACE(old_text, start_num, num_chars, new_text) */
				replace: (oldText: string, start: number, num: number, newText: string) => {
					const s = String(oldText);
					const st = Math.floor(start) - 1;
					const n = Math.floor(num);
					return s.substring(0, st) + String(newText) + s.substring(st + n);
				},
				/** SEARCH(find_text, within_text, [start_num]) - case insensitive */
				search: (find: string, within: string, start: number = 1) => {
					const idx = String(within).toLowerCase().indexOf(String(find).toLowerCase(), Math.floor(start) - 1);
					return idx !== -1 ? idx + 1 : "#VALUE!";
				},
				/** FIND(find_text, within_text, [start_num]) - case sensitive */
				find: (find: string, within: string, start: number = 1) => {
					const idx = String(within).indexOf(String(find), Math.floor(start) - 1);
					return idx !== -1 ? idx + 1 : "#VALUE!";
				},
				/** IFNA(value, value_if_na) */
				ifna: (val: unknown, fallback: unknown) => {
					return val === "#N/A" ? fallback : val;
				},
				/** IFS(condition1, value1, [condition2, value2], ...) */
				ifs: (...args: unknown[]) => {
					for (let i = 0; i < args.length; i += 2) {
						if (args[i]) return args[i + 1];
					}
					return "#N/A";
				},
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
	iferror: "iferror",
	sumif: "sumif",
	countif: "countif",
	averageif: "averageif",
	vlookup: "vlookup",
	len: "len",
	upper: "upper",
	lower: "lower",
	trim: "trim",
	proper: "proper",
	substitute: "substitute",
	rept: "rept",
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
	match: "match",
	index: "index",
	xlookup: "xlookup",
	replace: "replace",
	search: "search",
	find: "find",
	ifna: "ifna",
	ifs: "ifs",
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
		const lowerExpr = expression.toLowerCase();
		if (
			lowerExpr.includes("vlookup") ||
			lowerExpr.includes("index") ||
			lowerExpr.includes("xlookup")
		) {
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
	// Avoid replacing cell references that are already inside quotes
	const cellRegex = /\b([a-zA-Z]+[0-9]+)\b/g;
	const parts = expression.split(/("[^"]*")/);
	expression = parts
		.map((part) => {
			if (part.startsWith('"')) return part; // Skip quoted strings
			return part.replace(cellRegex, (match) => {
				const val = getVal(match.toUpperCase(), currentData);
				return typeof val === "string"
					? `"${val.replace(/"/g, '\\"')}"`
					: String(val);
			});
		})
		.join("");

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
