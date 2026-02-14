"use client";

import React, { memo, useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { SheetData, CellData } from "@/hooks/use-spreadsheet";
import { useVirtualizer } from "@tanstack/react-virtual";

interface GridProps {
	data: SheetData;
	selectedCell: string | null;
	onSelectCell: (cellId: string) => void;
	onCellChange: (cellId: string, value: string) => void;
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
	onClick: () => void;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onBlur: () => void;
	inputRef?: React.RefCallback<HTMLInputElement>;
	onResize?: (e: React.MouseEvent) => void;
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
		onClick,
		onChange,
		onKeyDown,
		onBlur,
		inputRef,
		onResize,
	}: CellProps) => {
		const displayValue = isEditing ? formula || value : value;

		return (
			<div
				className={cn(
					"border-r border-b flex items-center relative group",
					isSelected ? "ring-2 ring-primary z-10" : "",
					isEditing && "ring-2 ring-blue-500 z-20",
				)}
				style={{
					backgroundColor: style?.backgroundColor,
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
						"w-full h-full px-1 outline-none bg-transparent",
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
						className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"
						title="Contains formula"
					/>
				)}

				<div
					className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 opacity-0 group-hover:opacity-100"
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
	onResize?: (e: React.MouseEvent) => void;
}

const RowHeader = memo(({ rowIndex, height, onResize }: RowHeaderProps) => {
	return (
		<div
			className="w-10 shrink-0 bg-muted border-r border-b flex items-center justify-center font-bold text-xs text-muted-foreground sticky left-0 z-10 group"
			style={{ height: `${height}px`, minHeight: `${height}px` }}
		>
			{rowIndex}
			<div
				className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-500 opacity-0 group-hover:opacity-100"
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
}: GridProps) => {
	const [editingCell, setEditingCell] = useState<string | null>(null);
	const [editValue, setEditValue] = useState<string>("");
	const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
	const [colWidths, setColWidths] = useState<Record<string, number>>({});
	const [totalRows, setTotalRows] = useState(100);
	const [totalCols, setTotalCols] = useState(26); // Začíname s A-Z

	const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
	const gridRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const resizeRef = useRef<{
		type: "row" | "col";
		id: string | number;
		startPos: number;
		startSize: number;
	} | null>(null);

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
		estimateSize: (index) => getRowHeight(index),
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
		getScrollElement: () => headerRef.current,
		horizontal: true,
		estimateSize: (index) => getColWidth(index),
		overscan: 10, // Zvýšime overscan pre plynulejšie scrollovanie
		rangeExtractor: (range) => {
			// Dynamické načítanie stĺpcov (A-Z, AA-AZ, BA-BZ, atď.)
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
			}
		};

		const grid = gridRef.current;
		if (grid) {
			grid.addEventListener("scroll", handleScroll);
			return () => grid.removeEventListener("scroll", handleScroll);
		}
	}, []);

	// Pridáme aj scroll event pre header aby sme mohli scrollovať aj z neho
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

				// Extrahujeme stĺpec z cellId (napr. "AA1" -> "AA")
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

				// Extrahujeme stĺpec a riadok z cellId
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
						// Scroll to the new column
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

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header - oddelený pre lepšiu virtualizáciu */}
			<div
				ref={headerRef}
				className="overflow-auto border-b hide-scrollbar"
				style={{ height: DEFAULT_ROW_HEIGHT }}
			>
				<div
					className="flex"
					style={{ width: colVirtualizer.getTotalSize() + ROW_HEADER_WIDTH }}
				>
					<div
						className="w-10 shrink-0 bg-muted border-r flex items-center justify-center font-bold text-xs text-muted-foreground sticky left-0 z-30"
						style={{ height: DEFAULT_ROW_HEIGHT }}
					>
						#
					</div>
					<div
						style={{
							width: colVirtualizer.getTotalSize(),
							position: "relative",
							height: DEFAULT_ROW_HEIGHT,
						}}
					>
						{colVirtualizer.getVirtualItems().map((virtualCol) => {
							const col = numberToColLabel(virtualCol.index);
							return (
								<div
									key={col}
									className="absolute top-0 h-full bg-muted border-r flex items-center justify-center font-bold text-xs text-muted-foreground group"
									style={{
										left: 0,
										width: virtualCol.size,
										transform: `translateX(${virtualCol.start}px)`,
										height: DEFAULT_ROW_HEIGHT,
									}}
								>
									{col}
									<div
										className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 opacity-0 group-hover:opacity-100"
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

			{/* Grid s virtuálnymi riadkami */}
			<div ref={gridRef} className="flex-1 overflow-auto bg-background">
				<div
					style={{
						width: colVirtualizer.getTotalSize() + ROW_HEADER_WIDTH,
						height: rowVirtualizer.getTotalSize(),
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const row = virtualRow.index + 1;
						const rowHeight = virtualRow.size;

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
									height={rowHeight}
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
													isSelected={selectedCell === cellId}
													isEditing={isEditing}
													onClick={() => handleCellClick(cellId)}
													onChange={(e) => handleCellChange(cellId, e)}
													onKeyDown={(e) => handleKeyDown(cellId, e)}
													onBlur={() => handleBlur(cellId)}
													inputRef={setInputRef(cellId)}
													onResize={handleResizeStart}
												/>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
