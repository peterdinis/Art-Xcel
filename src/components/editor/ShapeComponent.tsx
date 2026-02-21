"use client";

import React from "react";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShapeComponentProps {
    id: string;
    type: "rectangle" | "circle" | "line";
    position: { x: number; y: number };
    size: { width: number; height: number };
    style?: {
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
    };
    onRemove: () => void;
    onUpdatePosition: (x: number, y: number) => void;
}

export const ShapeComponent = ({
    type,
    position,
    size,
    style = {},
    onRemove,
}: ShapeComponentProps) => {
    const { fill = "rgba(59, 130, 246, 0.5)", stroke = "#2563eb", strokeWidth = 2 } = style;

    return (
        <div
            className="absolute group select-none pointer-events-auto shadow-sm hover:shadow-md transition-shadow"
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                zIndex: 80,
            }}
        >
            <div className="absolute top-[-24px] left-0 w-full h-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-t-md px-1">
                <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-destructive hover:text-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            <svg width="100%" height="100%" className="overflow-visible shadow-sm">
                {type === "rectangle" && (
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        rx="4"
                    />
                )}
                {type === "circle" && (
                    <ellipse
                        cx="50%"
                        cy="50%"
                        rx="50%"
                        ry="50%"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                    />
                )}
                {type === "line" && (
                    <line
                        x1="0"
                        y1="0"
                        x2="100%"
                        y2="100%"
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                    />
                )}
            </svg>
        </div>
    );
};
