"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";

export default function SettingsPage() {
	return (
		<div className="container mx-auto py-10 px-6 font-sans">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground mt-1">
					Manage your application preferences.
				</p>
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Appearance</CardTitle>
						<CardDescription>
							Customize how the application looks.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>Theme</Label>
								<p className="text-sm text-muted-foreground">
									Switch between light and dark mode.
								</p>
							</div>
							<ModeToggle />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
