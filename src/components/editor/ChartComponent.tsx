"use client";

import React, { useMemo } from "react";
import { SheetData } from "@/hooks/use-spreadsheet";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartComponentProps {
    id: string;
    type: "bar" | "line" | "pie";
    range: string;
    title: string;
    data: SheetData;
    onRemove: () => void;
    onUpdatePosition: (x: number, y: number) => void;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

export const ChartComponent = ({
    type,
    range,
    title,
    data,
    onRemove,
    onUpdatePosition,
    position,
    size,
}: ChartComponentProps) => {
    // Parse range data for chart (A1:B5 format)
    const chartData = useMemo(() => {
        try {
            const [start, end] = range.split(":");
            const startCol = start.match(/[A-Z]+/)?.[0] || "";
            const startRow = parseInt(start.match(/[0-9]+/)?.[0] || "1");
            const endRow = parseInt(end.match(/[0-9]+/)?.[0] || "1");

            const labelColIdx = startCol.charCodeAt(0);
            const valColIdx = labelColIdx + 1;
            const valCol = String.fromCharCode(valColIdx);

            const result = [];
            for (let r = startRow; r <= endRow; r++) {
                const label = data[`${startCol}${r}`]?.value || `R${r}`;
                const value = parseFloat(String(data[`${valCol}${r}`]?.value || "0"));
                result.push({ name: label, value: isNaN(value) ? 0 : value });
            }
            return result;
        } catch (e) {
            return [];
        }
    }, [range, data]);

    const maxVal = Math.max(...chartData.map(d => d.value), 1);
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    return (
        <div
            className="absolute bg-card border rounded-lg shadow-xl p-4 overflow-hidden group select-none flex flex-col pointer-events-auto"
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                zIndex: 100,
            }}
        >
            <div className="flex items-center justify-between mb-4 border-b pb-2 shrink-0">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                    <h3 className="text-sm font-semibold truncate max-w-[150px]">{title}</h3>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 min-h-0 w-full relative">
                <svg width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
                    {type === "bar" && (
                        <g transform="translate(30, 10)">
                            {chartData.map((d, i) => {
                                const barWidth = (100 / chartData.length) * 0.8;
                                const barHeight = (d.value / maxVal) * 80;
                                const xCoord = (100 / chartData.length) * i;
                                return (
                                    <rect
                                        key={i}
                                        x={`${xCoord}%`}
                                        y={`${85 - barHeight}%`}
                                        width={`${barWidth}%`}
                                        height={`${barHeight}%`}
                                        fill={COLORS[i % COLORS.length]}
                                        rx="2"
                                        className="transition-all duration-300 hover:brightness-110"
                                    />
                                );
                            })}
                            {/* Simple X Axis */}
                            <line x1="0" y1="85%" x2="100%" y2="85%" stroke="hsl(var(--border))" strokeWidth="1" />
                        </g>
                    )}
                    {type === "line" && (
                        <g transform="translate(30, 10)">
                            <polyline
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                points={chartData.map((d, i) => {
                                    const x = (i / (chartData.length - 1)) * 100;
                                    const y = 85 - (d.value / maxVal) * 80;
                                    return `${x}%,${y}%`;
                                }).join(" ")}
                                className="transition-all duration-300"
                            />
                            {chartData.map((d, i) => {
                                const x = (i / (chartData.length - 1)) * 100;
                                const y = 85 - (d.value / maxVal) * 80;
                                return (
                                    <circle
                                        key={i}
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="3"
                                        fill="hsl(var(--primary))"
                                        className="hover:r-5 transition-all"
                                    />
                                );
                            })}
                            <line x1="0" y1="85%" x2="100%" y2="85%" stroke="hsl(var(--border))" strokeWidth="1" />
                        </g>
                    )}
                    {type === "pie" && (
                        <g transform={`translate(${size.width / 2 - 20}, ${size.height / 2 - 40})`}>
                            {chartData.reduce((acc, d, i) => {
                                const total = chartData.reduce((sum, item) => sum + item.value, 0);
                                const percentage = (d.value / total) * 360;
                                const startAngle = acc.currentAngle;
                                acc.currentAngle += percentage;

                                // Calculate path (simplified arc)
                                const r = 60;
                                const x1 = r * Math.cos(Math.PI * startAngle / 180);
                                const y1 = r * Math.sin(Math.PI * startAngle / 180);
                                const x2 = r * Math.cos(Math.PI * acc.currentAngle / 180);
                                const y2 = r * Math.sin(Math.PI * acc.currentAngle / 180);

                                acc.elements.push(
                                    <path
                                        key={i}
                                        d={`M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${percentage > 180 ? 1 : 0} 1 ${x2} ${y2} Z`}
                                        fill={COLORS[i % COLORS.length]}
                                        className="transition-all hover:opacity-80"
                                    />
                                );
                                return acc;
                            }, { currentAngle: 0, elements: [] as any[] }).elements}
                        </g>
                    )}
                </svg>
            </div>

            <div className="mt-2 shrink-0 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1 shrink-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] text-muted-foreground truncate max-w-[40px]">{d.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
