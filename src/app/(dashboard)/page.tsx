"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Plus, FileSpreadsheet, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Spreadsheet {
	id: string;
	name: string;
	lastModified: number;
	deletedAt?: number;
}

// Loading komponent pre jednotlivú kartu
function SpreadsheetCardSkeleton() {
	return (
		<Card className="h-full overflow-hidden">
			<div className="h-32 bg-secondary/50 flex items-center justify-center border-b">
				<Skeleton className="h-12 w-12 rounded-full" />
			</div>
			<CardHeader className="p-4">
				<Skeleton className="h-5 w-32 mb-2" />
				<Skeleton className="h-3 w-24" />
			</CardHeader>
			<CardContent className="flex justify-end p-2">
				<Skeleton className="h-8 w-8 rounded-md" />
			</CardContent>
		</Card>
	);
}

// Loading komponent pre celú mriežku
function SpreadsheetGridSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{[...Array(8)].map((_, i) => (
				<SpreadsheetCardSkeleton key={i} />
			))}
		</div>
	);
}

// Hlavný obsah dashboardu
function DashboardContent() {
	const router = useRouter();
	const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		const loadSpreadsheets = async () => {
			setIsLoading(true);
			try {
				// Simulujeme načítanie pre lepšiu UX (aj keď je to localStorage)
				await new Promise(resolve => setTimeout(resolve, 500));
				
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
			} catch (error) {
				console.error("Failed to load spreadsheets:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadSpreadsheets();
	}, []);

	const createNewSpreadsheet = async () => {
		setIsCreating(true);
		
		// Simulujeme oneskorenie pre lepšiu UX
		await new Promise(resolve => setTimeout(resolve, 300));
		
		try {
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
		} catch (error) {
			console.error("Failed to create spreadsheet:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const deleteSpreadsheet = async (e: React.MouseEvent, id: string) => {
		e.preventDefault();
		e.stopPropagation();
		
		setIsDeleting(id);
		
		// Simulujeme oneskorenie pre lepšiu UX
		await new Promise(resolve => setTimeout(resolve, 300));

		try {
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
		} catch (error) {
			console.error("Failed to delete spreadsheet:", error);
		} finally {
			setIsDeleting(null);
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto py-10 px-6">
				<div className="flex items-center justify-between mb-8">
					<div>
						<Skeleton className="h-9 w-48 mb-2" />
						<Skeleton className="h-5 w-64" />
					</div>
					<Skeleton className="h-10 w-40 rounded-md" />
				</div>
				<SpreadsheetGridSkeleton />
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10 px-6">
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
					className="gap-2 shadow-lg hover:shadow-xl transition-all min-w-40"
					disabled={isCreating}
				>
					{isCreating ? (
						<>
							<Loader2 className="h-5 w-5 animate-spin" />
							Creating...
						</>
					) : (
						<>
							<Plus className="h-5 w-5" />
							New Spreadsheet
						</>
					)}
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
					<Button 
						onClick={createNewSpreadsheet} 
						variant="outline"
						disabled={isCreating}
					>
						{isCreating ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Creating...
							</>
						) : (
							"Create Spreadsheet"
						)}
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
							<Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer overflow-hidden group-hover:-translate-y-1 relative">
								{isDeleting === sheet.id && (
									<div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
										<Loader2 className="h-6 w-6 animate-spin text-primary" />
									</div>
								)}
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
										disabled={isDeleting === sheet.id}
									>
										{isDeleting === sheet.id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Trash2 className="h-4 w-4" />
										)}
									</Button>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

// Hlavný komponent s Suspense
export default function Dashboard() {
	return (
		<div className="min-h-screen bg-muted/40 font-sans">
			<header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6 shadow-sm">
				<div className="flex items-center gap-2 font-semibold text-lg text-primary">
					<FileSpreadsheet className="h-6 w-6" />
					<span>Excel Editor</span>
				</div>
			</header>

			<Suspense fallback={
				<main className="container mx-auto py-10 px-6">
					<div className="flex items-center justify-between mb-8">
						<div>
							<Skeleton className="h-9 w-48 mb-2" />
							<Skeleton className="h-5 w-64" />
						</div>
						<Skeleton className="h-10 w-40 rounded-md" />
					</div>
					<SpreadsheetGridSkeleton />
				</main>
			}>
				<DashboardContent />
			</Suspense>
		</div>
	);
}