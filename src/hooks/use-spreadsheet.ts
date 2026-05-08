import { useState, useCallback } from "react";
import {
	colLetterToIndex,
	indexToColLetter,
	parseCellId,
	getRangeCells,
	formatNumber,
} from "@/lib/excel-utils";
import { evaluateFormula as libEvaluateFormula } from "@/lib/formula-evaluator";

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
		paddingLeft?: number;
		wrapText?: boolean;
		numberFormat?:
		| "general"
		| "number"
		| "currency"
		| "percentage"
		| "date"
		| "time";
	};
	note?: string;
	validation?: {
		type: "number" | "text" | "list" | "date";
		min?: number;
		max?: number;
		list?: string[];
		required?: boolean;
	};
	/** If this cell is part of a merged region, this is the top-left anchor cell id */
	mergeParent?: string;
	/** Present only on the anchor cell of a merged region */
	mergeSpan?: { colSpan: number; rowSpan: number };
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

export interface CommentData {
	id: string;
	cellId: string;
	author: string;
	text: string;
	timestamp: number;
	resolved: boolean;
}

export interface Sheet {
	name: string;
	data: SheetData;
	charts: ChartData[];
	images: ImageData[];
	shapes: ShapeData[];
	icons: IconData[];
	comments: CommentData[];
	selectedCell: string | null;
	selectionRange: string[] | null;
	namedRanges: Record<string, string>;
	hiddenRows: Set<number>;
	/** Number of rows frozen at the top (0 = none) */
	frozenRows: number;
	/** Number of columns frozen at the left (0 = none) */
	frozenCols: number;
	undoStack: SheetData[];
	redoStack: SheetData[];
}

export const useSpreadsheet = (initialData: SheetData = {}) => {
	const [sheets, setSheets] = useState<any[]>([
		{
			name: "Sheet1",
			data: initialData,
			charts: [],
			images: [],
			shapes: [],
			icons: [],
			comments: [],
			selectedCell: "A1",
			selectionRange: null,
			namedRanges: {},
			hiddenRows: new Set(),
			frozenRows: 0,
			frozenCols: 0,
			undoStack: [],
			redoStack: [],
		},
	]);
	const [currentSheetIndex, setCurrentSheetIndex] = useState(0);

	const [clipboard, setClipboard] = useState<{
		data: SheetData;
		type: "copy" | "cut";
	} | null>(null);
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
	const comments = currentSheet.comments;
	const namedRanges = currentSheet.namedRanges;
	const hiddenRows = currentSheet.hiddenRows;
	const undoStack = currentSheet.undoStack;
	const redoStack = currentSheet.redoStack;
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

	const setComments = useCallback(
		(newComments: CommentData[] | ((prev: CommentData[]) => CommentData[])) => {
			setSheets((prev) =>
				prev.map((sheet, i) =>
					i === currentSheetIndex
						? {
							...sheet,
							comments:
								typeof newComments === "function"
									? newComments(sheet.comments)
									: newComments,
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
			const cells = getRangeCells(range);
			return cells.map((cellId) => {
				const val = currentData[cellId]?.value || "";
				return !isNaN(Number(val)) && val !== "" ? Number(val) : val;
			});
		},
		[],
	);

	// Get range of cells as strings
	const getRange = useCallback((range: string): string[] => {
		return getRangeCells(range);
	}, []);

	// Get range as 2D array of values
	const getRange2D = useCallback((range: string, currentData: SheetData) => {
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
	}, []);

	// Formula evaluator wrapper
	const evaluateFormula = useCallback(
		(
			formula: string,
			currentData: SheetData,
			targetCellId?: string,
		): string => {
			if (!formula.startsWith("=")) return formula;

			// Check cache (using formula as key, but we should probably use a better key if it depends on data)
			// Actually, the expression changes when cell values change, so caching the expression is better
			// But for now let's use the helper from lib
			return libEvaluateFormula(formula, currentData as any, {
				targetCellId: targetCellId || selectedCell || undefined,
				namedRanges,
			});
		},
		[namedRanges, selectedCell],
	);

	// Save state to undo stack
	const saveToUndo = useCallback(() => {
		setSheets((prev) =>
			prev.map((sheet, i) =>
				i === currentSheetIndex
					? {
						...sheet,
						undoStack: [...sheet.undoStack, sheet.data],
						redoStack: [],
					}
					: sheet,
			),
		);
	}, [currentSheetIndex]);

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

				// Track formula cells via the shared Set (state update queued outside)
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

				// Re-evaluate all OTHER formula cells by scanning newData directly
				// (avoids stale-closure bug with the formulaCells Set)
				Object.keys(newData).forEach((key) => {
					if (key !== cellId && newData[key]?.formula?.startsWith("=")) {
						newData[key] = {
							...newData[key],
							value: evaluateFormula(
								newData[key].formula,
								newData,
								key,
							),
						};
					}
				});

				return newData;
			});
		},
		[evaluateFormula, saveToUndo, setData],
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
		(
			cellIds: string | string[],
			style: Partial<NonNullable<CellData["style"]>>,
		) => {
			saveToUndo();
			const ids = Array.isArray(cellIds) ? cellIds : [cellIds];

			setData((prev) => {
				const newData = { ...prev };
				ids.forEach((id) => {
					newData[id] = {
						...(prev[id] || { value: "", formula: "" }),
						style: {
							...prev[id]?.style,
							...style,
						},
					};
				});
				return newData;
			});
		},
		[saveToUndo, setData],
	);

	// Apply style to range
	const applyStyleToRange = useCallback(
		(range: string, style: Partial<NonNullable<CellData["style"]>>) => {
			const cells = getRangeCells(range);
			updateCellStyle(cells, style);
		},
		[updateCellStyle],
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
				const { col: targetColIdx, row: targetRowIdx } =
					parseCellId(targetCell);

				// Find the top-left cell of the clipboard data to calculate relative offsets
				const sourceCellIds = Object.keys(clipboard.data);
				let minCol = Infinity;
				let minRow = Infinity;
				sourceCellIds.forEach((id) => {
					const { col, row } = parseCellId(id);
					if (col < minCol) minCol = col;
					if (row < minRow) minRow = row;
				});

				// Paste at new location
				Object.entries(clipboard.data).forEach(([sourceId, cellData]) => {
					const { col: sourceColIdx, row: sourceRowIdx } =
						parseCellId(sourceId);

					const colOffset = sourceColIdx - minCol;
					const rowOffset = sourceRowIdx - minRow;

					const newCol = indexToColLetter(targetColIdx + colOffset);
					const newRow = targetRowIdx + rowOffset + 1;
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
		const sheet = sheets[currentSheetIndex];
		if (sheet.undoStack.length === 0) return;

		const previous = sheet.undoStack[sheet.undoStack.length - 1];
		setSheets((prev) =>
			prev.map((s, i) =>
				i === currentSheetIndex
					? {
						...s,
						data: previous,
						undoStack: s.undoStack.slice(0, -1),
						redoStack: [...s.redoStack, s.data],
					}
					: s,
			),
		);
	}, [sheets, currentSheetIndex]);

	// Redo
	const redo = useCallback(() => {
		const sheet = sheets[currentSheetIndex];
		if (sheet.redoStack.length === 0) return;

		const next = sheet.redoStack[sheet.redoStack.length - 1];
		setSheets((prev) =>
			prev.map((s, i) =>
				i === currentSheetIndex
					? {
						...s,
						data: next,
						undoStack: [...s.undoStack, s.data],
						redoStack: s.redoStack.slice(0, -1),
					}
					: s,
			),
		);
	}, [sheets, currentSheetIndex]);

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
					const { col: colNum, row } = parseCellId(cellId);

					if (colNum >= colIndex) {
						const newCol = indexToColLetter(colNum + 1);
						newData[`${newCol}${row + 1}`] = cellData;
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
					const { col: colNum, row } = parseCellId(cellId);

					if (colNum < colIndex) {
						newData[cellId] = cellData;
					} else if (colNum > colIndex) {
						const newCol = indexToColLetter(colNum - 1);
						newData[`${newCol}${row + 1}`] = cellData;
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
				const colLabel = indexToColLetter(column);
				const valA = a[1].get(colLabel.charCodeAt(0))?.value || "";
				const valB = b[1].get(colLabel.charCodeAt(0))?.value || "";

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
					rowData.forEach((cellData, colCharCode) => {
						const colLabel = String.fromCharCode(colCharCode);
						const cellId = `${colLabel}${newRow}`;
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
				const row = parseInt(cellId.match(/\d+/)?.[0] || "1");
				rowsInRange.add(row);

				const colLabel = indexToColLetter(column);
				const cellCol = cellId.match(/^[A-Z]+/)?.[0] || "";

				if (
					cellCol === colLabel &&
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
	const addNote = useCallback(
		(cellId: string, note: string) => {
			setData((prev) => ({
				...prev,
				[cellId]: {
					...(prev[cellId] || { value: "", formula: "" }),
					note,
				},
			}));
		},
		[setData],
	);

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
	const createNamedRange = useCallback(
		(name: string, range: string) => {
			setNamedRanges((prev) => ({ ...prev, [name]: range }));
		},
		[setNamedRanges],
	);

	// Delete named range
	const deleteNamedRange = useCallback(
		(name: string) => {
			setNamedRanges((prev) => {
				const { [name]: _, ...rest } = prev;
				return rest;
			});
		},
		[setNamedRanges],
	);

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
				const cellId = `${indexToColLetter(column)}${row}`;
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
						const { col: startCol, row: startRow } = parseCellId(cellId);

						parts.forEach((part, i) => {
							const newColLabel = indexToColLetter(startCol + i);
							const newCellId = `${newColLabel}${startRow + 1}`;
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
				comments: [],
				selectedCell: "A1",
				selectionRange: null,
				namedRanges: {},
				hiddenRows: new Set(),
				undoStack: [],
				redoStack: [],
			},
		]);
	}, []);

	// Delete sheet
	const deleteSheet = useCallback(
		(index: number) => {
			setSheets((prev) => {
				if (prev.length <= 1) return prev;
				const next = prev.filter((_, i) => i !== index);
				return next;
			});

			// Adjust current index if we deleted the current or a preceding sheet
			if (index <= currentSheetIndex && currentSheetIndex > 0) {
				setCurrentSheetIndex((prev) => prev - 1);
			}
		},
		[currentSheetIndex],
	);

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
	const addChart = useCallback(
		(chart: Omit<ChartData, "id">) => {
			const newChart = { ...chart, id: `chart-${Date.now()}` };
			setCharts((prev) => [...prev, newChart]);
		},
		[setCharts],
	);

	const removeChart = useCallback(
		(id: string) => {
			setCharts((prev) => prev.filter((c) => c.id !== id));
		},
		[setCharts],
	);

	const updateChart = useCallback(
		(id: string, updates: Partial<ChartData>) => {
			setCharts((prev) =>
				prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
			);
		},
		[setCharts],
	);

	// Image operations
	const addImage = useCallback(
		(image: Omit<ImageData, "id">) => {
			const newImage = { ...image, id: `image-${Date.now()}` };
			setImages((prev) => [...prev, newImage]);
		},
		[setImages],
	);

	const removeImage = useCallback(
		(id: string) => {
			setImages((prev) => prev.filter((i) => i.id !== id));
		},
		[setImages],
	);

	const updateImage = useCallback(
		(id: string, updates: Partial<ImageData>) => {
			setImages((prev) =>
				prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
			);
		},
		[setImages],
	);

	// Shape operations
	const addShape = useCallback(
		(shape: Omit<ShapeData, "id">) => {
			const newShape = { ...shape, id: `shape-${Date.now()}` };
			setShapes((prev) => [...prev, newShape]);
		},
		[setShapes],
	);

	const removeShape = useCallback(
		(id: string) => {
			setShapes((prev) => prev.filter((s) => s.id !== id));
		},
		[setShapes],
	);

	const updateShape = useCallback(
		(id: string, updates: Partial<ShapeData>) => {
			setShapes((prev) =>
				prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
			);
		},
		[setShapes],
	);

	// Icon operations
	const addIcon = useCallback(
		(icon: Omit<IconData, "id">) => {
			const newIcon = { ...icon, id: `icon-${Date.now()}` };
			setIcons((prev) => [...prev, newIcon]);
		},
		[setIcons],
	);

	const removeIcon = useCallback(
		(id: string) => {
			setIcons((prev) => prev.filter((i) => i.id !== id));
		},
		[setIcons],
	);

	const updateIcon = useCallback(
		(id: string, updates: Partial<IconData>) => {
			setIcons((prev) =>
				prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
			);
		},
		[setIcons],
	);

	// Comment operations
	const addComment = useCallback(
		(comment: Omit<CommentData, "id" | "timestamp" | "resolved">) => {
			const newComment: CommentData = {
				...comment,
				id: `comment-${Date.now()}`,
				timestamp: Date.now(),
				resolved: false,
			};
			setComments((prev) => [...prev, newComment]);
		},
		[setComments],
	);

	const removeComment = useCallback(
		(id: string) => {
			setComments((prev) => prev.filter((c) => c.id !== id));
		},
		[setComments],
	);

	const resolveComment = useCallback(
		(id: string, resolved: boolean = true) => {
			setComments((prev) =>
				prev.map((c) => (c.id === id ? { ...c, resolved } : c)),
			);
		},
		[setComments],
	);

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
	const selectCell = useCallback(
		(cellId: string) => {
			setSelectedCell(cellId);
		},
		[setSelectedCell],
	);

	// Select range
	const selectRange = useCallback(
		(range: string) => {
			const cells = getRange(range);
			setSelectionRange(cells);
			if (cells.length > 0) {
				setSelectedCell(cells[0]);
			}
		},
		[getRange, setSelectionRange, setSelectedCell],
	);

	// Update sheet name (placeholder - actual name is in EditorPage)
	const updateSheetName = useCallback(
		(name: string) => {
			renameSheet(currentSheetIndex, name);
		},
		[currentSheetIndex, renameSheet],
	);

	// ── New Excel Features ────────────────────────────────────────────────────

	// Freeze panes: freeze the first N rows and first M columns
	const setFrozenPanes = useCallback(
		(rows: number, cols: number) => {
			updateCurrentSheet({ frozenRows: rows, frozenCols: cols });
		},
		[updateCurrentSheet],
	);

	// Merge a rectangular selection into one cell (anchor = top-left)
	const mergeCells = useCallback(
		(cells: string[]) => {
			if (cells.length < 2) return;
			saveToUndo();

			setData((prev) => {
				const newData = { ...prev };

				// Determine bounding box
				let minCol = Infinity,
					maxCol = -Infinity,
					minRow = Infinity,
					maxRow = -Infinity;
				cells.forEach((id) => {
					const { col, row } = parseCellId(id);
					if (col < minCol) minCol = col;
					if (col > maxCol) maxCol = col;
					if (row < minRow) minRow = row;
					if (row > maxRow) maxRow = row;
				});

				const anchorId = `${indexToColLetter(minCol)}${minRow + 1}`;
				const colSpan = maxCol - minCol + 1;
				const rowSpan = maxRow - minRow + 1;

				// Set anchor cell with merge metadata
				newData[anchorId] = {
					...(prev[anchorId] || { value: "", formula: "" }),
					mergeSpan: { colSpan, rowSpan },
				};

				// Mark all other cells as children of the anchor
				cells.forEach((id) => {
					if (id === anchorId) return;
					newData[id] = {
						...(prev[id] || { value: "", formula: "" }),
						value: "",
						formula: "",
						mergeParent: anchorId,
					};
				});

				return newData;
			});
		},
		[saveToUndo, setData],
	);

	// Unmerge: remove merge metadata from all cells in a previously merged region
	const unmergeCells = useCallback(
		(cells: string[]) => {
			saveToUndo();
			setData((prev) => {
				const newData = { ...prev };
				cells.forEach((id) => {
					if (!newData[id]) return;
					const { mergeParent: _mp, mergeSpan: _ms, ...rest } = newData[id];
					newData[id] = rest;
				});
				return newData;
			});
		},
		[saveToUndo, setData],
	);

	// Fill Down: copy the top cell of a selection into all rows below it
	const fillDown = useCallback(() => {
		if (!selectionRange || selectionRange.length < 2) return;
		saveToUndo();

		setData((prev) => {
			const newData = { ...prev };

			// Group cells by column
			const colMap: Record<string, string[]> = {};
			selectionRange.forEach((id: string) => {
				const col = id.match(/[A-Z]+/)?.[0] || "";
				if (!colMap[col]) colMap[col] = [];
				colMap[col].push(id);
			});

			// For each column, copy the first cell down
			Object.values(colMap).forEach((colCells) => {
				const sorted = [...colCells].sort((a, b) => {
					const ra = parseInt(a.match(/\d+/)?.[0] || "0");
					const rb = parseInt(b.match(/\d+/)?.[0] || "0");
					return ra - rb;
				});
				const source = prev[sorted[0]] || { value: "", formula: "" };
				for (let i = 1; i < sorted.length; i++) {
					newData[sorted[i]] = { ...source };
				}
			});

			return newData;
		});
	}, [selectionRange, saveToUndo, setData]);

	// Fill Right: copy the leftmost cell of a selection into all columns to the right
	const fillRight = useCallback(() => {
		if (!selectionRange || selectionRange.length < 2) return;
		saveToUndo();

		setData((prev) => {
			const newData = { ...prev };

			// Group cells by row
			const rowMap: Record<number, string[]> = {};
			selectionRange.forEach((id: string) => {
				const row = parseInt(id.match(/\d+/)?.[0] || "0");
				if (!rowMap[row]) rowMap[row] = [];
				rowMap[row].push(id);
			});

			// For each row, copy the leftmost cell to the right
			Object.values(rowMap).forEach((rowCells) => {
				const sorted = [...rowCells].sort((a, b) => {
					const ca = a.match(/[A-Z]+/)?.[0] || "";
					const cb = b.match(/[A-Z]+/)?.[0] || "";
					return ca.localeCompare(cb);
				});
				const source = prev[sorted[0]] || { value: "", formula: "" };
				for (let i = 1; i < sorted.length; i++) {
					newData[sorted[i]] = { ...source };
				}
			});

			return newData;
		});
	}, [selectionRange, saveToUndo, setData]);

	// Toggle wrap text on a cell or range
	const toggleWrapText = useCallback(
		(cellIds: string | string[]) => {
			const ids = Array.isArray(cellIds) ? cellIds : [cellIds];
			// Determine current state from first cell
			const firstCell = ids[0] ? currentSheet.data[ids[0]] : undefined;
			const currentlyWrapped = firstCell?.style?.wrapText ?? false;
			updateCellStyle(ids, { wrapText: !currentlyWrapped });
		},
		[currentSheet.data, updateCellStyle],
	);

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
		applyStyleToRange,
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
		comments,
		addComment,
		removeComment,
		resolveComment,
		setComments,

		// Utilities
		clearSheet,
		setData,
		updateSheetName,

		// ── New Excel Features ────────────────────────────────────────────────
		frozenRows: currentSheet.frozenRows,
		frozenCols: currentSheet.frozenCols,
		setFrozenPanes,
		mergeCells,
		unmergeCells,
		fillDown,
		fillRight,
		toggleWrapText,
	};
};
