"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Check, X, FileSpreadsheet, Share2, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
	name: string;
	onRename: (newName: string) => void;
	onSave: () => void;
	onShare: () => void;
	isSaving?: boolean;
}

export function EditorHeader({
	name,
	onRename,
	onSave,
	onShare,
	isSaving = false,
}: EditorHeaderProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [tempName, setTempName] = useState(name);

	useEffect(() => {
		setTempName(name);
	}, [name]);

	const handleConfirm = () => {
		if (tempName.trim() && tempName !== name) {
			onRename(tempName.trim());
			toast.success(`Renamed to "${tempName.trim()}"`);
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setTempName(name);
		setIsEditing(false);
	};

	return (
		<header className="h-12 border-b bg-background flex items-center px-4 justify-between select-none">
			<div className="flex items-center gap-3 flex-1 overflow-hidden">
				<div className="bg-primary/10 p-1.5 rounded-lg">
					<FileSpreadsheet className="h-5 w-5 text-primary" />
				</div>
				
				<div className="flex items-center gap-1 overflow-hidden">
					{isEditing ? (
						<div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-1 duration-200">
							<Input
								value={tempName}
								onChange={(e) => setTempName(e.target.value)}
								className="h-8 w-48 lg:w-64"
								autoFocus
								onKeyDown={(e) => {
									if (e.key === "Enter") handleConfirm();
									if (e.key === "Escape") handleCancel();
								}}
							/>
							<Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleConfirm}>
								<Check className="h-4 w-4" />
							</Button>
							<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={handleCancel}>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<div 
							className="flex items-center gap-2 cursor-pointer group px-2 py-1 rounded-md hover:bg-muted transition-colors overflow-hidden"
							onClick={() => setIsEditing(true)}
						>
							<h1 className="text-sm font-semibold truncate max-w-[200px] lg:max-w-md">
								{name || "Untitled Spreadsheet"}
							</h1>
							<Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
						</div>
					)}
				</div>

				<div className="flex items-center gap-2 ml-2">
					<Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider px-1.5 py-0">
						Draft
					</Badge>
					{isSaving && (
						<span className="text-[10px] text-muted-foreground flex items-center gap-1 animate-pulse">
							<Cloud className="h-3 w-3" />
							Saving...
						</span>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2">
				<Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={onShare}>
					<Share2 className="h-3.5 w-3.5" />
					Share
				</Button>
				<Button size="sm" className="h-8 gap-2 text-xs px-4" onClick={onSave} disabled={isSaving}>
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>
		</header>
	);
}
