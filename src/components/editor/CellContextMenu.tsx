"use client";

import React from "react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	Copy,
	Scissors,
	Clipboard,
	PlusCircle,
	MinusCircle,
	Trash2,
	Eraser,
	Keyboard,
} from "lucide-react";

interface CellContextMenuProps {
	children: React.ReactNode;
	onCopy: () => void;
	onCut: () => void;
	onPaste: () => void;
	onInsertRowAbove: () => void;
	onInsertRowBelow: () => void;
	onDeleteRow: () => void;
	onInsertColumnLeft: () => void;
	onInsertColumnRight: () => void;
	onDeleteColumn: () => void;
	onClearCell: () => void;
	onShowShortcuts?: () => void;
	isMac?: boolean;
}

export const CellContextMenu = ({
	children,
	onCopy,
	onCut,
	onPaste,
	onInsertRowAbove,
	onInsertRowBelow,
	onDeleteRow,
	onInsertColumnLeft,
	onInsertColumnRight,
	onDeleteColumn,
	onClearCell,
	onShowShortcuts,
	isMac = false,
}: CellContextMenuProps) => {
	// Helper function to format shortcuts based on platform
	const getShortcutText = (shortcut: string): string => {
		if (isMac) {
			return shortcut
				.replace(/Ctrl\+/g, "⌘")
				.replace(/Alt\+/g, "⌥")
				.replace(/Shift\+/g, "⇧");
		}
		return shortcut;
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent className="w-64">
				<ContextMenuItem onClick={onCopy} className="gap-2">
					<Copy className="h-4 w-4" />
					<span>Copy</span>
					<span className="ml-auto text-xs text-muted-foreground">
						{getShortcutText("Ctrl+C")}
					</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={onCut} className="gap-2">
					<Scissors className="h-4 w-4" />
					<span>Cut</span>
					<span className="ml-auto text-xs text-muted-foreground">
						{getShortcutText("Ctrl+X")}
					</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={onPaste} className="gap-2">
					<Clipboard className="h-4 w-4" />
					<span>Paste</span>
					<span className="ml-auto text-xs text-muted-foreground">
						{getShortcutText("Ctrl+V")}
					</span>
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem onClick={onInsertRowAbove} className="gap-2">
					<PlusCircle className="h-4 w-4" />
					<span>Insert Row Above</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={onInsertRowBelow} className="gap-2">
					<PlusCircle className="h-4 w-4" />
					<span>Insert Row Below</span>
				</ContextMenuItem>
				<ContextMenuItem
					onClick={onDeleteRow}
					className="gap-2 text-destructive focus:text-destructive"
				>
					<MinusCircle className="h-4 w-4" />
					<span>Delete Row</span>
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem onClick={onInsertColumnLeft} className="gap-2">
					<PlusCircle className="h-4 w-4" />
					<span>Insert Column Left</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={onInsertColumnRight} className="gap-2">
					<PlusCircle className="h-4 w-4" />
					<span>Insert Column Right</span>
				</ContextMenuItem>
				<ContextMenuItem
					onClick={onDeleteColumn}
					className="gap-2 text-destructive focus:text-destructive"
				>
					<MinusCircle className="h-4 w-4" />
					<span>Delete Column</span>
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem onClick={onClearCell} className="gap-2">
					<Eraser className="h-4 w-4" />
					<span>Clear Contents</span>
					<span className="ml-auto text-xs text-muted-foreground">Delete</span>
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem onClick={onShowShortcuts} className="gap-2">
					<Keyboard className="h-4 w-4" />
					<span>Available Shortcuts</span>
					<span className="ml-auto text-xs text-muted-foreground">
						{getShortcutText("Ctrl+/")}
					</span>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};
