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
import { motion, AnimatePresence } from "framer-motion";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";

import { SheetData } from "@/hooks/use-spreadsheet";

export interface Spreadsheet {
	id: string;
	name: string;
	lastModified: number;
	deletedAt?: number;
	data?: SheetData;
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

	// Animácie pre framer-motion
	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		show: { y: 0, opacity: 1 },
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
		<main className="container mx-auto py-10 px-6">
			<motion.div
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className="flex items-center justify-between mb-8"
			>
				<div>
					<h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Dashboard</h1>
					<p className="text-muted-foreground mt-1 text-sm md:text-base">
						Manage your spreadsheets and create new ones with power and ease.
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
			</motion.div>

			<ExcelUpload onUploadComplete={(newFile) => {
				console.log("Upload complete, adding to state:", newFile);
				setSpreadsheets((prev) => [newFile, ...prev]);
			}} />

			<AnimatePresence mode="wait">
				{spreadsheets.length === 0 ? (
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl bg-background/50 backdrop-blur-sm text-center"
					>
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
					</motion.div>
				) : (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="show"
						className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
					>
						{spreadsheets.map((sheet) => (
							<motion.div key={sheet.id} variants={itemVariants}>
								<Link
									href={`/editor/${sheet.id}`}
									className="group block h-full"
								>
									<Card className="h-full transition-all duration-300 hover:shadow-2xl hover:border-primary/50 cursor-pointer overflow-hidden relative border-muted-foreground/10 flex flex-col">
										{isDeleting === sheet.id && (
											<div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
												<Loader2 className="h-6 w-6 animate-spin text-primary" />
											</div>
										)}
										<div className="h-32 bg-secondary/30 flex items-center justify-center border-b group-hover:bg-secondary/50 transition-colors relative overflow-hidden">
											<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
											<FileSpreadsheet className="h-12 w-12 text-muted-foreground/40 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
										</div>
										<CardHeader className="p-4 flex-1">
											<CardTitle className="truncate pr-4 text-base font-semibold group-hover:text-primary transition-colors" title={sheet.name}>
												{sheet.name}
											</CardTitle>
											<CardDescription className="flex items-center justify-between mt-2 text-xs">
												<span>
													Last modified: {new Date(sheet.lastModified).toLocaleDateString()}
												</span>
											</CardDescription>
										</CardHeader>
										<CardContent className="flex justify-end p-2 pt-0">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
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
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}

// Hlavný komponent s Suspense
export default function Dashboard() {
	return (
		<div className="min-h-screen bg-muted/20 font-sans">
			<header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background/80 backdrop-blur-md px-6 shadow-sm">
				<div className="flex items-center gap-2 font-bold text-xl text-primary">
					<div className="bg-primary/10 p-1.5 rounded-lg">
						<FileSpreadsheet className="h-6 w-6" />
					</div>
					<span className="tracking-tight">Art-Xcel</span>
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