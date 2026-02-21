"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IconComponentProps {
    id: string;
    iconName: string;
    position: { x: number; y: number };
    size: number;
    color?: string;
    onRemove: () => void;
    onUpdatePosition: (x: number, y: number) => void;
}

export const IconComponent = ({
    iconName,
    position,
    size,
    color = "#3b82f6",
    onRemove,
}: IconComponentProps) => {
    // Dynamically get the icon component from lucide-react
    // @ts-ignore - Dynamic key access
    const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;

    return (
        <div
            className="absolute group select-none pointer-events-auto"
            style={{
                left: position.x,
                top: position.y,
                width: size,
                height: size,
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

            <Icon size={size} color={color} className="shadow-sm" />
        </div>
    );
};
