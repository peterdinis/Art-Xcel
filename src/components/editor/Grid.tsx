"use client";
import React, {
	memo,
	useState,
	useEffect,
	useRef,
	useCallback,
	forwardRef,
	useImperativeHandle,
} from "react";
import { cn } from "@/lib/utils";
import {
	SheetData,
	CellData,
	ChartData,
	ImageData,
} from "@/hooks/use-spreadsheet";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CellContextMenu } from "./CellContextMenu";
import { ChartComponent } from "./ChartComponent";
import { ImageComponent } from "./ImageComponent";
import { ShapeComponent } from "./ShapeComponent";
import { IconComponent } from "./IconComponent";
import { ShapeData, IconData } from "@/hooks/use-spreadsheet";
import { toast } from "sonner";
import { Cloud, Save } from "lucide-react";

interface GridProps {
	data: SheetData;
	selectedCell: string | null;
	selectionRange: string[] | null;
	onSelectCell: (cellId: string) => void;
	onSelectRange: (range: string) => void;
	onCellChange: (cellId: string, value: string) => void;
	showGrid?: boolean;
	showHeaders?: boolean;
	freezePanes?: boolean;
	onCopy: () => void;
	onCut: () => void;
	onPaste: () => void;
	onInsertRow: (index: number) => void;
	onDeleteRow: (index: number) => void;
	onInsertColumn: (index: number) => void;
	onDeleteColumn: (index: number) => void;
	onClearCell: (cellId: string) => void;
	hiddenRows?: Set<number>;
	charts?: ChartData[];
	images?: ImageData[];
	onRemoveChart?: (id: string) => void;
	onRemoveImage?: (id: string) => void;
	onUpdateChart?: (id: string, updates: Partial<ChartData>) => void;
	onUpdateImage?: (id: string, updates: Partial<ImageData>) => void;
	shapes?: ShapeData[];
	icons?: IconData[];
	onRemoveShape?: (id: string) => void;
	onRemoveIcon?: (id: string) => void;
	onUpdateShape?: (id: string, updates: Partial<ShapeData>) => void;
	onUpdateIcon?: (id: string, updates: Partial<IconData>) => void;
	onShowShortcuts?: () => void;
	spreadsheetId?: string;
	spreadsheetName?: string;
	onAutoSave?: (data: SheetData) => Promise<void>;
	autoSaveInterval?: number;
	showAutoSaveStatus?: boolean;
	zoom?: number;
	onStyleChange?: (style: Record<string, unknown>) => void;
	onUndo?: () => void;
	onRedo?: () => void;
	onInsertComment?: () => void;
	onInsertHyperlink?: () => void;
}

export interface GridHandle {
	scrollToTop: () => void;
	forceSave: () => Promise<void>;
}

const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_COL_WIDTH = 100;
const ROW_HEADER_WIDTH = 40;
const ROW_BATCH_SIZE = 100;
const COL_BATCH_SIZE = 26;
const ROW_LOAD_THRESHOLD = 30;
const COL_LOAD_THRESHOLD = 10;
const OVERSCAN = 15;

const numberToColLabel = (index: number): string => {
	let result = "";
	let num = index + 1;
	while (num > 0) {
		num--;
		const remainder = num % 26;
		result = String.fromCharCode(65 + remainder) + result;
		num = Math.floor(num / 26);
	}
	return result;
};

const colLabelToNumber = (colLabel: string): number => {
	let result = 0;
	for (let i = 0; i < colLabel.length; i++) {
		result = result * 26 + (colLabel.charCodeAt(i) - 64);
	}
	return result - 1;
};

interface CellProps {
	id: string;
	value: string;
	formula?: string;
	style?: CellData["style"];
	isSelected: boolean;
	isInRange: boolean;
	isEditing: boolean;
	width: number;
	height: number;
	showGrid?: boolean;
	onClick: () => void;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onBlur: () => void;
	inputRef?: React.RefCallback<HTMLInputElement>;
	onResize?: (e: React.MouseEvent) => void;
	onCopy: () => void;
	onCut: () => void;
	onPaste: () => void;
	onInsertRowAbove: () => void;
	onInsertRowBelow: () => void;
	onDeleteRow: () => void;
	onInsertColumnLeft: () => void;
	onInsertColumnRight: () => void;
	onDeleteColumn: () => void;
	onClearCell: () => void;
	onShowShortcuts?: () => void;
}

const Cell = memo(
	({
		id,
		value,
		formula,
		style,
		isSelected,
		isInRange,
		isEditing,
		width,
		height,
		showGrid = true,
		onClick,
		onContextMenu,
		onChange,
		onKeyDown,
		onBlur,
		inputRef,
		onResize,
	}: any) => {
		const displayValue = isEditing ? formula || value : value;

		return (
			<div
				className={cn(
					"relative flex items-center overflow-hidden select-none cursor-cell h-full w-full",
					showGrid && "border-r border-b border-border dark:border-neutral-700",
					isSelected &&
						"ring-2 ring-primary ring-inset z-10 dark:ring-primary/80",
					isInRange && !isSelected && "bg-primary/10 dark:bg-primary/20",
					style?.bold && "font-bold",
					style?.italic && "italic",
					style?.underline && "underline",
				)}
				style={{
					width,
					height,
					backgroundColor: isSelected
						? undefined
						: style?.backgroundColor || undefined,
					color: style?.color || undefined,
					fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
					textAlign: style?.align || "left",
					contain: "layout style paint",
				}}
				onClick={onClick}
				onContextMenu={(e) => onContextMenu(e, id)}
			>
				{formula && !isEditing && (
					<span className="absolute top-0 right-0 text-[8px] text-green-600 dark:text-green-400 leading-none p-px">
						ƒ
					</span>
				)}
				{isEditing ? (
					<input
						ref={inputRef}
						className="absolute inset-0 w-full h-full px-1 outline-none border-none bg-background dark:bg-zinc-900 z-20 text-sm text-foreground"
						value={displayValue}
						onChange={(e) => onChange(id, e)}
						onKeyDown={(e) => onKeyDown(id, e)}
						onBlur={() => onBlur(id)}
						autoFocus
					/>
				) : (
					<span className="px-1 text-sm truncate w-full">{displayValue}</span>
				)}
				<div
					className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 z-30 opacity-0 hover:opacity-100"
					onMouseDown={(e) => onResize?.(e)}
					data-resize="col"
					data-cell={id}
				/>
			</div>
		);
	},
);
Cell.displayName = "Cell";

interface RowHeaderProps {
	rowIndex: number;
	height: number;
	isActive: boolean;
	showHeaders?: boolean;
	onResize?: (e: React.MouseEvent) => void;
}

const RowHeader = memo(
	({
		rowIndex,
		height,
		isActive,
		showHeaders = true,
		onResize,
	}: RowHeaderProps) => {
		if (!showHeaders) return null;
		return (
			<div
				className={cn(
					"relative flex items-center justify-center text-xs text-muted-foreground border-r border-b border-border dark:border-neutral-700 bg-muted/50 dark:bg-neutral-800 select-none shrink-0",
					isActive &&
						"bg-primary/15 dark:bg-primary/25 font-semibold text-primary",
				)}
				style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH, height }}
			>
				{rowIndex}
				<div
					className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary/50 z-30 opacity-0 hover:opacity-100"
					onMouseDown={onResize}
					data-resize="row"
					data-row={rowIndex}
				/>
			</div>
		);
	},
);
RowHeader.displayName = "RowHeader";

interface AutoSaveStatusProps {
	isSaving: boolean;
	lastSaved: Date | null;
	error: string | null;
	onManualSave: () => void;
}

const AutoSaveStatus = memo(
	({ isSaving, lastSaved, error, onManualSave }: AutoSaveStatusProps) => {
		const getStatusText = () => {
			if (isSaving) return "Saving...";
			if (error) return "Error saving";
			if (lastSaved) {
				const now = new Date();
				const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
				if (diff < 60) return `Saved ${diff} s ago`;
				return `Saved at ${lastSaved.toLocaleTimeString()}`;
			}
			return "Not saved";
		};

		return (
			<div className="absolute bottom-2 right-2 z-50 flex items-center gap-2 px-2 py-1 bg-background/80 backdrop-blur-sm border rounded-md shadow-sm text-xs">
				<button
					onClick={onManualSave}
					className="flex items-center gap-1 hover:text-primary transition-colors"
					disabled={isSaving}
					title="Save manually"
				>
					<Save className="h-3 w-3" />
					<span>Save</span>
				</button>
				<div className="w-px h-3 bg-border" />
				<div className="flex items-center gap-1 text-muted-foreground">
					{isSaving ? (
						<Cloud className="h-3 w-3 animate-pulse text-blue-500" />
					) : error ? (
						<Cloud className="h-3 w-3 text-red-500" />
					) : (
						<Cloud className="h-3 w-3 text-green-500" />
					)}
					<span>{getStatusText()}</span>
				</div>
			</div>
		);
	},
);
AutoSaveStatus.displayName = "AutoSaveStatus";

export const Grid = forwardRef<GridHandle, GridProps>(
	(
		{
			data,
			selectedCell,
			selectionRange,
			onSelectCell,
			onSelectRange,
			onCellChange,
			showGrid = true,
			showHeaders = true,
			freezePanes = false,
			onCopy,
			onCut,
			onPaste,
			onInsertRow,
			onDeleteRow,
			onInsertColumn,
			onDeleteColumn,
			onClearCell,
			hiddenRows = new Set(),
			charts = [],
			images = [],
			onRemoveChart,
			onRemoveImage,
			onUpdateChart,
			onUpdateImage,
			shapes = [],
			icons = [],
			onRemoveShape,
			onRemoveIcon,
			onUpdateShape,
			onUpdateIcon,
			onShowShortcuts,
			spreadsheetId,
			spreadsheetName,
			onAutoSave,
			autoSaveInterval = 30000,
			showAutoSaveStatus = true,
			zoom = 100,
			onStyleChange,
			onUndo,
			onRedo,
			onInsertComment,
			onInsertHyperlink,
		},
		ref,
	) => {
		const [editingCell, setEditingCell] = useState<string | null>(null);
		const [editValue, setEditValue] = useState("");
		const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
		const [colWidths, setColWidths] = useState<Record<string, number>>({});

		const [isDragging, setIsDragging] = useState(false);
		const [dragStart, setDragStart] = useState<string | null>(null);

		const [isSaving, setIsSaving] = useState(false);
		const [lastSaved, setLastSaved] = useState<Date | null>(null);
		const [saveError, setSaveError] = useState<string | null>(null);
		const [hasChanges, setHasChanges] = useState(false);

		const [totalRows, setTotalRows] = useState(200);
		const [totalCols, setTotalCols] = useState(52);

		const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
		const gridRef = useRef<HTMLDivElement>(null);
		const topLeftRef = useRef<HTMLDivElement>(null);
		const colHeaderRef = useRef<HTMLDivElement>(null);
		const rowHeaderRef = useRef<HTMLDivElement>(null);
		const resizeRef = useRef<{
			type: "row" | "col";
			id: string | number;
			startPos: number;
			startSize: number;
		} | null>(null);

		const [contextMenu, setContextMenu] = useState<{
			x: number;
			y: number;
			cellId: string;
		} | null>(null);

		const handleContextMenu = useCallback(
			(e: React.MouseEvent, cellId: string) => {
				e.preventDefault();
				setContextMenu({
					x: e.clientX,
					y: e.clientY,
					cellId,
				});
				onSelectCell(cellId);
			},
			[onSelectCell],
		);

		const closeContextMenu = useCallback(() => {
			setContextMenu(null);
		}, []);

		const dataRef = useRef(data);
		const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
		const isSavingRef = useRef(false);

		useEffect(() => {
			dataRef.current = data;
			setHasChanges(true);
		}, [data]);

		const performSave = useCallback(
			async (force: boolean = false) => {
				if (!onAutoSave || !spreadsheetId) return;
				if (isSavingRef.current) return;
				if (!hasChanges && !force) return;

				try {
					isSavingRef.current = true;
					setIsSaving(true);
					setSaveError(null);

					await onAutoSave(dataRef.current);

					setLastSaved(new Date());
					setHasChanges(false);
					setSaveError(null);

					if (force) {
						toast.success("Spreadsheet saved", {
							description: `"${spreadsheetName || "Untitled"}" has been successfully saved.`,
							icon: <Cloud className="h-4 w-4" />,
							duration: 3000,
						});
					}
				} catch (error) {
					console.error("Autosave failed:", error);
					setSaveError(
						error instanceof Error ? error.message : "Unknown error",
					);

					if (force) {
						toast.error("Save failed", {
							description: "Please try again later.",
							duration: 5000,
						});
					}
				} finally {
					isSavingRef.current = false;
					setIsSaving(false);
				}
			},
			[onAutoSave, spreadsheetId, spreadsheetName, hasChanges],
		);

		const forceSave = useCallback(async () => {
			await performSave(true);
		}, [performSave]);

		useImperativeHandle(
			ref,
			() => ({
				scrollToTop: () => {
					if (gridRef.current) {
						gridRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" });
					}
				},
				forceSave,
			}),
			[forceSave],
		);

		useEffect(() => {
			if (!onAutoSave || !spreadsheetId) return;

			const startAutoSaveTimer = () => {
				if (autoSaveTimerRef.current) {
					clearInterval(autoSaveTimerRef.current);
				}

				autoSaveTimerRef.current = setInterval(() => {
					performSave(false);
				}, autoSaveInterval);
			};

			startAutoSaveTimer();

			return () => {
				if (autoSaveTimerRef.current) {
					clearInterval(autoSaveTimerRef.current);
					autoSaveTimerRef.current = null;
				}
			};
		}, [onAutoSave, spreadsheetId, autoSaveInterval, performSave]);

		useEffect(() => {
			return () => {
				if (hasChanges && onAutoSave && spreadsheetId && !isSavingRef.current) {
					performSave(true).catch(console.error);
				}
			};
		}, [hasChanges, onAutoSave, spreadsheetId, performSave]);

		useEffect(() => {
			const handleBeforeUnload = (e: BeforeUnloadEvent) => {
				if (hasChanges) {
					if (onAutoSave && spreadsheetId && !isSavingRef.current) {
						try {
							const event = new CustomEvent("grid-save-before-unload", {
								detail: { data: dataRef.current },
							});
							window.dispatchEvent(event);
						} catch (error) {
							console.error("Save on unload failed:", error);
						}
					}

					e.preventDefault();
					e.returnValue =
						"You have unsaved changes. Are you sure you want to leave?";
				}
			};

			window.addEventListener("beforeunload", handleBeforeUnload);
			return () =>
				window.removeEventListener("beforeunload", handleBeforeUnload);
		}, [hasChanges, onAutoSave, spreadsheetId]);

		useEffect(() => {
			const handleSaveEvent = () => {
				if (hasChanges) {
					performSave(true);
				}
			};

			window.addEventListener("grid-save-now", handleSaveEvent);
			return () => window.removeEventListener("grid-save-now", handleSaveEvent);
		}, [hasChanges, performSave]);

		const getRowHeight = useCallback(
			(index: number) => {
				if (hiddenRows.has(index + 1)) return 0;
				return rowHeights[index + 1] || DEFAULT_ROW_HEIGHT;
			},
			[rowHeights, hiddenRows],
		);

		const getColWidth = useCallback(
			(index: number) => {
				const col = numberToColLabel(index);
				return colWidths[col] || DEFAULT_COL_WIDTH;
			},
			[colWidths],
		);

		const rowVirtualizer = useVirtualizer({
			count: totalRows,
			getScrollElement: () => gridRef.current,
			estimateSize: getRowHeight,
			overscan: OVERSCAN,
		});

		const colVirtualizer = useVirtualizer({
			count: totalCols,
			getScrollElement: () => gridRef.current,
			horizontal: true,
			estimateSize: getColWidth,
			overscan: OVERSCAN,
		});

		// Sync scroll positions
		const handleGridScroll = useCallback(() => {
			if (!gridRef.current) return;

			const { scrollLeft, scrollTop } = gridRef.current;

			// Update column headers scroll
			if (colHeaderRef.current) {
				colHeaderRef.current.scrollLeft = scrollLeft;
			}

			// Update row headers scroll
			if (rowHeaderRef.current) {
				rowHeaderRef.current.scrollTop = scrollTop;
			}
		}, []);

		useEffect(() => {
			const grid = gridRef.current;
			if (grid) {
				let rafId: number;
				const syncScroll = () => {
					handleGridScroll();
					rafId = requestAnimationFrame(syncScroll);
				};

				const onScroll = () => {
					cancelAnimationFrame(rafId);
					rafId = requestAnimationFrame(handleGridScroll);
				};

				grid.addEventListener("scroll", onScroll, { passive: true });
				return () => {
					grid.removeEventListener("scroll", onScroll);
					cancelAnimationFrame(rafId);
				};
			}
		}, [handleGridScroll]);

		const activeRow = selectedCell
			? parseInt(selectedCell.match(/\d+/)?.[0] || "0")
			: null;
		const activeCol = selectedCell ? selectedCell.match(/[A-Z]+/)?.[0] : null;

		useEffect(() => {
			const virtualRows = rowVirtualizer.getVirtualItems();
			if (virtualRows.length === 0) return;
			const lastIndex = virtualRows[virtualRows.length - 1].index;
			if (lastIndex >= totalRows - ROW_LOAD_THRESHOLD) {
				setTotalRows((prev) => prev + ROW_BATCH_SIZE);
			}
		}, [
			rowVirtualizer.getVirtualItems()[
				rowVirtualizer.getVirtualItems().length - 1
			]?.index,
			totalRows,
		]);

		useEffect(() => {
			const virtualCols = colVirtualizer.getVirtualItems();
			if (virtualCols.length === 0) return;
			const lastIndex = virtualCols[virtualCols.length - 1].index;
			if (lastIndex >= totalCols - COL_LOAD_THRESHOLD) {
				setTotalCols((prev) => prev + COL_BATCH_SIZE);
			}
		}, [
			colVirtualizer.getVirtualItems()[
				colVirtualizer.getVirtualItems().length - 1
			]?.index,
			totalCols,
		]);

		useEffect(() => {
			const handleMouseMove = (e: MouseEvent) => {
				if (!resizeRef.current) return;
				const { type, id, startPos, startSize } = resizeRef.current;
				if (type === "col") {
					const delta = e.clientX - startPos;
					const newWidth = Math.max(50, startSize + delta);
					setColWidths((prev) => ({ ...prev, [id as string]: newWidth }));
					colVirtualizer.measure();
				} else if (type === "row") {
					const delta = e.clientY - startPos;
					const newHeight = Math.max(24, startSize + delta);
					setRowHeights((prev) => ({ ...prev, [id as number]: newHeight }));
					rowVirtualizer.measure();
				}
			};

			const handleMouseUp = () => {
				resizeRef.current = null;
			};

			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
			return () => {
				window.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("mouseup", handleMouseUp);
			};
		}, [colVirtualizer, rowVirtualizer]);

		const handleResizeStart = useCallback(
			(e: React.MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				const target = e.target as HTMLElement;
				const type = target.dataset.resize as "row" | "col";
				if (type === "col") {
					const cellId = target.dataset.cell;
					if (!cellId) return;
					const col = cellId.match(/[A-Z]+/)?.[0] || "";
					resizeRef.current = {
						type: "col",
						id: col,
						startPos: e.clientX,
						startSize: colWidths[col] || DEFAULT_COL_WIDTH,
					};
				} else if (type === "row") {
					const row = target.dataset.row;
					if (!row) return;
					const rowNum = parseInt(row);
					resizeRef.current = {
						type: "row",
						id: rowNum,
						startPos: e.clientY,
						startSize: rowHeights[rowNum] || DEFAULT_ROW_HEIGHT,
					};
				}
			},
			[colWidths, rowHeights],
		);

		const handleCellMouseDown = useCallback(
			(cellId: string, event: React.MouseEvent) => {
				if (event.shiftKey && selectedCell) {
					const range = `${selectedCell}:${cellId}`;
					onSelectRange(range);
				} else {
					setIsDragging(true);
					setDragStart(cellId);
					onSelectCell(cellId);
					onSelectRange(`${cellId}:${cellId}`);
				}
			},
			[selectedCell, onSelectCell, onSelectRange],
		);

		const handleCellMouseEnter = useCallback(
			(cellId: string) => {
				if (isDragging && dragStart) {
					const range = `${dragStart}:${cellId}`;
					onSelectRange(range);
				}
			},
			[isDragging, dragStart, onSelectRange],
		);

		const handleCellMouseUp = useCallback(() => {
			setIsDragging(false);
			setDragStart(null);
		}, []);

		useEffect(() => {
			const handleGlobalMouseUp = () => {
				setIsDragging(false);
				setDragStart(null);
			};
			window.addEventListener("mouseup", handleGlobalMouseUp);
			return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
		}, []);
		useEffect(() => {
			const handleGlobalKeyDown = (e: KeyboardEvent) => {
				// Don't trigger shortcuts if user is typing in an input
				if (
					document.activeElement?.tagName === "INPUT" ||
					document.activeElement?.tagName === "TEXTAREA" ||
					editingCell
				) {
					return;
				}

				const isCtrl = e.ctrlKey || e.metaKey;

				// Bold
				if (isCtrl && e.key.toLowerCase() === "b") {
					e.preventDefault();
					onStyleChange?.({ bold: true });
				}
				// Italic
				if (isCtrl && e.key.toLowerCase() === "i") {
					e.preventDefault();
					onStyleChange?.({ italic: true });
				}
				// Underline
				if (isCtrl && e.key.toLowerCase() === "u") {
					e.preventDefault();
					onStyleChange?.({ underline: true });
				}
				// Undo
				if (isCtrl && e.key.toLowerCase() === "z") {
					e.preventDefault();
					onUndo?.();
				}
				// Redo
				if (isCtrl && e.key.toLowerCase() === "y") {
					e.preventDefault();
					onRedo?.();
				}
				// Delete / Clear
				if (e.key === "Delete" || e.key === "Backspace") {
					if (selectedCell && !editingCell) {
						onClearCell(selectedCell);
					}
				}
			};

			window.addEventListener("keydown", handleGlobalKeyDown);
			return () => window.removeEventListener("keydown", handleGlobalKeyDown);
		}, [
			editingCell,
			onStyleChange,
			onUndo,
			onRedo,
			selectedCell,
			onClearCell,
			onCopy,
			onCut,
			onPaste,
		]);

		const handleDoubleClick = useCallback(
			(cellId: string) => {
				const cellData = data[cellId];
				setEditingCell(cellId);
				setEditValue(cellData?.formula || cellData?.value || "");
				setTimeout(() => {
					const input = inputRefs.current.get(cellId);
					if (input) {
						input.focus();
						input.select();
					}
				}, 0);
			},
			[data],
		);

		const handleCellChange = useCallback(
			(cellId: string, e: React.ChangeEvent<HTMLInputElement>) => {
				setEditValue(e.target.value);
			},
			[],
		);

		const saveAndMove = useCallback(
			(cellId: string, direction: "down" | "up" | "right" | "left") => {
				if (editingCell === cellId) {
					onCellChange(cellId, editValue);
					setEditingCell(null);

					const colMatch = cellId.match(/[A-Z]+/)?.[0] || "";
					const row = parseInt(cellId.match(/\d+/)?.[0] || "1");
					const colNumber = colMatch ? colLabelToNumber(colMatch) : 0;
					let nextCellId = cellId;

					switch (direction) {
						case "down":
							nextCellId = colMatch + (row + 1);
							if (row + 1 > totalRows - ROW_LOAD_THRESHOLD) {
								setTotalRows((prev) => prev + ROW_BATCH_SIZE);
							}
							rowVirtualizer.scrollToIndex(row, {
								align: "auto",
								behavior: "smooth",
							});
							break;
						case "up":
							if (row > 1) {
								nextCellId = colMatch + (row - 1);
								rowVirtualizer.scrollToIndex(row - 2, {
									align: "auto",
									behavior: "smooth",
								});
							}
							break;
						case "right": {
							const nextColNumber = colNumber + 1;
							const nextCol = numberToColLabel(nextColNumber);
							nextCellId = nextCol + row;
							if (nextColNumber > totalCols - COL_LOAD_THRESHOLD) {
								setTotalCols((prev) => prev + COL_BATCH_SIZE);
							}
							colVirtualizer.scrollToIndex(nextColNumber, {
								align: "auto",
								behavior: "smooth",
							});
							break;
						}
						case "left":
							if (colNumber > 0) {
								const prevColNumber = colNumber - 1;
								const prevCol = numberToColLabel(prevColNumber);
								nextCellId = prevCol + row;
								colVirtualizer.scrollToIndex(prevColNumber, {
									align: "auto",
									behavior: "smooth",
								});
							}
							break;
					}

					if (nextCellId !== cellId) {
						onSelectCell(nextCellId);
					}
				}
			},
			[
				editingCell,
				editValue,
				onCellChange,
				onSelectCell,
				rowVirtualizer,
				colVirtualizer,
				totalRows,
				totalCols,
			],
		);

		const handleKeyDown = useCallback(
			(cellId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
				if (e.key === "Enter") {
					e.preventDefault();
					saveAndMove(cellId, e.shiftKey ? "up" : "down");
				} else if (e.key === "Escape") {
					e.preventDefault();
					setEditingCell(null);
					setEditValue("");
				} else if (e.key === "Tab") {
					e.preventDefault();
					saveAndMove(cellId, e.shiftKey ? "left" : "right");
				}
			},
			[saveAndMove],
		);

		const handleBlur = useCallback(
			(cellId: string) => {
				if (editingCell === cellId) {
					onCellChange(cellId, editValue);
					setEditingCell(null);
				}
			},
			[editingCell, editValue, onCellChange],
		);

		const setInputRef = useCallback(
			(cellId: string) => (element: HTMLInputElement | null) => {
				if (element) {
					inputRefs.current.set(cellId, element);
				} else {
					inputRefs.current.delete(cellId);
				}
			},
			[],
		);

		const virtualRows = rowVirtualizer.getVirtualItems();
		const virtualCols = colVirtualizer.getVirtualItems();

		return (
			<div
				className="relative w-full h-full overflow-hidden bg-background"
				style={{
					transform: `scale(${zoom / 100})`,
					transformOrigin: "top left",
					width: `${10000 / zoom}%`,
					height: `${10000 / zoom}%`,
				}}
			>
				{/* Fixed corner */}
				{showHeaders && (
					<div
						ref={topLeftRef}
						className="absolute top-0 left-0 z-30 bg-muted/50 dark:bg-neutral-800 border-r border-b border-border dark:border-neutral-700"
						style={{
							width: ROW_HEADER_WIDTH,
							height: DEFAULT_ROW_HEIGHT,
						}}
					>
						<div className="flex items-center justify-center h-full text-xs text-muted-foreground">
							#
						</div>
					</div>
				)}

				{/* Column headers container */}
				{showHeaders && (
					<div
						ref={colHeaderRef}
						className="absolute top-0 z-20 overflow-x-auto overflow-y-hidden"
						style={{
							left: showHeaders ? ROW_HEADER_WIDTH : 0,
							right: 0,
							height: DEFAULT_ROW_HEIGHT,
						}}
					>
						<div
							style={{
								width: colVirtualizer.getTotalSize(),
								height: DEFAULT_ROW_HEIGHT,
								position: "relative",
							}}
						>
							{virtualCols.map((virtualCol) => {
								const col = numberToColLabel(virtualCol.index);
								const isActive = activeCol === col;
								return (
									<div
										key={virtualCol.key}
										className={cn(
											"absolute top-0 flex items-center justify-center text-xs font-medium border-r border-b border-border dark:border-neutral-700 select-none",
											isActive
												? "bg-primary/15 dark:bg-primary/25 text-primary"
												: "bg-muted/50 dark:bg-neutral-800 text-muted-foreground",
										)}
										style={{
											left: virtualCol.start,
											width: virtualCol.size,
											height: DEFAULT_ROW_HEIGHT,
										}}
									>
										{col}
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Row headers container */}
				{showHeaders && (
					<div
						ref={rowHeaderRef}
						className="absolute left-0 z-10 overflow-y-auto overflow-x-hidden"
						style={{
							top: DEFAULT_ROW_HEIGHT,
							bottom: 0,
							width: ROW_HEADER_WIDTH,
						}}
					>
						<div
							style={{
								height: rowVirtualizer.getTotalSize(),
								width: ROW_HEADER_WIDTH,
								position: "relative",
							}}
						>
							{virtualRows.map((virtualRow) => {
								const row = virtualRow.index + 1;
								if (hiddenRows.has(row)) return null;
								const isRowActive = activeRow === row;

								return (
									<div
										key={virtualRow.key}
										className={cn(
											"absolute left-0 flex items-center justify-center text-xs border-r border-b border-border dark:border-neutral-700 select-none",
											isRowActive
												? "bg-primary/15 dark:bg-primary/25 font-semibold text-primary"
												: "bg-muted/50 dark:bg-neutral-800 text-muted-foreground",
										)}
										style={{
											width: ROW_HEADER_WIDTH,
											height: virtualRow.size,
											top: virtualRow.start,
										}}
									>
										{row}
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Main grid container */}
				<div
					ref={gridRef}
					className="absolute overflow-auto show-scrollbar"
					style={{
						top: showHeaders ? DEFAULT_ROW_HEIGHT : 0,
						left: showHeaders ? ROW_HEADER_WIDTH : 0,
						right: 0,
						bottom: 0,
						willChange: "transform, scroll-position",
						overscrollBehavior: "none",
						WebkitOverflowScrolling: "touch",
						transform: "translateZ(0)",
						backfaceVisibility: "hidden",
					}}
				>
					<div
						style={{
							height: rowVirtualizer.getTotalSize(),
							width: colVirtualizer.getTotalSize(),
							position: "relative",
						}}
					>
						{virtualRows.map((virtualRow) => {
							const row = virtualRow.index + 1;
							if (hiddenRows.has(row)) return null;
							const rowHeight = virtualRow.size;

							return (
								<React.Fragment key={virtualRow.key}>
									{virtualCols.map((virtualCol) => {
										const col = numberToColLabel(virtualCol.index);
										const cellId = `${col}${row}`;
										const cellData = data[cellId] || {
											value: "",
											style: {},
										};
										const isSelected = selectedCell === cellId;
										const isInRange = selectionRange?.includes(cellId) || false;
										const isEditing = editingCell === cellId;

										return (
											<div
												key={`${virtualRow.key}-${virtualCol.key}`}
												className="absolute"
												style={{
													left: virtualCol.start,
													top: virtualRow.start,
													width: virtualCol.size,
													height: rowHeight,
												}}
												onMouseDown={(e) => handleCellMouseDown(cellId, e)}
												onMouseEnter={() => handleCellMouseEnter(cellId)}
												onMouseUp={handleCellMouseUp}
												onDoubleClick={() => handleDoubleClick(cellId)}
											>
												<Cell
													id={cellId}
													value={cellData.value || ""}
													formula={cellData.formula}
													style={cellData.style}
													isSelected={isSelected}
													isInRange={isInRange}
													isEditing={isEditing}
													width={virtualCol.size}
													height={rowHeight}
													showGrid={showGrid}
													onClick={() => {}}
													onContextMenu={handleContextMenu}
													onChange={handleCellChange}
													onKeyDown={handleKeyDown}
													onBlur={handleBlur}
													inputRef={setInputRef(cellId)}
													onResize={handleResizeStart}
												/>
											</div>
										);
									})}
								</React.Fragment>
							);
						})}
					</div>
				</div>

				{/* Charts, images, shapes, icons */}
				<div
					className="absolute pointer-events-none"
					style={{
						left: showHeaders ? ROW_HEADER_WIDTH : 0,
						top: showHeaders ? DEFAULT_ROW_HEIGHT : 0,
						right: 0,
						bottom: 0,
					}}
				>
					{charts.map((chart) => (
						<div key={chart.id} className="pointer-events-auto">
							<ChartComponent
								chart={chart}
								data={data}
								onRemove={() => onRemoveChart?.(chart.id)}
								onUpdatePosition={(x, y) =>
									onUpdateChart?.(chart.id, { position: { x, y } })
								}
							/>
						</div>
					))}
					{images.map((image) => (
						<div key={image.id} className="pointer-events-auto">
							<ImageComponent
								id={image.id}
								src={image.src}
								position={image.position}
								size={image.size}
								onRemove={() => onRemoveImage?.(image.id)}
								onUpdatePosition={(x, y) =>
									onUpdateImage?.(image.id, { position: { x, y } })
								}
								onUpdateSize={(width, height) =>
									onUpdateImage?.(image.id, { size: { width, height } })
								}
							/>
						</div>
					))}
					{shapes.map((shape) => (
						<div key={shape.id} className="pointer-events-auto">
							<ShapeComponent
								id={shape.id}
								type={shape.type}
								position={shape.position}
								size={shape.size}
								style={shape.style}
								onRemove={() => onRemoveShape?.(shape.id)}
								onUpdatePosition={(x, y) =>
									onUpdateShape?.(shape.id, { position: { x, y } })
								}
							/>
						</div>
					))}
					{icons.map((icon) => (
						<div key={icon.id} className="pointer-events-auto">
							<IconComponent
								id={icon.id}
								iconName={icon.iconName}
								position={icon.position}
								size={icon.size}
								color={icon.color}
								onRemove={() => onRemoveIcon?.(icon.id)}
								onUpdatePosition={(x, y) =>
									onUpdateIcon?.(icon.id, { position: { x, y } })
								}
							/>
						</div>
					))}
				</div>

				{showAutoSaveStatus && onAutoSave && spreadsheetId && (
					<AutoSaveStatus
						isSaving={isSaving}
						lastSaved={lastSaved}
						error={saveError}
						onManualSave={forceSave}
					/>
				)}

				{contextMenu && (
					<div
						className="fixed z-[100]"
						style={{ left: contextMenu.x, top: contextMenu.y }}
					>
						<CellContextMenu
							onCopy={() => {
								onCopy();
								closeContextMenu();
							}}
							onCut={() => {
								onCut();
								closeContextMenu();
							}}
							onPaste={() => {
								onPaste();
								closeContextMenu();
							}}
							onInsertRowAbove={() => {
								const row = parseInt(
									contextMenu.cellId.match(/\d+/)?.[0] || "1",
								);
								onInsertRow(row);
								closeContextMenu();
							}}
							onInsertRowBelow={() => {
								const row = parseInt(
									contextMenu.cellId.match(/\d+/)?.[0] || "1",
								);
								onInsertRow(row + 1);
								closeContextMenu();
							}}
							onDeleteRow={() => {
								const row = parseInt(
									contextMenu.cellId.match(/\d+/)?.[0] || "1",
								);
								onDeleteRow(row);
								closeContextMenu();
							}}
							onInsertColumnLeft={() => {
								const col = contextMenu.cellId.match(/[A-Z]+/)?.[0] || "A";
								onInsertColumn(colLabelToNumber(col));
								closeContextMenu();
							}}
							onInsertColumnRight={() => {
								const col = contextMenu.cellId.match(/[A-Z]+/)?.[0] || "A";
								onInsertColumn(colLabelToNumber(col) + 1);
								closeContextMenu();
							}}
							onDeleteColumn={() => {
								const col = contextMenu.cellId.match(/[A-Z]+/)?.[0] || "A";
								onDeleteColumn(colLabelToNumber(col));
								closeContextMenu();
							}}
							onClearCell={() => {
								onClearCell(contextMenu.cellId);
								closeContextMenu();
							}}
							onInsertComment={() => {
								onInsertComment?.();
								closeContextMenu();
							}}
							onInsertHyperlink={() => {
								onInsertHyperlink?.();
								closeContextMenu();
							}}
							onShowShortcuts={() => {
								onShowShortcuts?.();
								closeContextMenu();
							}}
						>
							<div className="w-0 h-0 invisible" />
						</CellContextMenu>
						{/* Overlay to handle closing on click outside */}
						<div
							className="fixed inset-0 z-[-1]"
							onClick={closeContextMenu}
							onContextMenu={(e) => {
								e.preventDefault();
								closeContextMenu();
							}}
						/>
					</div>
				)}
			</div>
		);
	},
);

Grid.displayName = "Grid";
