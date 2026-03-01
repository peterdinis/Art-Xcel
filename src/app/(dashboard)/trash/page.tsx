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
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Spreadsheet {
	id: string;
	name: string;
	lastModified: number;
	deletedAt?: number;
}

function TrashCardSkeleton() {
	return (
		<Card className="overflow-hidden">
			<div className="h-32 bg-secondary/50 flex items-center justify-center border-b">
				<div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
			</div>
			<CardHeader className="p-4">
				<div className="h-5 w-32 bg-muted rounded animate-pulse mb-2" />
				<div className="h-3 w-24 bg-muted rounded animate-pulse" />
			</CardHeader>
			<CardContent className="p-4 pt-0 flex gap-2 justify-end">
				<div className="h-8 w-16 bg-muted rounded animate-pulse" />
				<div className="h-8 w-8 bg-muted rounded animate-pulse" />
			</CardContent>
		</Card>
	);
}

export default function TrashPage() {
	const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [restoringId, setRestoringId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	useEffect(() => {
		const loadTrash = async () => {
			setIsLoading(true);
			try {
				// Simulate loading for better UX
				await new Promise((resolve) => setTimeout(resolve, 500));

				const stored = localStorage.getItem("excel-editor-files");
				if (stored) {
					try {
						const parsed = JSON.parse(stored);
						const deleted = parsed.filter((s: Spreadsheet) => s.deletedAt);
						setSpreadsheets(deleted);
					} catch (e) {
						console.error("Failed to parse local storage", e);
						toast.error("Failed to load deleted files");
					}
				}
			} finally {
				setIsLoading(false);
			}
		};

		loadTrash();
	}, []);

	const restoreSpreadsheet = async (id: string, name: string) => {
		setRestoringId(id);

		// Simulate loading for better UX
		await new Promise((resolve) => setTimeout(resolve, 300));

		try {
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

				toast.success(`"${name}" has been restored`, {
					description: "You can find it in your spreadsheets",
					duration: 3000,
				});
			}
		} catch (error) {
			toast.error("Failed to restore spreadsheet");
			console.error("Restore error:", error);
		} finally {
			setRestoringId(null);
		}
	};

	const permanentlyDelete = async (id: string, name: string) => {
		setDeletingId(id);

		// Simulate loading for better UX
		await new Promise((resolve) => setTimeout(resolve, 300));

		try {
			const stored = localStorage.getItem("excel-editor-files");
			if (stored) {
				const allFiles = JSON.parse(stored);
				const updated = allFiles.filter((s: Spreadsheet) => s.id !== id);
				localStorage.setItem("excel-editor-files", JSON.stringify(updated));
				setSpreadsheets((prev) => prev.filter((s) => s.id !== id));

				toast.success(`"${name}" permanently deleted`, {
					description: "The file has been removed from trash",
					duration: 3000,
				});
			}
		} catch (error) {
			toast.error("Failed to delete spreadsheet");
			console.error("Delete error:", error);
		} finally {
			setDeletingId(null);
		}
	};

	const handlePermanentDelete = (id: string, name: string) => {
		toast.custom(
			(t) => (
				<motion.div
					initial={{ opacity: 0, y: -20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 20, scale: 0.95 }}
					className="bg-background border rounded-lg shadow-lg p-4 max-w-md"
				>
					<h3 className="font-semibold text-lg">Permanently delete?</h3>
					<p className="text-sm text-muted-foreground mt-1">
						Are you sure you want to permanently delete "{name}"? This action
						cannot be undone.
					</p>
					<div className="flex gap-2 justify-end mt-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => toast.dismiss(t)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => {
								permanentlyDelete(id, name);
								toast.dismiss(t);
							}}
						>
							Delete Forever
						</Button>
					</div>
				</motion.div>
			),
			{
				duration: Infinity,
				position: "top-center",
			},
		);
	};

	// Animation variants
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

	const headerVariants = {
		hidden: { y: -20, opacity: 0 },
		show: { y: 0, opacity: 1 },
	};

	const emptyStateVariants = {
		hidden: { scale: 0.95, opacity: 0 },
		show: { scale: 1, opacity: 1 },
	};

	if (isLoading) {
		return (
			<div className="container mx-auto py-10 px-6 font-sans">
				<motion.div
					initial="hidden"
					animate="show"
					variants={headerVariants}
					className="mb-8"
				>
					<div className="h-9 w-24 bg-muted rounded animate-pulse mb-2" />
					<div className="h-5 w-64 bg-muted rounded animate-pulse" />
				</motion.div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{[...Array(4)].map((_, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.1 }}
						>
							<TrashCardSkeleton />
						</motion.div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10 px-6 font-sans">
			<motion.div
				variants={headerVariants}
				initial="hidden"
				animate="show"
				className="mb-8"
			>
				<h1 className="text-3xl font-bold tracking-tight">Trash</h1>
				<p className="text-muted-foreground mt-1">
					Restore or permanently delete your spreadsheets.
				</p>
			</motion.div>

			<AnimatePresence mode="wait">
				{spreadsheets.length === 0 ? (
					<motion.div
						key="empty"
						variants={emptyStateVariants}
						initial="hidden"
						animate="show"
						exit={{ opacity: 0, scale: 0.95 }}
						className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl bg-background text-center"
					>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						>
							<Trash2 className="h-10 w-10 text-muted-foreground mb-4" />
						</motion.div>
						<motion.h3
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="text-xl font-semibold mb-2"
						>
							Trash is empty
						</motion.h3>
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className="text-muted-foreground"
						>
							No deleted files found.
						</motion.p>
					</motion.div>
				) : (
					<motion.div
						key="grid"
						variants={containerVariants}
						initial="hidden"
						animate="show"
						className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
					>
						{spreadsheets.map((sheet) => (
							<motion.div
								key={sheet.id}
								variants={itemVariants}
								exit={{ opacity: 0, scale: 0.9 }}
								layout
							>
								<Card className="group overflow-hidden relative">
									{(restoringId === sheet.id || deletingId === sheet.id) && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-[1px]"
										>
											<motion.div
												animate={{ rotate: 360 }}
												transition={{
													duration: 1,
													repeat: Infinity,
													ease: "linear",
												}}
												className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
											/>
										</motion.div>
									)}
									<div className="h-32 bg-secondary/50 flex items-center justify-center border-b relative overflow-hidden">
										<motion.div
											initial={false}
											animate={
												restoringId === sheet.id || deletingId === sheet.id
													? { scale: 1.2, opacity: 0.5 }
													: { scale: 1, opacity: 1 }
											}
											className="relative"
										>
											<FileSpreadsheet className="h-12 w-12 text-muted-foreground/50" />
										</motion.div>
										<motion.div
											className="absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-transparent"
											initial={{ x: "-100%" }}
											whileHover={{ x: "100%" }}
											transition={{ duration: 0.5 }}
										/>
									</div>
									<CardHeader className="p-4">
										<motion.div
											whileHover={{ x: 5 }}
											transition={{ type: "spring", stiffness: 300 }}
										>
											<CardTitle className="truncate" title={sheet.name}>
												{sheet.name}
											</CardTitle>
											<CardDescription className="text-xs mt-1">
												Deleted:{" "}
												{new Date(sheet.deletedAt!).toLocaleDateString()}
											</CardDescription>
										</motion.div>
									</CardHeader>
									<CardContent className="p-4 pt-0 flex gap-2 justify-end">
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Button
												variant="outline"
												size="sm"
												onClick={() => restoreSpreadsheet(sheet.id, sheet.name)}
												title="Restore"
												disabled={
													restoringId === sheet.id || deletingId === sheet.id
												}
											>
												<motion.span
													animate={
														restoringId === sheet.id ? { rotate: 360 } : {}
													}
													transition={{
														duration: 1,
														repeat: Infinity,
														ease: "linear",
													}}
												>
													<RotateCcw className="h-4 w-4 mr-1" />
												</motion.span>
												Restore
											</Button>
										</motion.div>
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Button
												variant="destructive"
												size="sm"
												onClick={() =>
													handlePermanentDelete(sheet.id, sheet.name)
												}
												title="Delete Permanently"
												disabled={
													restoringId === sheet.id || deletingId === sheet.id
												}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</motion.div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
