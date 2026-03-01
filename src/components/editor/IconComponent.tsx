"use client";

import React, { useRef, useCallback } from "react";
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
	onUpdatePosition,
}: IconComponentProps) => {
	// Safe access to Lucide icons with type assertion
	const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;

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

			const handleMouseMove = (moveEvent: MouseEvent) => {
				if (!dragState.current) return;
				const dx = moveEvent.clientX - dragState.current.startMouseX;
				const dy = moveEvent.clientY - dragState.current.startMouseY;
				onUpdatePosition(
					Math.max(0, dragState.current.startPosX + dx),
					Math.max(0, dragState.current.startPosY + dy),
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
			className="absolute group select-none pointer-events-auto"
			style={{
				left: position.x,
				top: position.y,
				width: size,
				height: size,
				zIndex: 80,
			}}
		>
			{/* Toolbar nad ikonou */}
			<div className="absolute -top-7 left-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded shadow-sm px-1 h-6 pointer-events-auto">
				<GripVertical
					className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing"
					onMouseDown={handleDragStart}
				/>
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

			{/* Ikona — kliknutím aktivuje drag cez celú plochu */}
			<div
				className="w-full h-full cursor-grab active:cursor-grabbing"
				onMouseDown={handleDragStart}
			>
				<Icon
					size={size}
					color={color}
					className="shadow-sm pointer-events-none"
				/>
			</div>
		</div>
	);
};