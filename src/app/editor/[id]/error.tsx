"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
	FileSpreadsheet, 
	RefreshCw, 
	Home, 
	Download, 
	AlertCircle, 
	ChevronRight, 
	ChevronDown,
	Terminal,
	Code2,
	Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpreadsheetErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function SpreadsheetError({
	error,
	reset,
}: SpreadsheetErrorProps) {
	const [showDetails, setShowDetails] = useState(false);
	const [errorInfo, setErrorInfo] = useState<{
		file?: string;
		line?: string;
		column?: string;
		stack?: string;
	}>({});

	useEffect(() => {
		console.error("Spreadsheet Critical Error:", error);
		
		// Attempt to parse stack trace for file information
		if (error.stack) {
			const stackLines = error.stack.split("\n");
			// Usually the second line contains the actual source of the error
			const callerLine = stackLines[1] || stackLines[0];
			const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at (.*):(\d+):(\d+)/);
			
			if (match) {
				setErrorInfo({
					file: match[1].split("/").pop(), // Just the filename
					line: match[2],
					column: match[3],
					stack: error.stack
				});
			} else {
				setErrorInfo({ stack: error.stack });
			}
		}
	}, [error]);

	const isNetworkError =
		error.message.includes("network") || error.message.includes("fetch");
	const isPermissionError =
		error.message.includes("permission") ||
		error.message.includes("unauthorized");
	const isNotFoundError =
		error.message.includes("not found") || error.message.includes("404");

	return (
		<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 selection:bg-red-500/30">
			{/* Background Decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]" />
				<div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-zinc-900/20 rounded-full blur-[120px]" />
			</div>

			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className="max-w-2xl w-full relative z-10"
			>
				<div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
					{/* Header Section */}
					<div className="p-8 pb-4">
						<div className="flex items-start gap-6">
							<div className="relative flex-shrink-0">
								<motion.div
									animate={{ 
										boxShadow: ["0 0 0px rgba(239, 68, 68, 0)", "0 0 20px rgba(239, 68, 68, 0.2)", "0 0 0px rgba(239, 68, 68, 0)"]
									}}
									transition={{ duration: 2, repeat: Infinity }}
									className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20"
								>
									<AlertCircle className="w-8 h-8 text-red-500" />
								</motion.div>
							</div>

							<div className="flex-1 space-y-1">
								<h2 className="text-2xl font-bold text-white tracking-tight">
									{isNetworkError && "Connection Interrupted"}
									{isPermissionError && "Access Restricted"}
									{isNotFoundError && "Sheet Not Found"}
									{!isNetworkError && !isPermissionError && !isNotFoundError && "Runtime Exception"}
								</h2>
								<p className="text-zinc-400 text-sm leading-relaxed max-w-md">
									Art-Xcel encountered an unexpected state while processing your request. 
									The application has been paused to prevent data corruption.
								</p>
							</div>
						</div>
					</div>

					{/* Error Card */}
					<div className="px-8 py-4">
						<div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 group transition-colors hover:border-zinc-700/50">
							<div className="flex items-center gap-3 mb-2 text-zinc-500">
								<Code2 className="w-4 h-4" />
								<span className="text-[10px] font-bold uppercase tracking-widest">Error Message</span>
							</div>
							<p className="text-red-400 font-mono text-sm break-all leading-relaxed">
								{error.message || "An unknown error occurred within the spreadsheet engine."}
							</p>
							
							{errorInfo.file && (
								<div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-red-500/5 border border-red-500/10 rounded-lg w-fit">
									<Terminal className="w-3.5 h-3.5 text-red-500/70" />
									<span className="text-xs text-red-200/70 font-mono">
										Source: <span className="text-red-400 font-bold">{errorInfo.file}</span>:{errorInfo.line}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Technical Details Toggle */}
					<div className="px-8 pb-2">
						<button
							onClick={() => setShowDetails(!showDetails)}
							className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors py-2"
						>
							{showDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
							Technical Stack Trace
						</button>
						
						<AnimatePresence>
							{showDetails && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									className="overflow-hidden"
								>
									<div className="mt-2 bg-zinc-950 rounded-xl p-4 border border-zinc-800 font-mono text-[11px] text-zinc-500 overflow-x-auto max-h-[200px] custom-scrollbar">
										<pre className="whitespace-pre-wrap leading-normal">
											{errorInfo.stack || "No stack trace available for this environment."}
										</pre>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Actions */}
					<div className="p-8 pt-6 bg-zinc-900/50 border-t border-zinc-800/50 flex flex-col sm:flex-row gap-3">
						{!isPermissionError && !isNotFoundError && (
							<Button 
								onClick={reset} 
								className="bg-white text-black hover:bg-zinc-200 h-11 px-6 rounded-xl font-semibold gap-2 shadow-lg shadow-white/5 active:scale-95 transition-all"
							>
								<RefreshCw className="h-4 w-4" />
								Attempt Recovery
							</Button>
						)}

						<Button
							asChild
							variant="outline"
							className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white h-11 px-6 rounded-xl font-semibold gap-2 active:scale-95 transition-all"
						>
							<Link href="/">
								<Home className="h-4 w-4" />
								Back to Dashboard
							</Link>
						</Button>

						<div className="flex-1" />

						<Button
							variant="ghost"
							className="text-zinc-500 hover:text-zinc-300 hover:bg-transparent h-11 gap-2"
							onClick={() => window.open('https://github.com', '_blank')}
						>
							<Search className="h-4 w-4" />
							Report Issue
						</Button>
					</div>
				</div>

				<p className="text-center mt-6 text-zinc-600 text-[10px] font-medium tracking-widest uppercase">
					Art-Xcel Spreadsheet Engine v2.4.1 • Internal Reference: {error.digest || "NULL_EXCEPTION"}
				</p>
			</motion.div>
		</div>
	);
}
