import { Skeleton } from "@/components/ui/skeleton";

export function EditorSkeleton() {
	return (
		<div className="h-screen flex flex-col font-sans overflow-hidden">
			{/* Header Skeleton */}
			<header className="h-14 border-b flex items-center justify-between px-4 bg-background">
				<div className="flex items-center gap-4">
					<Skeleton className="h-9 w-9 rounded" />
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-6 w-6 rounded" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-12" />
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-9 w-9 rounded" />
					<Skeleton className="h-9 w-9 rounded" />
					<Skeleton className="h-8 w-8 rounded-full" />
				</div>
			</header>

			{/* Toolbar Skeleton */}
			<div className="h-12 border-b flex items-center px-4 gap-2">
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
				<div className="w-px h-6 bg-border mx-2" />
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
				<Skeleton className="h-8 w-8" />
				<div className="w-px h-6 bg-border mx-2" />
				<Skeleton className="h-8 w-20" />
				<Skeleton className="h-8 w-20" />
			</div>

			{/* Formula Bar Skeleton */}
			<div className="h-10 border-b flex items-center px-4 gap-2">
				<Skeleton className="h-6 w-16" />
				<Skeleton className="h-6 flex-1" />
			</div>

			{/* Grid Skeleton */}
			<div className="flex-1 overflow-auto p-4">
				<div className="grid grid-cols-8 gap-1">
					{[...Array(40)].map((_, i) => (
						<Skeleton key={i} className="h-8 w-24" />
					))}
				</div>
			</div>
		</div>
	);
}
