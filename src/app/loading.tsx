"use client";

import { motion } from "framer-motion";

export default function Loading() {
	return (
		<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
				className="flex flex-col items-center gap-6"
			>
				{/* Excel logo container */}
				<div className="relative">
					{/* Rotating circle */}
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
						className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
					/>

					{/* Pulsing Excel logo */}
					<motion.div
						animate={{
							scale: [1, 1.05, 1],
							boxShadow: [
								"0 10px 30px -10px rgba(0,0,0,0.2)",
								"0 20px 40px -10px rgba(29,111,66,0.3)",
								"0 10px 30px -10px rgba(0,0,0,0.2)",
							],
						}}
						transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
						className="relative w-24 h-24 bg-[#1D6F42] rounded-2xl shadow-lg flex items-center justify-center"
					>
						<motion.svg
							className="w-14 h-14 text-white"
							viewBox="0 0 24 24"
							fill="currentColor"
							animate={{
								rotate: [0, 5, -5, 0],
							}}
							transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
						>
							<path d="M21 17c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v10z M9 15h2v2H9v-2z M9 11h2v2H9v-2z M9 7h2v2H9V7z M13 15h2v2h-2v-2z M13 11h2v2h-2v-2z M13 7h2v2h-2V7z" />
						</motion.svg>
					</motion.div>
				</div>

				{/* Loading text with animated dots */}
				<div className="flex items-center gap-1">
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="text-lg font-medium text-foreground"
					>
						Loading
					</motion.span>
					<motion.span
						animate={{ opacity: [0, 1, 0] }}
						transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
						className="text-lg font-medium"
					>
						.
					</motion.span>
					<motion.span
						animate={{ opacity: [0, 1, 0] }}
						transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
						className="text-lg font-medium"
					>
						.
					</motion.span>
					<motion.span
						animate={{ opacity: [0, 1, 0] }}
						transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
						className="text-lg font-medium"
					>
						.
					</motion.span>
				</div>

				{/* Progress bar */}
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: "100%" }}
					transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
					className="h-1 bg-primary rounded-full w-48"
				/>
			</motion.div>
		</div>
	);
}
