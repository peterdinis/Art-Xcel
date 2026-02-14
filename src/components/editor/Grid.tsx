import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
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

interface CellProps {
    id: string;
    value: string;
    formula?: string;
    style?: CellData['style'];
    isSelected: boolean;
    isEditing: boolean;
    onClick: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    inputRef?: React.RefCallback<HTMLInputElement>;
}

const Cell = memo(({ 
    id, 
    value, 
    formula,
    style, 
    isSelected, 
    isEditing,
    onClick, 
    onChange,
    onKeyDown,
    onBlur,
    inputRef
}: CellProps) => {
    // Zobraziť formula ak sa edituje, inak hodnotu
    const displayValue = isEditing ? (formula || value) : value;

    return (
        <div
            className={cn(
                "border-r border-b h-8 min-w-25 flex items-center relative",
                isSelected ? "ring-2 ring-primary z-10" : "",
                isEditing && "ring-2 ring-blue-500 z-20"
            )}
            style={{ backgroundColor: style?.backgroundColor }}
            onClick={onClick}
        >
            <input
                ref={inputRef}
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
                value={displayValue}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                autoFocus={isEditing}
            />
            {/* Indikátor pre bunku s formulkou */}
            {formula && !isEditing && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" title="Contains formula" />
            )}
        </div>
    );
});

Cell.displayName = "Cell";

export const Grid = ({ data, selectedCell, onSelectCell, onCellChange }: GridProps) => {
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
    const doubleClickTimer = useRef<NodeJS.Timeout>(null);

    // Reset editing when selected cell changes
    useEffect(() => {
        if (selectedCell && selectedCell !== editingCell) {
            setEditingCell(null);
            setEditValue("");
        }
    }, [selectedCell]);

    const handleCellClick = useCallback((cellId: string) => {
        // Single click - select cell
        onSelectCell(cellId);
    }, [onSelectCell]);

    const handleDoubleClick = useCallback((cellId: string) => {
        // Clear any pending single click
        if (doubleClickTimer.current) {
            clearTimeout(doubleClickTimer.current);
        }

        const cellData = data[cellId];
        setEditingCell(cellId);
        setEditValue(cellData?.formula || cellData?.value || "");
        
        // Focus input po nastavení editing stavu
        setTimeout(() => {
            const input = inputRefs.current.get(cellId);
            if (input) {
                input.focus();
                input.select();
            }
        }, 0);
    }, [data]);

    const handleCellChange = useCallback((cellId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingCell === cellId) {
            setEditValue(e.target.value);
        }
    }, [editingCell]);

    const saveAndMove = useCallback((cellId: string, direction: 'down' | 'up' | 'right' | 'left') => {
        // Save changes
        if (editingCell === cellId) {
            onCellChange(cellId, editValue);
            setEditingCell(null);
            
            // Move to next cell
            const col = cellId[0];
            const row = parseInt(cellId.slice(1));
            
            let nextCellId = cellId;
            
            switch (direction) {
                case 'down':
                    if (row < ROWS) {
                        nextCellId = col + (row + 1);
                    }
                    break;
                case 'up':
                    if (row > 1) {
                        nextCellId = col + (row - 1);
                    }
                    break;
                case 'right':
                    if (col < 'Z') {
                        const nextCol = String.fromCharCode(col.charCodeAt(0) + 1);
                        nextCellId = nextCol + row;
                    }
                    break;
                case 'left':
                    if (col > 'A') {
                        const prevCol = String.fromCharCode(col.charCodeAt(0) - 1);
                        nextCellId = prevCol + row;
                    }
                    break;
            }
            
            if (nextCellId !== cellId) {
                onSelectCell(nextCellId);
            }
        }
    }, [editingCell, editValue, onCellChange, onSelectCell]);

    const handleKeyDown = useCallback((cellId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                saveAndMove(cellId, 'up');
            } else {
                saveAndMove(cellId, 'down');
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            // Cancel editing
            setEditingCell(null);
            setEditValue("");
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                saveAndMove(cellId, 'left');
            } else {
                saveAndMove(cellId, 'right');
            }
        }
    }, [saveAndMove]);

    const handleBlur = useCallback((cellId: string) => {
        // Save changes when input loses focus
        if (editingCell === cellId) {
            onCellChange(cellId, editValue);
            setEditingCell(null);
        }
    }, [editingCell, editValue, onCellChange]);

    const setInputRef = useCallback((cellId: string) => (element: HTMLInputElement | null) => {
        if (element) {
            inputRefs.current.set(cellId, element);
        } else {
            inputRefs.current.delete(cellId);
        }
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (doubleClickTimer.current) {
                clearTimeout(doubleClickTimer.current);
            }
        };
    }, []);

    return (
        <div className="overflow-auto flex-1 bg-background relative">
            <div className="flex sticky top-0 z-20 bg-background">
                {/* Header Row */}
                <div className="w-10 shrink-0 bg-muted border-r border-b flex items-center justify-center font-bold text-xs text-muted-foreground sticky left-0 z-30">
                    #
                </div>
                {Array.from({ length: COLS }).map((_, colIndex) => (
                    <div key={colIndex} className="min-w-25 h-8 bg-muted border-r border-b flex items-center justify-center font-bold text-xs text-muted-foreground">
                        {colLabel(colIndex)}
                    </div>
                ))}
            </div>

            {Array.from({ length: ROWS }).map((_, rowIndex) => {
                const rowLabel = rowIndex + 1;
                return (
                    <div key={rowIndex} className="flex">
                        {/* Row Header */}
                        <div className="w-10 shrink-0 bg-muted border-r border-b flex items-center justify-center font-bold text-xs text-muted-foreground sticky left-0 z-10">
                            {rowLabel}
                        </div>
                        {/* Cells */}
                        {Array.from({ length: COLS }).map((_, colIndex) => {
                            const cellId = `${colLabel(colIndex)}${rowLabel}`;
                            const cellData = data[cellId] || { value: '', style: {} };
                            const isEditing = editingCell === cellId;
                            
                            return (
                                <div
                                    key={cellId}
                                    onDoubleClick={() => handleDoubleClick(cellId)}
                                >
                                    <Cell
                                        id={cellId}
                                        value={cellData.value || ""}
                                        formula={cellData.formula}
                                        style={cellData.style}
                                        isSelected={selectedCell === cellId}
                                        isEditing={isEditing}
                                        onClick={() => handleCellClick(cellId)}
                                        onChange={(e) => handleCellChange(cellId, e)}
                                        onKeyDown={(e) => handleKeyDown(cellId, e)}
                                        onBlur={() => handleBlur(cellId)}
                                        inputRef={setInputRef(cellId)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};