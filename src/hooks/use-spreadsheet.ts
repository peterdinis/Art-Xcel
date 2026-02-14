import { useState, useCallback, useEffect } from 'react';
import { all, create } from 'mathjs';

export interface CellData {
    value: string;
    formula: string;
    style?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        align?: 'left' | 'center' | 'right';
        color?: string;
        backgroundColor?: string;
    };
}

export type SheetData = Record<string, CellData>;

export interface SpreadsheetState {
    data: SheetData;
    selectedCell: string | null;
    selectionRange: string[] | null;
}

const math = create(all);

export const useSpreadsheet = (initialData: SheetData = {}) => {
    const [data, setData] = useState<SheetData>(initialData);
    const [selectedCell, setSelectedCell] = useState<string | null>("A1");

    // Helper to get cell value as number (or 0)
    const getVal = (cellId: string, currentData: SheetData) => {
        const val = currentData[cellId]?.value;
        return val && !isNaN(Number(val)) ? Number(val) : 0;
    };

    // Helper to expand ranges like A1:A5 to array of values
    const getRangeValues = (range: string, currentData: SheetData) => {
        const [start, end] = range.split(":");
        const startCol = start.match(/[A-Z]+/)?.[0] || "";
        const startRow = parseInt(start.match(/[0-9]+/)?.[0] || "0");
        const endCol = end.match(/[A-Z]+/)?.[0] || "";
        const endRow = parseInt(end.match(/[0-9]+/)?.[0] || "0");

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

    // Formula evaluator using MathJS
    const evaluateFormula = useCallback((formula: string, currentData: SheetData): string => {
        if (!formula.startsWith("=")) return formula;

        let expression = formula.substring(1);

        // 1. Pre-process Ranges: Replace A1:B2 with [val1, val2, ...]
        // Case-insensitive regex for ranges
        const rangeRegex = /([a-zA-Z]+[0-9]+:[a-zA-Z]+[0-9]+)/g;
        expression = expression.replace(rangeRegex, (match) => {
            // Uppercase for lookup
            const values = getRangeValues(match.toUpperCase(), currentData);
            return `[${values.join(",")}]`;
        });

        // 2. Pre-process Cell References: Replace A1 with value
        // Case-insensitive regex for cells
        const cellRegex = /[a-zA-Z]+[0-9]+/g;
        expression = expression.replace(cellRegex, (match) => {
            const val = getVal(match.toUpperCase(), currentData);
            return String(val);
        });

        // 3. Lowercase the rest to standardise function names for MathJS (SUM -> sum, SIN -> sin)
        expression = expression.toLowerCase();

        // 4. Map common Excel function aliases to MathJS
        // Note: 'sum', 'max', 'min' seem to work fine in mathjs if lowercase.
        // 'average' needs to map to 'mean'
        expression = expression.replace(/average\(/g, "mean(");
        expression = expression.replace(/avg\(/g, "mean(");

        try {
            // Evaluate using mathjs
            const result = math.evaluate(expression);
            return String(result);
        } catch (e) {
            console.error(e);
            return "#ERROR";
        }
    }, []);

    const updateCell = useCallback((cellId: string, input: string) => {
        setData((prev) => {
            const newData = { ...prev };
            const evaluated = evaluateFormula(input, prev);

            newData[cellId] = {
                ...newData[cellId],
                value: evaluated,
                formula: input,
            };

            // Re-evaluate dependents
            Object.keys(newData).forEach((key) => {
                if (newData[key].formula?.startsWith("=") && key !== cellId) {
                    newData[key].value = evaluateFormula(newData[key].formula, newData);
                }
            });

            return newData;
        });
    }, [evaluateFormula]);

    const updateCellStyle = useCallback((cellId: string, style: Partial<NonNullable<CellData['style']>>) => {
        setData(prev => ({
            ...prev,
            [cellId]: {
                ...prev[cellId],
                style: {
                    ...prev[cellId]?.style,
                    ...style
                }
            }
        }))
    }, []);

    const getCellFormula = useCallback((cellId: string) => {
        return data[cellId]?.formula || "";
    }, [data]);

    const getCellValue = useCallback((cellId: string) => {
        return data[cellId]?.value || "";
    }, [data]);

    const selectCell = useCallback((cellId: string) => {
        setSelectedCell(cellId);
    }, []);

    return {
        data,
        selectedCell,
        updateCell,
        updateCellStyle,
        getCellValue,
        getCellFormula,
        selectCell,
        setData,
    };
};
