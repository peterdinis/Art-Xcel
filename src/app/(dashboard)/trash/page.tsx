"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FileSpreadsheet, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Spreadsheet {
	id: string;
	name: string;
	lastModified: number;
	deletedAt?: number;
}

export default function TrashPage() {
	const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);

	useEffect(() => {
		const stored = localStorage.getItem("excel-editor-files");
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				const deleted = parsed.filter((s: Spreadsheet) => s.deletedAt);
				setSpreadsheets(deleted);
			} catch (e) {
				console.error("Failed to parse local storage", e);
			}
		}
	}, []);

	const restoreSpreadsheet = (id: string) => {
		const stored = localStorage.getItem("excel-editor-files");
		if (stored) {
			const allFiles = JSON.parse(stored);
			const updated = allFiles.map((s: Spreadsheet) => {
				if (s.id === id) {
					const { deletedAt, ...rest } = s;
					return rest;
				}
				return s;
			});
			localStorage.setItem("excel-editor-files", JSON.stringify(updated));
			setSpreadsheets((prev) => prev.filter((s) => s.id !== id));
		}
	};

	const permanentlyDelete = (id: string) => {
		const stored = localStorage.getItem("excel-editor-files");
		if (stored) {
			const allFiles = JSON.parse(stored);
			const updated = allFiles.filter((s: Spreadsheet) => s.id !== id);
			localStorage.setItem("excel-editor-files", JSON.stringify(updated));
			setSpreadsheets((prev) => prev.filter((s) => s.id !== id));
		}
	};

	return (
		<div className="container mx-auto py-10 px-6 font-sans">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Trash</h1>
				<p className="text-muted-foreground mt-1">
					Restore or permanently delete your spreadsheets.
				</p>
			</div>

			{spreadsheets.length === 0 ? (
				<div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl bg-background text-center">
					<Trash2 className="h-10 w-10 text-muted-foreground mb-4" />
					<h3 className="text-xl font-semibold mb-2">Trash is empty</h3>
					<p className="text-muted-foreground">No deleted files found.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{spreadsheets.map((sheet) => (
						<Card key={sheet.id} className="group overflow-hidden">
							<div className="h-32 bg-secondary/50 flex items-center justify-center border-b">
								<FileSpreadsheet className="h-12 w-12 text-muted-foreground/50" />
							</div>
							<CardHeader className="p-4">
								<CardTitle className="truncate" title={sheet.name}>
									{sheet.name}
								</CardTitle>
								<CardDescription className="text-xs mt-1">
									Deleted: {new Date(sheet.deletedAt!).toLocaleDateString()}
								</CardDescription>
							</CardHeader>
							<CardContent className="p-4 pt-0 flex gap-2 justify-end">
								<Button
									variant="outline"
									size="sm"
									onClick={() => restoreSpreadsheet(sheet.id)}
									title="Restore"
								>
									<RotateCcw className="h-4 w-4 mr-1" />
									Restore
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => permanentlyDelete(sheet.id)}
									title="Delete Permanently"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
