"use client";

import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronDown, ChevronUp, FunctionSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormulaBarProps {
	selectedCell: string | null;
	value: string;
	onChange: (value: string) => void;
	onConfirm?: () => void;
	onCancel?: () => void;
	onInsertFunctionClick?: () => void;
	/** Optional: show evaluated result preview when value is a formula */
	previewValue?: string;
	className?: string;
}

export const FormulaBar = ({
	selectedCell,
	value,
	onChange,
	onConfirm,
	onCancel,
	onInsertFunctionClick,
	previewValue,
	className,
}: FormulaBarProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [localValue, setLocalValue] = useState(value);
	const [expanded, setExpanded] = useState(false);
	const [initialValue, setInitialValue] = useState(value);

	// Sync when selected cell or external value changes
	useEffect(() => {
		setLocalValue(value);
		setInitialValue(value);
	}, [selectedCell, value]);

	const handleChange = (v: string) => {
		setLocalValue(v);
		onChange(v);
	};

	const handleConfirm = () => {
		// Always commit current value when user confirms (Enter or Check button)
		onChange(localValue);
		onConfirm?.();
		(inputRef.current || textareaRef.current)?.blur();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleConfirm();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			setLocalValue(initialValue);
			onChange(initialValue);
			onCancel?.();
			(inputRef.current || textareaRef.current)?.blur();
		}
	};

	const handleFocus = () => {
		setInitialValue(value);
	};

	const handleCancel = () => {
		setLocalValue(initialValue);
		onChange(initialValue);
		onCancel?.();
	};

	const isFormula = value.trim().startsWith("=");

	return (
		<div
			className={cn(
				"border-b border-border flex items-stretch bg-muted/30 dark:bg-zinc-900/80",
				className
			)}
		>
			{/* Cell reference */}
			<div className="w-12 min-w-[3rem] font-mono text-sm font-semibold text-muted-foreground flex items-center justify-center border-r border-border shrink-0">
				{selectedCell || ""}
			</div>
			{/* fx label + Insert Function button */}
			<div className="flex items-center border-r border-border px-1 shrink-0">
				{onInsertFunctionClick ? (
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-muted-foreground hover:text-foreground"
						onClick={onInsertFunctionClick}
						title="Insert Function"
					>
						<FunctionSquare className="h-4 w-4" />
					</Button>
				) : (
					<span className="font-serif italic text-muted-foreground px-2 text-sm">fx</span>
				)}
			</div>
			{/* Formula input area */}
			<div className="flex-1 flex flex-col min-w-0">
				{expanded ? (
					<textarea
						ref={textareaRef}
						value={localValue}
						onChange={(e) => handleChange(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={handleFocus}
						placeholder="Enter formula or value"
						className="flex-1 min-h-[60px] max-h-[120px] resize-y border-0 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-0 font-mono"
						spellCheck={false}
					/>
				) : (
					<Input
						ref={inputRef}
						className="h-9 border-0 rounded-none shadow-none focus-visible:ring-0 px-3 font-mono text-sm"
						value={localValue}
						onChange={(e) => handleChange(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={handleFocus}
						placeholder="Enter formula or value"
						spellCheck={false}
					/>
				)}
				{/* Preview line when formula and we have a result */}
				{isFormula && previewValue !== undefined && previewValue !== "" && (
					<div className="px-3 pb-1 text-xs text-muted-foreground truncate" title={previewValue}>
						Result: {previewValue}
					</div>
				)}
			</div>
			{/* Excel-style Cancel / Enter buttons */}
			<div className="flex items-center border-l border-border shrink-0">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground"
					onClick={handleCancel}
					title="Cancel"
				>
					<X className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground"
					onClick={handleConfirm}
					title="Enter"
				>
					<Check className="h-4 w-4" />
				</Button>
			</div>
			{/* Expand / Collapse for long formulas */}
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 rounded-none shrink-0 text-muted-foreground hover:text-foreground"
				onClick={() => setExpanded(!expanded)}
				title={expanded ? "Collapse formula bar" : "Expand formula bar"}
			>
				{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
			</Button>
		</div>
	);
};
