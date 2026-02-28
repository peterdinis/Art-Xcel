"use client";

import React from "react";
import { Plus, ChevronLeft, ChevronRight, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SheetTabsProps {
	sheetNames: string[];
	currentSheetIndex: number;
	onSwitchSheet: (index: number) => void;
	onAddSheet: () => void;
	onRenameSheet: (index: number, newName: string) => void;
	onDeleteSheet: (index: number) => void;
}

export const SheetTabs = ({
	sheetNames,
	currentSheetIndex,
	onSwitchSheet,
	onAddSheet,
	onRenameSheet,
	onDeleteSheet,
}: SheetTabsProps) => {
	const scrollRef = React.useRef<HTMLDivElement>(null);

	const scroll = (direction: "left" | "right") => {
		if (scrollRef.current) {
			const amount = 200;
			scrollRef.current.scrollBy({
				left: direction === "left" ? -amount : amount,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="h-8 border-t bg-zinc-100 dark:bg-zinc-900 flex items-center px-2 select-none">
			{/* Scroll Controls */}
			<div className="flex items-center border-r pr-2 mr-2 gap-1">
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					onClick={() => scroll("left")}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					onClick={() => scroll("right")}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 text-primary"
					onClick={onAddSheet}
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{/* Tabs List */}
			<div
				ref={scrollRef}
				className="flex-1 flex items-center overflow-x-auto no-scrollbar scroll-smooth h-full"
			>
				{sheetNames.map((name, index) => (
					<div
						key={`${name}-${index}`}
						className={cn(
							"group flex items-center h-full px-4 text-xs font-medium border-x border-transparent cursor-pointer min-w-[100px] justify-between transition-colors",
							index === currentSheetIndex
								? "bg-white dark:bg-zinc-800 border-x-zinc-300 dark:border-x-zinc-700 text-primary border-t-2 border-t-primary"
								: "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-muted-foreground",
						)}
						onClick={() => onSwitchSheet(index)}
					>
						<span className="truncate mr-2">{name}</span>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<div className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-opacity">
									<ChevronRight className="h-3 w-3 rotate-90" />
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-40">
								<DropdownMenuItem
									onClick={() => {
										const newName = prompt("Enter new sheet name:", name);
										if (newName && newName !== name)
											onRenameSheet(index, newName);
									}}
								>
									<Edit2 className="mr-2 h-4 w-4" />
									Rename
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onClick={() => onDeleteSheet(index)}
									disabled={sheetNames.length <= 1}
								>
									<X className="mr-2 h-4 w-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				))}
			</div>
		</div>
	);
};
