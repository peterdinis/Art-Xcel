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
  onShowShortcuts?: () => void;
}

const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_COL_WIDTH = 100;
const ROW_HEADER_WIDTH = 40;
// Veľkosť dávky pre lazy loading — pridaj ďalšie riadky/stĺpce keď
// scrollujeme blízko konca
const ROW_BATCH_SIZE = 100;
const COL_BATCH_SIZE = 26;
// Koľko riadkov/stĺpcov pred koncom začíname načítavať ďalšie
const ROW_LOAD_THRESHOLD = 30;
const COL_LOAD_THRESHOLD = 10;
const OVERSCAN = 5;

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
    onShowShortcuts,
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
        onShowShortcuts={onShowShortcuts}
      >
        <div
          className={cn(
            "relative flex items-center overflow-hidden select-none",
            showGrid && "border-r border-b border-gray-200",
            isSelected && "ring-2 ring-blue-500 ring-inset z-10",
            style?.bold && "font-bold",
            style?.italic && "italic",
            style?.underline && "underline",
          )}
          style={{
            width,
            minWidth: width,
            maxWidth: width,
            height,
            backgroundColor: style?.backgroundColor || undefined,
            color: style?.color || undefined,
            fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
            textAlign: style?.align || "left",
          }}
          onClick={onClick}
        >
          {formula && !isEditing && (
            <span className="absolute top-0 right-0 text-[8px] text-green-600 leading-none p-px">
              ƒ
            </span>
          )}
          {isEditing ? (
            <input
              ref={inputRef}
              className="absolute inset-0 w-full h-full px-1 outline-none border-none bg-white z-20 text-sm"
              value={displayValue}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
            />
          ) : (
            <span className="px-1 text-sm truncate w-full">{displayValue}</span>
          )}
          {/* Resize handle for columns */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-30 opacity-0 hover:opacity-100"
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
        "relative flex items-center justify-center text-xs text-gray-500 border-r border-b border-gray-200 bg-gray-50 select-none shrink-0",
        isActive && "bg-blue-100 font-semibold text-blue-700",
      )}
      style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH, height }}
    >
      {rowIndex}
      {/* Resize handle for rows */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-400 z-30 opacity-0 hover:opacity-100"
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
  onShowShortcuts,
}: GridProps) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const [colWidths, setColWidths] = useState<Record<string, number>>({});

  // ── Infinite grid dimensions ──────────────────────────────────────────────
  // Začíname s rozumnou veľkosťou a expandujeme keď sa scrolluje k okraju.
  const [totalRows, setTotalRows] = useState(200);
  const [totalCols, setTotalCols] = useState(52);

  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{
    type: "row" | "col";
    id: string | number;
    startPos: number;
    startSize: number;
  } | null>(null);

  const activeRow = selectedCell ? parseInt(selectedCell.match(/\d+/)?.[0] || "0") : null;
  const activeCol = selectedCell ? selectedCell.match(/[A-Z]+/)?.[0] : null;

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

  // ── Virtualizéry ──────────────────────────────────────────────────────────
  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => gridRef.current,
    estimateSize: getRowHeight,
    overscan: OVERSCAN,
    // Bez rangeExtractor — expanzia sa deje v useEffect nižšie
  });

  const colVirtualizer = useVirtualizer({
    count: totalCols,
    getScrollElement: () => gridRef.current,
    horizontal: true,
    estimateSize: getColWidth,
    overscan: OVERSCAN,
  });

  // ── Infinite scroll: expanduj grid keď sme blízko konca ──────────────────
  useEffect(() => {
    const virtualRows = rowVirtualizer.getVirtualItems();
    if (virtualRows.length === 0) return;
    const lastIndex = virtualRows[virtualRows.length - 1].index;
    if (lastIndex >= totalRows - ROW_LOAD_THRESHOLD) {
      setTotalRows((prev) => prev + ROW_BATCH_SIZE);
    }
  }, [rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.index, totalRows]);

  useEffect(() => {
    const virtualCols = colVirtualizer.getVirtualItems();
    if (virtualCols.length === 0) return;
    const lastIndex = virtualCols[virtualCols.length - 1].index;
    if (lastIndex >= totalCols - COL_LOAD_THRESHOLD) {
      setTotalCols((prev) => prev + COL_BATCH_SIZE);
    }
  }, [colVirtualizer.getVirtualItems()[colVirtualizer.getVirtualItems().length - 1]?.index, totalCols]);

  // ── Sync scroll header ↔ grid ─────────────────────────────────────────────
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.scrollLeft = grid.scrollLeft;
      }
    };

    grid.addEventListener("scroll", handleScroll, { passive: true });
    return () => grid.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleHeaderScroll = () => {
      if (gridRef.current) {
        gridRef.current.scrollLeft = header.scrollLeft;
      }
    };

    header.addEventListener("scroll", handleHeaderScroll, { passive: true });
    return () => header.removeEventListener("scroll", handleHeaderScroll);
  }, []);

  // ── Resize handling ───────────────────────────────────────────────────────
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
            // Ensure grid expanduje ak ideme za aktuálny limit
            if (row + 1 > totalRows - ROW_LOAD_THRESHOLD) {
              setTotalRows((prev) => prev + ROW_BATCH_SIZE);
            }
            rowVirtualizer.scrollToIndex(row, { align: "auto", behavior: "smooth" });
            break;
          case "up":
            if (row > 1) {
              nextCellId = colMatch + (row - 1);
              rowVirtualizer.scrollToIndex(row - 2, { align: "auto", behavior: "smooth" });
            }
            break;
          case "right": {
            const nextColNumber = colNumber + 1;
            const nextCol = numberToColLabel(nextColNumber);
            nextCellId = nextCol + row;
            if (nextColNumber > totalCols - COL_LOAD_THRESHOLD) {
              setTotalCols((prev) => prev + COL_BATCH_SIZE);
            }
            colVirtualizer.scrollToIndex(nextColNumber, { align: "auto", behavior: "smooth" });
            break;
          }
          case "left":
            if (colNumber > 0) {
              const prevColNumber = colNumber - 1;
              const prevCol = numberToColLabel(prevColNumber);
              nextCellId = prevCol + row;
              colVirtualizer.scrollToIndex(prevColNumber, { align: "auto", behavior: "smooth" });
            }
            break;
        }

        if (nextCellId !== cellId) {
          onSelectCell(nextCellId);
        }
      }
    },
    [editingCell, editValue, onCellChange, onSelectCell, rowVirtualizer, colVirtualizer, totalRows, totalCols],
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

  // ── Column header ─────────────────────────────────────────────────────────
  const renderHeader = () => {
    if (!showHeaders) return null;

    return (
      <div className="flex sticky top-0 z-20 bg-gray-50 border-b border-gray-200 overflow-hidden shrink-0" ref={headerRef}>
        {/* Corner cell */}
        <div
          className="shrink-0 border-r border-b border-gray-200 bg-gray-100"
          style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH, height: DEFAULT_ROW_HEIGHT }}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-400">#</div>
        </div>

        {/* Virtuálny kontajner pre hlavičky stĺpcov */}
        <div
          className="relative overflow-hidden"
          style={{
            width: colVirtualizer.getTotalSize(),
            height: DEFAULT_ROW_HEIGHT,
          }}
        >
          {colVirtualizer.getVirtualItems().map((virtualCol) => {
            const col = numberToColLabel(virtualCol.index);
            const isActive = activeCol === col;
            return (
              <div
                key={virtualCol.key}
                className={cn(
                  "absolute top-0 flex items-center justify-center text-xs font-medium border-r border-gray-200 select-none",
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-600",
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
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col w-full h-full overflow-hidden">
      {/* Sticky column header */}
      {renderHeader()}

      {/*
        Hlavný scroll kontajner — použijeme will-change + overscroll-behavior
        pre maximálnu plynulosť. overflow: scroll je dôležité (nie auto)
        aby TanStack Virtual správne detekovalo scroll udalosti.
      */}
      <div
        ref={gridRef}
        className="flex-1 overflow-scroll relative"
        style={{
          willChange: "transform",
          overscrollBehavior: "none",
          // WebKit smooth momentum scrolling
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Celkový virtuálny priestor — TanStack Virtual ho potrebuje */}
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: colVirtualizer.getTotalSize() + (showHeaders ? ROW_HEADER_WIDTH : 0),
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
                key={virtualRow.key}
                className="absolute left-0"
                style={{
                  width: colVirtualizer.getTotalSize() + (showHeaders ? ROW_HEADER_WIDTH : 0),
                  height: rowHeight,
                  // GPU-accelerated positioning
                  transform: `translateY(${virtualRow.start}px)`,
                  willChange: "transform",
                }}
              >
                <div className="flex w-full h-full">
                  {/* Row header — sticky left */}
                  {showHeaders && (
                    <div
                      className="sticky left-0 z-10 shrink-0"
                      style={{ width: ROW_HEADER_WIDTH }}
                    >
                      <RowHeader
                        rowIndex={row}
                        height={rowHeight}
                        isActive={isRowActive}
                        showHeaders={showHeaders}
                        onResize={handleResizeStart}
                      />
                    </div>
                  )}

                  {/* Virtuálne bunky v riadku */}
                  <div
                    className="relative"
                    style={{
                      width: colVirtualizer.getTotalSize(),
                      height: rowHeight,
                    }}
                  >
                    {colVirtualizer.getVirtualItems().map((virtualCol) => {
                      const col = numberToColLabel(virtualCol.index);
                      const cellId = `${col}${row}`;
                      const cellData = data[cellId] || { value: "", style: {} };
                      const isSelected = selectedCell === cellId;
                      const isEditing = editingCell === cellId;

                      return (
                        <div
                          key={virtualCol.key}
                          className="absolute top-0 h-full"
                          style={{
                            transform: `translateX(${virtualCol.start}px)`,
                            width: virtualCol.size,
                          }}
                          onDoubleClick={() => handleDoubleClick(cellId)}
                        >
                          <Cell
                            id={cellId}
                            value={cellData.value || ""}
                            formula={cellData.formula}
                            style={cellData.style}
                            isSelected={isSelected}
                            isEditing={isEditing}
                            width={virtualCol.size}
                            height={rowHeight}
                            showGrid={showGrid}
                            onClick={() => handleCellClick(cellId)}
                            onChange={(e) => handleCellChange(cellId, e)}
                            onKeyDown={(e) => handleKeyDown(cellId, e)}
                            onBlur={() => handleBlur(cellId)}
                            inputRef={setInputRef(cellId)}
                            onResize={handleResizeStart}
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
                            onShowShortcuts={onShowShortcuts}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Charts Layer */}
          {charts.map((chart) => (
            <ChartComponent
              key={chart.id}
              chart={chart}
              data={data}
              onRemove={() => onRemoveChart?.(chart.id)}
              onUpdatePosition={(x, y) => onUpdateChart?.(chart.id, { position: { x, y } })}
            />
          ))}

          {/* Images Layer */}
          {images.map((image) => (
            <ImageComponent
              key={image.id}
              id={image.id}
              src={image.src}
              position={image.position}
              size={image.size}
              onRemove={() => onRemoveImage?.(image.id)}
              onUpdatePosition={(x, y) => onUpdateImage?.(image.id, { position: { x, y } })}
              onUpdateSize={(width, height) => onUpdateImage?.(image.id, { size: { width, height } })}
            />
          ))}

          {/* Floating Shapes */}
          {shapes.map((shape) => (
            <ShapeComponent
              key={shape.id}
              id={shape.id}
              type={shape.type}
              position={shape.position}
              size={shape.size}
              style={shape.style}
              onRemove={() => onRemoveShape?.(shape.id)}
              onUpdatePosition={(x, y) => onUpdateShape?.(shape.id, { position: { x, y } })}
            />
          ))}

          {/* Floating Icons */}
          {icons.map((icon) => (
            <IconComponent
              key={icon.id}
              id={icon.id}
              iconName={icon.iconName}
              position={icon.position}
              size={icon.size}
              color={icon.color}
              onRemove={() => onRemoveIcon?.(icon.id)}
              onUpdatePosition={(x, y) => onUpdateIcon?.(icon.id, { position: { x, y } })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};