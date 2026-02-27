import { AppSidebar } from "@/components/shared/app-sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen bg-background font-sans">
			<AppSidebar />
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	);
}
