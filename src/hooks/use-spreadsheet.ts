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
		numberFormat?: "general" | "number" | "currency" | "percentage" | "date" | "time";
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

export const useSpreadsheet = (initialData: SheetData = {}) => {
	const [data, setData] = useState<SheetData>(initialData);
	const [selectedCell, setSelectedCell] = useState<string | null>("A1");
	const [selectionRange, setSelectionRange] = useState<string[] | null>(null);
	const [clipboard, setClipboard] = useState<{ data: SheetData; type: "copy" | "cut" } | null>(null);
	const [undoStack, setUndoStack] = useState<SheetData[]>([]);
	const [redoStack, setRedoStack] = useState<SheetData[]>([]);
	const [sheetNames, setSheetNames] = useState<string[]>(["Sheet1"]);
	const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
	const [formulas, setFormulas] = useState<Record<string, string>>({});
	const [namedRanges, setNamedRanges] = useState<Record<string, string>>({});
	const [formulaCells, setFormulaCells] = useState<Set<string>>(new Set());
	const [hiddenRows, setHiddenRows] = useState<Set<number>>(new Set());

	// Helper to get cell value as number (or 0)
	const getVal = (cellId: string, currentData: SheetData) => {
		const val = currentData[cellId]?.value;
		return val && !isNaN(Number(val)) ? Number(val) : 0;
	};

	// Helper to expand ranges like A1:A5 to array of values
	const getRangeValues = (range: string, currentData: SheetData) => {
		const [start, end] = range.split(":");
		const startCol = start.match(/[A-Z]+/)?.[0] || "";
		const startRow = parseInt(start.match(/[0-9]+/)?.[0] || "1");
		const endCol = end.match(/[A-Z]+/)?.[0] || "";
		const endRow = parseInt(end.match(/[0-9]+/)?.[0] || "1");

		const values: number[] = [];
		const startColIdx = startCol.charCodeAt(0);
		const endColIdx = endCol.charCodeAt(0);

		for (let c = startColIdx; c <= endColIdx; c++) {
			for (let r = startRow; r <= endRow; r++) {
				const cellId = `${String.fromCharCode(c)}${r}`;
				values.push(getVal(cellId, currentData));
			}
		}
		return values;
	};

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

		const grid: any[][] = [];
		const startColIdx = startCol.charCodeAt(0);
		const endColIdx = endCol.charCodeAt(0);

		for (let r = startRow; r <= endRow; r++) {
			const row: any[] = [];
			for (let c = startColIdx; c <= endColIdx; c++) {
				const cellId = `${String.fromCharCode(c)}${r}`;
				row.push(currentData[cellId]?.value || "");
			}
			grid.push(row);
		}
		return grid;
	}, []);

	// Custom MathJS functions for Excel compatibility
	const registerCustomFunctions = useCallback(() => {
		try {
			// IF(condition, true_val, false_val)
			math.import({
				if: (condition: unknown, trueVal: unknown, falseVal: unknown) => (condition ? trueVal : falseVal),
				// SUMIF(range_array, criteria, [sum_range_array])
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
				// COUNTIF(range_array, criteria)
				countif: (range: unknown[], criteria: unknown) => {
					return range.filter(val => val == criteria).length;
				},
				// VLOOKUP(lookup_value, table_array, col_index, [exact_match])
				vlookup: (lookupValue: unknown, table: unknown[][], colIndex: number, exactMatch: boolean = true) => {
					if (!Array.isArray(table) || table.length === 0) return "#N/A";
					for (const row of table) {
						if (!Array.isArray(row)) continue;
						const firstCell = row[0];
						let match = false;
						if (exactMatch) {
							match = firstCell == lookupValue;
						} else {
							match = String(firstCell).toLowerCase().includes(String(lookupValue).toLowerCase());
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
			}, { override: true });
		} catch (e) {
			console.warn("MathJS custom functions registration failed:", e);
		}
	}, []);

	// Formula evaluator using MathJS
	const evaluateFormula = useCallback(
		(formula: string, currentData: SheetData, targetCellId?: string): string => {
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
			expression = expression.replace(rangeRegex, (match) => {
				// Special handling for VLOOKUP/TABLE functions that need 2D arrays
				if (expression.toLowerCase().includes("vlookup")) {
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

			// 4. Map Excel functions
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
			};

			Object.entries(functionMap).forEach(([excel, mathjs]) => {
				const regex = new RegExp(`\\b${excel}\\(`, "gi");
				expression = expression.replace(regex, `${mathjs}(`);
			});

			try {
				const result = math.evaluate(expression);

				// Handle array results
				if (Array.isArray(result)) {
					return result.length > 0 ? String(result[0]) : "";
				}

				// Format based on cell's number format
				const cellId = targetCellId || selectedCell;
				if (cellId && currentData[cellId]?.style?.numberFormat) {
					return formatNumber(result, currentData[cellId].style.numberFormat);
				}

				return String(result);
			} catch (e) {
				console.error("Formula evaluation error:", e, "Expression:", expression);
				return "#REF!";
			}
		},
		[formatNumber, getRange2D, getRangeValues, getVal, namedRanges, registerCustomFunctions, selectedCell],
	);

	// Format number based on format type
	const formatNumber = (value: number, format: string): string => {
		switch (format) {
			case "currency":
				return new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(value);
			case "percentage":
				return new Intl.NumberFormat("sk-SK", { style: "percent", minimumFractionDigits: 2 }).format(value / 100);
			case "date":
				return new Date(value).toLocaleDateString("sk-SK");
			case "time":
				return new Date(value).toLocaleTimeString("sk-SK");
			case "number":
				return new Intl.NumberFormat("sk-SK").format(value);
			default:
				return String(value);
		}
	};

	// Save state to undo stack
	const saveToUndo = useCallback(() => {
		setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(data))]);
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
					...newData[cellId],
					value: evaluated,
					formula: input,
				};

				// Track formula cells
				if (input.startsWith("=")) {
					setFormulaCells(prev => {
						const next = new Set(prev);
						next.add(cellId);
						return next;
					});
				} else {
					setFormulaCells(prev => {
						if (prev.has(cellId)) {
							const next = new Set(prev);
							next.delete(cellId);
							return next;
						}
						return prev;
					});
				}

				// Re-evaluate ONLY formula cells
				formulaCells.forEach((key) => {
					if (key !== cellId) {
						newData[key].value = evaluateFormula(newData[key].formula, newData, key);
					}
				});

				return newData;
			});
		},
		[evaluateFormula, formulaCells, saveToUndo],
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
						...newData[cellId],
						value: evaluated,
						formula: input,
					};
				});

				// Re-evaluate all formulas
				Object.keys(newData).forEach((key) => {
					if (newData[key].formula?.startsWith("=")) {
						newData[key].value = evaluateFormula(newData[key].formula, newData, key);
					}
				});

				return newData;
			});
		},
		[evaluateFormula, saveToUndo],
	);

	// Update cell style
	const updateCellStyle = useCallback(
		(cellId: string, style: Partial<NonNullable<CellData["style"]>>) => {
			saveToUndo();

			setData((prev) => ({
				...prev,
				[cellId]: {
					...prev[cellId] || { value: "", formula: "" },
					style: {
						...prev[cellId]?.style,
						...style,
					},
				},
			}));
		},
		[saveToUndo],
	);

	// Copy cells
	const copyCells = useCallback((cells: string[]) => {
		const copiedData: SheetData = {};
		cells.forEach(cellId => {
			if (data[cellId]) {
				copiedData[cellId] = JSON.parse(JSON.stringify(data[cellId]));
			}
		});
		setClipboard({ data: copiedData, type: "copy" });
	}, [data]);

	// Cut cells
	const cutCells = useCallback((cells: string[]) => {
		const cutData: SheetData = {};
		cells.forEach(cellId => {
			if (data[cellId]) {
				cutData[cellId] = JSON.parse(JSON.stringify(data[cellId]));
			}
		});
		setClipboard({ data: cutData, type: "cut" });
	}, [data]);

	// Paste cells
	const pasteCells = useCallback((targetCell: string) => {
		if (!clipboard) return;

		saveToUndo();

		setData((prev) => {
			const newData = { ...prev };

			// If cut, delete original cells
			if (clipboard.type === "cut") {
				Object.keys(clipboard.data).forEach(cellId => {
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
	}, [clipboard, saveToUndo]);

	// Undo
	const undo = useCallback(() => {
		if (undoStack.length === 0) return;

		const previous = undoStack[undoStack.length - 1];
		setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(data))]);
		setData(previous);
		setUndoStack(prev => prev.slice(0, -1));
	}, [undoStack, data]);

	// Redo
	const redo = useCallback(() => {
		if (redoStack.length === 0) return;

		const next = redoStack[redoStack.length - 1];
		setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(data))]);
		setData(next);
		setRedoStack(prev => prev.slice(0, -1));
	}, [redoStack, data]);

	// Insert row
	const insertRow = useCallback((rowIndex: number) => {
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
	}, [saveToUndo]);

	// Delete row
	const deleteRow = useCallback((rowIndex: number) => {
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
	}, [saveToUndo]);

	// Insert column
	const insertColumn = useCallback((colIndex: number) => {
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
	}, [saveToUndo]);

	// Delete column
	const deleteColumn = useCallback((colIndex: number) => {
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
	}, [saveToUndo]);

	// Sort range
	const sortRange = useCallback((range: string, column: number, ascending: boolean = true) => {
		saveToUndo();

		const cells = getRange(range);
		const rows = new Map<number, Map<number, CellData>>();

		// Organize by row
		cells.forEach(cellId => {
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
				return ascending ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
			}

			return ascending
				? String(valA).localeCompare(String(valB))
				: String(valB).localeCompare(String(valA));
		});

		// Rebuild data
		setData((prev) => {
			const newData = { ...prev };
			const firstRow = Math.min(...Array.from(rows.keys()));

			sortedRows.forEach(([originalRow, rowData], index) => {
				const newRow = firstRow + index;
				rowData.forEach((cellData, colNum) => {
					const cellId = `${String.fromCharCode(colNum)}${newRow}`;
					newData[cellId] = cellData;
				});
			});

			return newData;
		});
	}, [data, saveToUndo]);

	// Filter range
	const filterRange = useCallback((range: string, column: number, predicate: (value: string) => boolean) => {
		const cells = getRange(range);
		const rowsInRange = new Set<number>();
		const matches = new Set<number>();

		cells.forEach(cellId => {
			const colIdx = cellId.match(/[A-Z]+/)?.[0].charCodeAt(0) || 0;
			const row = parseInt(cellId.match(/\d+/)?.[0] || "1");
			rowsInRange.add(row);

			if (colIdx === column + 65 && data[cellId] && predicate(data[cellId].value)) {
				matches.add(row);
			}
		});

		setHiddenRows(prev => {
			const next = new Set(prev);
			rowsInRange.forEach(row => {
				if (matches.has(row)) {
					next.delete(row);
				} else {
					next.add(row);
				}
			});
			return next;
		});

		return { visibleRows: matches };
	}, [data, getRange]);

	// Add note to cell
	const addNote = useCallback((cellId: string, note: string) => {
		setData((prev) => ({
			...prev,
			[cellId]: {
				...prev[cellId] || { value: "", formula: "" },
				note,
			},
		}));
	}, []);

	// Add data validation
	const addValidation = useCallback((
		cellId: string,
		validation: NonNullable<CellData["validation"]>
	) => {
		setData((prev) => ({
			...prev,
			[cellId]: {
				...prev[cellId] || { value: "", formula: "" },
				validation,
			},
		}));
	}, []);

	// Validate cell value
	const validateCell = useCallback((cellId: string, value: string): boolean => {
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
	}, [data]);

	// Create named range
	const createNamedRange = useCallback((name: string, range: string) => {
		setNamedRanges(prev => ({ ...prev, [name]: range }));
	}, []);

	// Delete named range
	const deleteNamedRange = useCallback((name: string) => {
		setNamedRanges(prev => {
			const { [name]: _, ...rest } = prev;
			return rest;
		});
	}, []);

	// Find and replace
	const findAndReplace = useCallback((find: string, replace: string, options?: { matchCase?: boolean; wholeCell?: boolean }) => {
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
							newValue = cellData.value.replace(new RegExp(find, "g"), replace);
						} else {
							newValue = cellData.value.replace(new RegExp(find, "gi"), replace);
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
	}, [saveToUndo]);

	// Clear sheet
	const clearSheet = useCallback(() => {
		saveToUndo();
		setData({});
		setSelectedCell("A1");
		setSelectionRange(null);
	}, [saveToUndo]);

	// Add new sheet
	const addSheet = useCallback((name: string) => {
		setSheetNames(prev => [...prev, name]);
	}, []);

	// Delete sheet
	const deleteSheet = useCallback((index: number) => {
		setSheetNames(prev => prev.filter((_, i) => i !== index));
	}, []);

	// Rename sheet
	const renameSheet = useCallback((index: number, newName: string) => {
		setSheetNames(prev => prev.map((name, i) => i === index ? newName : name));
	}, []);

	// Switch sheet
	const switchSheet = useCallback((index: number) => {
		setCurrentSheetIndex(index);
		// You might want to load different data for each sheet
	}, []);

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
	}, []);

	// Select range
	const selectRange = useCallback((range: string) => {
		const cells = getRange(range);
		setSelectionRange(cells);
		if (cells.length > 0) {
			setSelectedCell(cells[0]);
		}
	}, []);

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

		// Utilities
		clearSheet,
		setData,
		updateSheetName,
	};
};