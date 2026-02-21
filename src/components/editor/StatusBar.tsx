"use client";

import React from "react";
import { SheetData } from "@/hooks/use-spreadsheet";
import { cn } from "@/lib/utils";

interface StatusBarProps {
    data: SheetData;
    selectionRange: string[] | null;
    selectedCell: string | null;
}

export const StatusBar = ({ data, selectionRange, selectedCell }: StatusBarProps) => {
    const stats = React.useMemo(() => {
        if (!selectionRange || selectionRange.length <= 1) return null;

        const values = selectionRange
            .map((id) => {
                const val = data[id]?.value;
                return val && !isNaN(Number(val)) ? Number(val) : null;
            })
            .filter((v): v is number => v !== null);

        if (values.length === 0) return null;

        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const count = values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        return {
            sum: sum.toLocaleString(),
            avg: avg.toLocaleString(undefined, { maximumFractionDigits: 2 }),
            count,
            min: min.toLocaleString(),
            max: max.toLocaleString(),
        };
    }, [data, selectionRange]);

    return (
        <div className="h-6 border-t bg-muted/30 px-4 flex items-center justify-between text-[11px] text-muted-foreground select-none">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <span className="font-medium text-primary/70">Ready</span>
                </div>
                {selectedCell && (
                    <div className="border-l pl-4 font-mono">
                        Selected: {selectedCell}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {stats && (
                    <>
                        <div className="flex items-center gap-1">
                            <span>Average:</span>
                            <span className="font-semibold text-foreground">{stats.avg}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Count:</span>
                            <span className="font-semibold text-foreground">{stats.count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Sum:</span>
                            <span className="font-semibold text-foreground">{stats.sum}</span>
                        </div>
                    </>
                )}
                <div className="border-l pl-4">
                    100%
                </div>
            </div>
        </div>
    );
};
