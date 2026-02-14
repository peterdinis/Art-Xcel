"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw, Home, Download } from "lucide-react";

interface SpreadsheetErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function SpreadsheetError({
	error,
	reset,
}: SpreadsheetErrorProps) {
	useEffect(() => {
		console.error("Spreadsheet error:", error);
	}, [error]);

	const isNetworkError =
		error.message.includes("network") || error.message.includes("fetch");
	const isPermissionError =
		error.message.includes("permission") ||
		error.message.includes("unauthorized");
	const isNotFoundError =
		error.message.includes("not found") || error.message.includes("404");

	return (
		<div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-md w-full"
			>
				{/* Animated Excel logo with error */}
				<div className="relative mb-8 flex justify-center">
					<motion.div
						animate={{
							rotate: [0, 5, -5, 0],
							y: [0, -10, 0],
						}}
						transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
					>
						<div className="relative">
							<div className="w-32 h-32 bg-[#1D6F42] rounded-2xl shadow-lg flex items-center justify-center">
								<FileSpreadsheet className="w-16 h-16 text-white" />
							</div>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.3, type: "spring" }}
								className="absolute -top-2 -right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-white font-bold"
							>
								!
							</motion.div>
						</div>
					</motion.div>
				</div>

				{/* Dynamic error message based on error type */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="space-y-4 text-center"
				>
					<h2 className="text-2xl font-semibold text-foreground">
						{isNetworkError && "Network Error"}
						{isPermissionError && "Access Denied"}
						{isNotFoundError && "Spreadsheet Not Found"}
						{!isNetworkError &&
							!isPermissionError &&
							!isNotFoundError &&
							"Spreadsheet Error"}
					</h2>

					<div className="bg-muted p-4 rounded-lg">
						<p className="text-muted-foreground">
							{isNetworkError &&
								"Unable to connect to the server. Please check your internet connection."}
							{isPermissionError &&
								"You don't have permission to access this spreadsheet."}
							{isNotFoundError &&
								"The spreadsheet you're trying to access doesn't exist."}
							{!isNetworkError &&
								!isPermissionError &&
								!isNotFoundError &&
								error.message}
						</p>
					</div>

					{/* Recovery suggestions */}
					<div className="text-sm text-muted-foreground">
						{isNetworkError &&
							"Try refreshing the page or check your connection"}
						{isPermissionError && "Contact the owner to request access"}
						{isNotFoundError && "The file may have been deleted or moved"}
					</div>
				</motion.div>

				{/* Action buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
				>
					{!isPermissionError && !isNotFoundError && (
						<Button onClick={reset} variant="default" className="gap-2">
							<RefreshCw className="h-4 w-4" />
							Try Again
						</Button>
					)}

					<Button
						asChild
						variant={
							isPermissionError || isNotFoundError ? "default" : "outline"
						}
						className="gap-2"
					>
						<Link href="/">
							<Home className="h-4 w-4" />
							Go Home
						</Link>
					</Button>
				</motion.div>

				{/* Additional options */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="mt-6 text-center"
				>
					{isNotFoundError && (
						<Button asChild variant="link" className="gap-2">
							<Link href="/spreadsheets">
								<Download className="h-4 w-4" />
								Browse Other Spreadsheets
							</Link>
						</Button>
					)}
				</motion.div>
			</motion.div>
		</div>
	);
}
