"use client";

import React, { memo, useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { SheetData, CellData, ChartData, ImageData } from "@/hooks/use-spreadsheet";
import { useVirtualizer } from "@tanstack/react-virtual";

import { CellContextMenu } from "./CellContextMenu";
import { ChartComponent } from "./ChartComponent";
import { ImageComponent } from "./ImageComponent";
import { ShapeComponent } from "./ShapeComponent";
import { IconComponent } from "./IconComponent";
import { ShapeData, IconData } from "@/hooks/use-spreadsheet";

interface GridProps {
	data: SheetData;
	selectedCell: string | null;
	onSelectCell: (cellId: string) => void;
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
}

const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_COL_WIDTH = 100;
const ROW_HEADER_WIDTH = 40;
const BATCH_SIZE = 50;
const OVERSCAN = 10;

// Funkcia pre konverziu čísla na Excel-style stĺpec (A, B, C, ..., Z, AA, AB, ...)
const numberToColLabel = (index: number): string => {
	let result = "";
	let num = index + 1; // Prevod na 1-based index

	while (num > 0) {
		num--; // Posun pre 0-based
		const remainder = num % 26;
		result = String.fromCharCode(65 + remainder) + result;
		num = Math.floor(num / 26);
	}

	return result;
};

// Funkcia pre konverziu Excel-style stĺpca na číslo (A->0, B->1, ..., Z->25, AA->26, ...)
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
	// Context Menu Props
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
}

const Cell = memo(
	({
		id,
		value,
		formula,
		style,
		isSelected,
		isEditing,
		width,
		height,
		showGrid = true,
		onClick,
		onChange,
		onKeyDown,
		onBlur,
		inputRef,
		onResize,
		onCopy,
		onCut,
		onPaste,
		onInsertRowAbove,
		onInsertRowBelow,
		onDeleteRow,
		onInsertColumnLeft,
		onInsertColumnRight,
		onDeleteColumn,
		onClearCell,
	}: CellProps) => {
		const displayValue = isEditing ? formula || value : value;

		return (
			<CellContextMenu
				onCopy={onCopy}
				onCut={onCut}
				onPaste={onPaste}
				onInsertRowAbove={onInsertRowAbove}
				onInsertRowBelow={onInsertRowBelow}
				onDeleteRow={onDeleteRow}
				onInsertColumnLeft={onInsertColumnLeft}
				onInsertColumnRight={onInsertColumnRight}
				onDeleteColumn={onDeleteColumn}
				onClearCell={onClearCell}
			>
				<div
					className={cn(
						"flex items-center relative group transition-all duration-75",
						isSelected ? "ring-2 ring-primary z-10 shadow-sm shadow-primary/20" : "",
						isEditing && "ring-2 ring-blue-500 z-20",
						showGrid ? "border-r border-b" : "border-0",
					)}
					style={{
						backgroundColor: style?.backgroundColor || (isSelected ? "hsl(var(--primary) / 0.05)" : undefined),
						width: `${width}px`,
						height: `${height}px`,
						minWidth: `${width}px`,
						maxWidth: `${width}px`,
					}}
					onClick={onClick}
				>
					<input
						ref={inputRef}
						className={cn(
							"w-full h-full px-2 outline-none bg-transparent text-[13px]",
							style?.bold && "font-bold",
							style?.italic && "italic",
							style?.underline && "underline",
							style?.align === "center" && "text-center",
							style?.align === "right" && "text-right",
							style?.align === "left" && "text-left",
						)}
						style={{ color: style?.color }}
						value={displayValue}
						onChange={onChange}
						onKeyDown={onKeyDown}
						onBlur={onBlur}
						autoFocus={isEditing}
					/>

					{formula && !isEditing && (
						<div
							className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-l-[6px] border-t-green-500 border-l-transparent"
							title="Contains formula"
						/>
					)}

					{/* Resize handle for columns */}
					<div
						className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary transition-colors opacity-0 group-hover:opacity-100 z-30"
						onMouseDown={(e) => onResize?.(e)}
						data-resize="col"
						data-cell={id}
					/>
				</div>
			</CellContextMenu>
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

const RowHeader = memo(({ rowIndex, height, isActive, showHeaders = true, onResize }: RowHeaderProps) => {
	if (!showHeaders) return null;

	return (
		<div
			className={cn(
				"w-10 shrink-0 border-r border-b flex items-center justify-center font-medium text-[11px] transition-colors sticky left-0 z-10 group",
				isActive ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
			)}
			style={{ height: `${height}px`, minHeight: `${height}px` }}
		>
			{rowIndex}
			{/* Resize handle for rows */}
			<div
				className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-primary transition-colors opacity-0 group-hover:opacity-100 z-20"
				onMouseDown={onResize}
				data-resize="row"
				data-row={rowIndex}
			/>
		</div>
	);
});

RowHeader.displayName = "RowHeader";

export const Grid = ({
	data,
	selectedCell,
	onSelectCell,
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
}: GridProps) => {
	const [editingCell, setEditingCell] = useState<string | null>(null);
	const [editValue, setEditValue] = useState<string>("");
	const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
	const [colWidths, setColWidths] = useState<Record<string, number>>({});
	const [totalRows, setTotalRows] = useState(100);
	const [totalCols, setTotalCols] = useState(26);
	const [scrollPosition, setScrollPosition] = useState({ left: 0, top: 0 });

	const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
	const gridRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const resizeRef = useRef<{
		type: "row" | "col";
		id: string | number;
		startPos: number;
		startSize: number;
	} | null>(null);

	// Get active row and col for highlighting
	const activeRow = selectedCell ? parseInt(selectedCell.match(/\d+/)?.[0] || "0") : null;
	const activeCol = selectedCell ? selectedCell.match(/[A-Z]+/)?.[0] : null;

	// Funkcia pre získanie výšky riadku
	const getRowHeight = useCallback(
		(index: number) => {
			return rowHeights[index + 1] || DEFAULT_ROW_HEIGHT;
		},
		[rowHeights],
	);

	// Funkcia pre získanie šírky stĺpca
	const getColWidth = useCallback(
		(index: number) => {
			const col = numberToColLabel(index);
			return colWidths[col] || DEFAULT_COL_WIDTH;
		},
		[colWidths],
	);

	// Virtualizér pre riadky
	const rowVirtualizer = useVirtualizer({
		count: totalRows,
		getScrollElement: () => gridRef.current,
		estimateSize: (index) => {
			if (hiddenRows.has(index + 1)) return 0;
			return getRowHeight(index);
		},
		overscan: OVERSCAN,
		rangeExtractor: (range) => {
			// Dynamické načítanie riadkov
			if (range.endIndex > totalRows - BATCH_SIZE) {
				setTotalRows((prev) => prev + BATCH_SIZE);
			}
			return Array.from(
				{ length: range.endIndex - range.startIndex + 1 },
				(_, i) => range.startIndex + i,
			);
		},
	});

	// Virtualizér pre stĺpce
	const colVirtualizer = useVirtualizer({
		count: totalCols,
		getScrollElement: () => gridRef.current,
		horizontal: true,
		estimateSize: (index) => getColWidth(index),
		overscan: 10,
		rangeExtractor: (range) => {
			// Dynamické načítanie stĺpcov
			if (range.endIndex > totalCols - 10) {
				setTotalCols((prev) => prev + 10);
			}
			return Array.from(
				{ length: range.endIndex - range.startIndex + 1 },
				(_, i) => range.startIndex + i,
			);
		},
	});

	// Sync scroll medzi gridom a headerom
	useEffect(() => {
		const handleScroll = () => {
			if (headerRef.current && gridRef.current) {
				headerRef.current.scrollLeft = gridRef.current.scrollLeft;
				setScrollPosition({
					left: gridRef.current.scrollLeft,
					top: gridRef.current.scrollTop,
				});
			}
		};

		const grid = gridRef.current;
		if (grid) {
			grid.addEventListener("scroll", handleScroll);
			return () => grid.removeEventListener("scroll", handleScroll);
		}
	}, []);

	useEffect(() => {
		const handleHeaderScroll = () => {
			if (headerRef.current && gridRef.current) {
				gridRef.current.scrollLeft = headerRef.current.scrollLeft;
			}
		};

		const header = headerRef.current;
		if (header) {
			header.addEventListener("scroll", handleHeaderScroll);
			return () => header.removeEventListener("scroll", handleHeaderScroll);
		}
	}, []);

	// Resize handling
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

	const handleCellClick = useCallback(
		(cellId: string) => {
			onSelectCell(cellId);
		},
		[onSelectCell],
	);

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
			if (editingCell === cellId) {
				setEditValue(e.target.value);
			}
		},
		[editingCell],
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
						rowVirtualizer.scrollToIndex(row, { align: "auto" });
						break;
					case "up":
						if (row > 1) {
							nextCellId = colMatch + (row - 1);
							rowVirtualizer.scrollToIndex(row - 2, { align: "auto" });
						}
						break;
					case "right":
						const nextColNumber = colNumber + 1;
						const nextCol = numberToColLabel(nextColNumber);
						nextCellId = nextCol + row;
						if (gridRef.current) {
							const scrollLeft =
								colVirtualizer.getOffsetForIndex(nextColNumber) || 0;
							gridRef.current.scrollLeft = scrollLeft as unknown as number;
						}
						break;
					case "left":
						if (colNumber > 0) {
							const prevColNumber = colNumber - 1;
							const prevCol = numberToColLabel(prevColNumber);
							nextCellId = prevCol + row;
							if (gridRef.current) {
								const scrollLeft =
									colVirtualizer.getOffsetForIndex(prevColNumber) || 0;
								gridRef.current.scrollLeft = scrollLeft as unknown as number;
							}
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

	// Render header
	const renderHeader = () => {
		if (!showHeaders) return null;

		return (
			<div
				ref={headerRef}
				className="overflow-auto border-b hide-scrollbar"
				style={{ height: DEFAULT_ROW_HEIGHT }}
			>
				<div
					className="flex"
					style={{ width: colVirtualizer.getTotalSize() + (showHeaders ? ROW_HEADER_WIDTH : 0) }}
				>
					{showHeaders && (
						<div
							className="w-10 shrink-0 bg-muted border-r flex items-center justify-center font-bold text-xs text-muted-foreground sticky left-0 z-30"
							style={{ height: DEFAULT_ROW_HEIGHT }}
						>
							#
						</div>
					)}
					<div
						style={{
							width: colVirtualizer.getTotalSize(),
							position: "relative",
							height: DEFAULT_ROW_HEIGHT,
						}}
					>
						{colVirtualizer.getVirtualItems().map((virtualCol) => {
							const col = numberToColLabel(virtualCol.index);
							const isActive = activeCol === col;
							return (
								<div
									key={col}
									className={cn(
										"absolute top-0 h-full border-r flex items-center justify-center font-medium text-[11px] transition-colors group",
										isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
									)}
									style={{
										left: 0,
										width: virtualCol.size,
										transform: `translateX(${virtualCol.start}px)`,
										height: DEFAULT_ROW_HEIGHT,
									}}
								>
									{col}
									<div
										className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary transition-colors opacity-0 group-hover:opacity-100 z-20"
										onMouseDown={handleResizeStart}
										data-resize="col"
										data-cell={`${col}1`}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header */}
			{renderHeader()}

			{/* Grid s virtuálnymi riadkami */}
			<div ref={gridRef} className="flex-1 overflow-auto bg-background selection:bg-primary/20">
				<div
					style={{
						width: colVirtualizer.getTotalSize() + (showHeaders ? ROW_HEADER_WIDTH : 0),
						height: rowVirtualizer.getTotalSize(),
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const row = virtualRow.index + 1;
						if (hiddenRows.has(row)) return null;

						const rowHeight = virtualRow.size;
						const isRowActive = activeRow === row;

						return (
							<div
								key={row}
								className="flex absolute"
								style={{
									top: 0,
									left: 0,
									width: "100%",
									height: rowHeight,
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<RowHeader
									rowIndex={row}
									isActive={isRowActive}
									height={rowHeight}
									showHeaders={showHeaders}
									onResize={handleResizeStart}
								/>

								<div
									style={{
										width: colVirtualizer.getTotalSize(),
										position: "relative",
										height: rowHeight,
									}}
								>
									{colVirtualizer.getVirtualItems().map((virtualCol) => {
										const col = numberToColLabel(virtualCol.index);
										const cellId = `${col}${row}`;
										const cellData = data[cellId] || { value: "", style: {} };
										const isEditing = editingCell === cellId;

										return (
											<div
												key={cellId}
												className="absolute"
												style={{
													left: 0,
													width: virtualCol.size,
													transform: `translateX(${virtualCol.start}px)`,
													height: rowHeight,
												}}
												onDoubleClick={() => handleDoubleClick(cellId)}
											>
												<Cell
													id={cellId}
													value={cellData.value || ""}
													formula={cellData.formula}
													style={cellData.style}
													width={virtualCol.size}
													height={rowHeight}
													showGrid={showGrid}
													isSelected={selectedCell === cellId}
													isEditing={isEditing}
													onClick={() => handleCellClick(cellId)}
													onChange={(e) => handleCellChange(cellId, e)}
													onKeyDown={(e) => handleKeyDown(cellId, e)}
													onBlur={() => handleBlur(cellId)}
													inputRef={setInputRef(cellId)}
													onResize={handleResizeStart}
													// Context Menu Actions
													onCopy={onCopy}
													onCut={onCut}
													onPaste={onPaste}
													onInsertRowAbove={() => onInsertRow(row)}
													onInsertRowBelow={() => onInsertRow(row + 1)}
													onDeleteRow={() => onDeleteRow(row)}
													onInsertColumnLeft={() => onInsertColumn(virtualCol.index)}
													onInsertColumnRight={() => onInsertColumn(virtualCol.index + 1)}
													onDeleteColumn={() => onDeleteColumn(virtualCol.index)}
													onClearCell={() => onClearCell(cellId)}
												/>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}

					{/* Charts Layer */}
					{charts.map((chart) => (
						<ChartComponent
							key={chart.id}
							{...chart}
							data={data}
							onRemove={() => onRemoveChart?.(chart.id)}
							onUpdatePosition={(x, y) => onUpdateChart?.(chart.id, { position: { x, y } })}
						/>
					))}

					{/* Images Layer */}
					{images.map((image) => (
						<ImageComponent
							key={image.id}
							{...image}
							onRemove={() => onRemoveImage?.(image.id)}
							onUpdatePosition={(x, y) => onUpdateImage?.(image.id, { position: { x, y } })}
							onUpdateSize={(width, height) => onUpdateImage?.(image.id, { size: { width, height } })}
						/>
					))}

					{/* Floating Shapes */}
					{shapes.map((shape) => (
						<ShapeComponent
							key={shape.id}
							{...shape}
							onRemove={() => onRemoveShape?.(shape.id)}
							onUpdatePosition={(x, y) => onUpdateShape?.(shape.id, { position: { x, y } })}
						/>
					))}

					{/* Floating Icons */}
					{icons.map((icon) => (
						<IconComponent
							key={icon.id}
							{...icon}
							onRemove={() => onRemoveIcon?.(icon.id)}
							onUpdatePosition={(x, y) => onUpdateIcon?.(icon.id, { position: { x, y } })}
						/>
					))}
				</div>
			</div>
		</div>
	);
};