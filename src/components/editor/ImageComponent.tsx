"use client";

import React, { useRef, useCallback } from "react";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageComponentProps {
    id: string;
    src: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    onRemove: () => void;
    onUpdatePosition: (x: number, y: number) => void;
    onUpdateSize: (width: number, height: number) => void;
}

export const ImageComponent = ({
    src,
    position,
    size,
    onRemove,
    onUpdatePosition,
    onUpdateSize,
}: ImageComponentProps) => {
    const dragState = useRef<{
        startMouseX: number;
        startMouseY: number;
        startPosX: number;
        startPosY: number;
    } | null>(null);

    const handleDragStart = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dragState.current = {
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startPosX: position.x,
                startPosY: position.y,
            };

            const handleMouseMove = (ev: MouseEvent) => {
                if (!dragState.current) return;
                onUpdatePosition(
                    Math.max(0, dragState.current.startPosX + ev.clientX - dragState.current.startMouseX),
                    Math.max(0, dragState.current.startPosY + ev.clientY - dragState.current.startMouseY),
                );
            };

            const handleMouseUp = () => {
                dragState.current = null;
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };

            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        },
        [position.x, position.y, onUpdatePosition],
    );

    return (
        <div
            className="absolute bg-card border rounded-md shadow-lg overflow-hidden group select-none pointer-events-auto"
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                zIndex: 90,
            }}
        >
            <div className="absolute top-0 left-0 w-full h-8 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-between px-2 transition-opacity z-10">
                <GripVertical
                    className="h-4 w-4 text-white cursor-grab active:cursor-grabbing"
                    onMouseDown={handleDragStart}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white hover:bg-black/40 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <img src={src} alt="Inserted content" className="w-full h-full object-contain pointer-events-none" />

            <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-primary/20 hover:bg-primary opacity-0 group-hover:opacity-100 transition-all rounded-tl-md"
                onMouseDown={(e) => {
                    // Resize logic could be implemented here
                    e.stopPropagation();
                }}
            />
        </div>
    );
};
