"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

export function ShortcutsDropdown() {
	const shortcuts = [
		{ key: "Ctrl + B", description: "Bold" },
		{ key: "Ctrl + I", description: "Italic" },
		{ key: "Ctrl + U", description: "Underline" },
		{ key: "Enter", description: "Confirm" },
		{ key: "Delete", description: "Clear" },
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" title="Shortcuts">
					<Keyboard className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>Keyboard Shortcuts</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{shortcuts.map((s) => (
					<DropdownMenuItem key={s.key}>
						<span>{s.description}</span>
						<DropdownMenuShortcut>{s.key}</DropdownMenuShortcut>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
