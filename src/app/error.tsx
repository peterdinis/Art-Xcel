"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, Mail } from "lucide-react";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	useEffect(() => {
		// Log error to error reporting service
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-md w-full text-center"
			>
				{/* Animated error icon */}
				<motion.div
					animate={{
						rotate: [0, 5, -5, 0],
						scale: [1, 1.1, 1],
					}}
					transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
					className="mb-6 inline-block"
				>
					<div className="relative">
						<AlertCircle className="w-24 h-24 text-destructive/20" />
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring" }}
							className="absolute inset-0 flex items-center justify-center"
						>
							<span className="text-4xl font-bold text-destructive">!</span>
						</motion.div>
					</div>
				</motion.div>

				{/* Error message */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="space-y-4"
				>
					<h2 className="text-2xl font-semibold text-foreground">
						Oops! Something went wrong
					</h2>
					<div className="bg-destructive/10 p-4 rounded-lg">
						<p className="text-destructive font-mono text-sm break-all">
							{error.message || "An unexpected error occurred"}
						</p>
						{error.digest && (
							<p className="text-xs text-muted-foreground mt-2">
								Error ID: {error.digest}
							</p>
						)}
					</div>
				</motion.div>

				{/* Action buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
				>
					<Button onClick={reset} variant="default" className="gap-2">
						<RefreshCw className="h-4 w-4" />
						Try Again
					</Button>
					<Button asChild variant="outline" className="gap-2">
						<Link href="/">
							<Home className="h-4 w-4" />
							Go Home
						</Link>
					</Button>
				</motion.div>

				{/* Error actions */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="mt-6 space-y-3"
				>
					<Button asChild variant="link" className="gap-2">
						<Link href="/report">
							<Mail className="h-4 w-4" />
							Report this issue
						</Link>
					</Button>

					<p className="text-sm text-muted-foreground">
						If the problem persists, please{" "}
						<Link href="/support" className="text-primary hover:underline">
							contact support
						</Link>
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}
