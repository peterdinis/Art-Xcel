import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { SheetData, CellData } from '@/hooks/use-spreadsheet';

interface GridProps {
    data: SheetData;
    selectedCell: string | null;
    onSelectCell: (cellId: string) => void;
    onCellChange: (cellId: string, value: string) => void;
}

const ROWS = 100;
const COLS = 26; // A-Z

const colLabel = (index: number) => String.fromCharCode(65 + index);

const Cell = memo(({ id, value, style, isSelected, onClick, onChange }: {
    id: string,
    value: string,
    style?: CellData['style'],
    isSelected: boolean,
    onClick: () => void,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
    return (
        <div
            className={cn(
                "border-r border-b h-8 min-w-[100px] flex items-center relative",
                isSelected ? "ring-2 ring-primary z-10" : ""
            )}
            style={{ backgroundColor: style?.backgroundColor }}
            onClick={onClick}
        >
            <input
                className={cn(
                    "w-full h-full px-1 outline-none bg-transparent",
                    style?.bold && "font-bold",
                    style?.italic && "italic",
                    style?.underline && "underline",
                    style?.align === 'center' && "text-center",
                    style?.align === 'right' && "text-right",
                    style?.align === 'left' && "text-left",
                )}
                style={{ color: style?.color }}
                value={value}
                onChange={onChange}
            />
        </div>
    );
});

Cell.displayName = "Cell";

export const Grid = ({ data, selectedCell, onSelectCell, onCellChange }: GridProps) => {

    const handleCellChange = (cellId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        onCellChange(cellId, e.target.value);
    };

    return (
        <div className="overflow-auto flex-1 bg-background relative">
            <div className="flex">
                {/* Header Row */}
                <div className="w-10 flex-shrink-0 bg-muted border-r border-b flex items-center justify-center font-bold text-xs text-muted-foreground sticky top-0 left-0 z-20">

                </div>
                {Array.from({ length: COLS }).map((_, colIndex) => (
                    <div key={colIndex} className="min-w-[100px] h-8 bg-muted border-r border-b flex items-center justify-center font-bold text-xs text-muted-foreground sticky top-0 z-10">
                        {colLabel(colIndex)}
                    </div>
                ))}
            </div>

            {Array.from({ length: ROWS }).map((_, rowIndex) => {
                const rowLabel = rowIndex + 1;
                return (
                    <div key={rowIndex} className="flex">
                        {/* Row Header */}
                        <div className="w-10 flex-shrink-0 bg-muted border-r border-b flex items-center justify-center font-bold text-xs text-muted-foreground sticky left-0 z-10">
                            {rowLabel}
                        </div>
                        {/* Cells */}
                        {Array.from({ length: COLS }).map((_, colIndex) => {
                            const cellId = `${colLabel(colIndex)}${rowLabel}`;
                            return (
                                <Cell
                                    key={cellId}
                                    id={cellId}
                                    value={selectedCell === cellId ? (data[cellId]?.formula || "") : (data[cellId]?.value || "")}
                                    style={data[cellId]?.style}
                                    isSelected={selectedCell === cellId}
                                    onClick={() => onSelectCell(cellId)}
                                    onChange={(e) => handleCellChange(cellId, e)}
                                />
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};
