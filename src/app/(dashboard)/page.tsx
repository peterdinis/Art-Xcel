"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Plus, FileSpreadsheet, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Spreadsheet {
	id: string;
	name: string;
	lastModified: number;
	deletedAt?: number;
}

export default function Dashboard() {
	const router = useRouter();
	const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);

	useEffect(() => {
		const stored = localStorage.getItem("excel-editor-files");
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				// Only show non-deleted files
				const active = parsed.filter((s: Spreadsheet) => !s.deletedAt);
				setSpreadsheets(active);
			} catch (e) {
				console.error("Failed to parse local storage", e);
			}
		}
	}, []);

	const createNewSpreadsheet = () => {
		const newId = crypto.randomUUID();
		const newFile: Spreadsheet = {
			id: newId,
			name: "Untitled Spreadsheet",
			lastModified: Date.now(),
		};

		// Get all current files to append
		const stored = localStorage.getItem("excel-editor-files");
		const allFiles = stored ? JSON.parse(stored) : [];
		const updated = [newFile, ...allFiles];

		localStorage.setItem("excel-editor-files", JSON.stringify(updated));
		setSpreadsheets((prev) => [newFile, ...prev]);

		// Navigate
		router.push(`/editor/${newId}`);
	};

	const deleteSpreadsheet = (e: React.MouseEvent, id: string) => {
		e.preventDefault();
		e.stopPropagation();

		const stored = localStorage.getItem("excel-editor-files");
		if (stored) {
			const allFiles = JSON.parse(stored);
			const updated = allFiles.map((s: Spreadsheet) => {
				if (s.id === id) {
					return { ...s, deletedAt: Date.now() };
				}
				return s;
			});
			localStorage.setItem("excel-editor-files", JSON.stringify(updated));

			// Update local state
			setSpreadsheets((prev) => prev.filter((s) => s.id !== id));
		}
	};

	return (
		<div className="min-h-screen bg-muted/40 font-sans">
			<header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6 shadow-sm">
				<div className="flex items-center gap-2 font-semibold text-lg text-primary">
					<FileSpreadsheet className="h-6 w-6" />
					<span>Excel Editor</span>
				</div>
			</header>

			<main className="container mx-auto py-10 px-6">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
						<p className="text-muted-foreground mt-1">
							Manage your spreadsheets and create new ones.
						</p>
					</div>
					<Button
						onClick={createNewSpreadsheet}
						size="lg"
						className="gap-2 shadow-lg hover:shadow-xl transition-all"
					>
						<Plus className="h-5 w-5" />
						New Spreadsheet
					</Button>
				</div>

				{spreadsheets.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl bg-background text-center animate-accordion-down">
						<div className="bg-primary/10 p-4 rounded-full mb-4">
							<FileSpreadsheet className="h-10 w-10 text-primary" />
						</div>
						<h3 className="text-xl font-semibold mb-2">No spreadsheets yet</h3>
						<p className="text-muted-foreground mb-6 max-w-sm">
							Get started by creating your first spreadsheet to organize your
							data.
						</p>
						<Button onClick={createNewSpreadsheet} variant="outline">
							Create Spreadsheet
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{spreadsheets.map((sheet) => (
							<Link
								href={`/editor/${sheet.id}`}
								key={sheet.id}
								className="group"
							>
								<Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer overflow-hidden group-hover:-translate-y-1">
									<div className="h-32 bg-secondary/50 flex items-center justify-center border-b group-hover:bg-secondary/70 transition-colors">
										<FileSpreadsheet className="h-12 w-12 text-muted-foreground/50 group-hover:text-primary transition-colors" />
									</div>
									<CardHeader className="p-4">
										<CardTitle className="truncate pr-4" title={sheet.name}>
											{sheet.name}
										</CardTitle>
										<CardDescription className="flex items-center justify-between mt-2 text-xs">
											<span>
												{new Date(sheet.lastModified).toLocaleDateString()}
											</span>
										</CardDescription>
									</CardHeader>
									<CardContent className="flex justify-end p-2">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
											onClick={(e) => deleteSpreadsheet(e, sheet.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
