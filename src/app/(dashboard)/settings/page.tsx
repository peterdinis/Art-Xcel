"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sun, Layout, Bell, Info } from "lucide-react";
import { useTheme } from "next-themes";

const STORAGE_KEYS = {
	showGrid: "excel-editor-showGrid",
	showHeaders: "excel-editor-showHeaders",
	defaultZoom: "excel-editor-defaultZoom",
	showSaveToasts: "excel-editor-showSaveToasts",
	showShortcutHints: "excel-editor-showShortcutHints",
} as const;

const ZOOM_OPTIONS = [75, 90, 100, 125, 150] as const;

function getStoredBoolean(key: string, fallback: boolean): boolean {
	if (typeof window === "undefined") return fallback;
	try {
		const v = localStorage.getItem(key);
		if (v === null) return fallback;
		return v === "true";
	} catch {
		return fallback;
	}
}

function getStoredZoom(fallback: number): number {
	if (typeof window === "undefined") return fallback;
	try {
		const v = localStorage.getItem(STORAGE_KEYS.defaultZoom);
		if (v === null) return fallback;
		const n = parseInt(v, 10);
		return ZOOM_OPTIONS.includes(n as (typeof ZOOM_OPTIONS)[number])
			? n
			: fallback;
	} catch {
		return fallback;
	}
}

export default function SettingsPage() {
	const { theme, setTheme } = useTheme();
	const [showGrid, setShowGrid] = useState(true);
	const [showHeaders, setShowHeaders] = useState(true);
	const [defaultZoom, setDefaultZoom] = useState(100);
	const [showSaveToasts, setShowSaveToasts] = useState(true);
	const [showShortcutHints, setShowShortcutHints] = useState(true);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		setShowGrid(getStoredBoolean(STORAGE_KEYS.showGrid, true));
		setShowHeaders(getStoredBoolean(STORAGE_KEYS.showHeaders, true));
		setDefaultZoom(getStoredZoom(100));
		setShowSaveToasts(getStoredBoolean(STORAGE_KEYS.showSaveToasts, true));
		setShowShortcutHints(
			getStoredBoolean(STORAGE_KEYS.showShortcutHints, true),
		);
	}, []);

	const updateStorage = (key: string, value: boolean | number) => {
		if (typeof window === "undefined") return;
		localStorage.setItem(key, String(value));
	};

	return (
		<div className="container mx-auto py-10 px-6 font-sans max-w-3xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground mt-1">
					Manage your application and editor preferences.
				</p>
			</div>

			<div className="grid gap-6">
				{/* Appearance */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sun className="h-5 w-5" />
							Appearance
						</CardTitle>
						<CardDescription>
							Customize how the application looks. Theme applies across the app
							and editor.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>Theme</Label>
								<p className="text-sm text-muted-foreground">
									Switch between light, dark, or system.
								</p>
							</div>
							{mounted && (
								<Select
									value={theme ?? "system"}
									onValueChange={(v) =>
										setTheme(v as "light" | "dark" | "system")
									}
								>
									<SelectTrigger className="w-32.5 h-9">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="light">Light</SelectItem>
										<SelectItem value="dark">Dark</SelectItem>
										<SelectItem value="system">System</SelectItem>
									</SelectContent>
								</Select>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Editor */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Layout className="h-5 w-5" />
							Editor
						</CardTitle>
						<CardDescription>
							Default behavior when you open a spreadsheet. Changes apply to new
							sessions.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>Default zoom</Label>
								<p className="text-sm text-muted-foreground">
									Initial zoom level when opening a sheet.
								</p>
							</div>
							<Select
								value={String(defaultZoom)}
								onValueChange={(v) => {
									const n = parseInt(v, 10);
									setDefaultZoom(n);
									updateStorage(STORAGE_KEYS.defaultZoom, n);
								}}
							>
								<SelectTrigger className="w-25 h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{ZOOM_OPTIONS.map((z) => (
										<SelectItem key={z} value={String(z)}>
											{z}%
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>Show grid lines</Label>
								<p className="text-sm text-muted-foreground">
									Show cell borders in the spreadsheet.
								</p>
							</div>
							<Switch
								checked={showGrid}
								onCheckedChange={(checked) => {
									setShowGrid(checked);
									updateStorage(STORAGE_KEYS.showGrid, checked);
								}}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>Show row & column headers</Label>
								<p className="text-sm text-muted-foreground">
									Show row numbers and column letters (A, B, C…).
								</p>
							</div>
							<Switch
								checked={showHeaders}
								onCheckedChange={(checked) => {
									setShowHeaders(checked);
									updateStorage(STORAGE_KEYS.showHeaders, checked);
								}}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Notifications */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="h-5 w-5" />
							Notifications
						</CardTitle>
						<CardDescription>
							Control when you see toasts and hints.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>Save confirmations</Label>
								<p className="text-sm text-muted-foreground">
									Show a toast when the spreadsheet is saved.
								</p>
							</div>
							<Switch
								checked={showSaveToasts}
								onCheckedChange={(checked) => {
									setShowSaveToasts(checked);
									updateStorage(STORAGE_KEYS.showSaveToasts, checked);
								}}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>Keyboard shortcut hints</Label>
								<p className="text-sm text-muted-foreground">
									Show shortcut hints in context menus and tooltips.
								</p>
							</div>
							<Switch
								checked={showShortcutHints}
								onCheckedChange={(checked) => {
									setShowShortcutHints(checked);
									updateStorage(STORAGE_KEYS.showShortcutHints, checked);
								}}
							/>
						</div>
					</CardContent>
				</Card>

				{/* About */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Info className="h-5 w-5" />
							About
						</CardTitle>
						<CardDescription>Application information.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>
							<strong className="text-foreground">Art-Xcel</strong> —
							Spreadsheet editor
						</p>
						<p>Version 0.1.0 (Premium Edition)</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
