"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";
import { useExcelService } from "@/hooks/use-excel-service";
import { Grid } from "@/components/editor/Grid";
import { Toolbar } from "@/components/editor/Toolbar";
import { FormulaBar } from "@/components/editor/FormulaBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
	Permission,
	ShareDialog,
	ShareSettings,
} from "@/components/share-dialog";

export default function EditorPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const {
		data,
		setData,
		selectedCell,
		updateCell,
		updateCellStyle,
		getCellFormula,
		selectCell,
	} = useSpreadsheet();
	const { exportToExcel, importFromExcel } = useExcelService();
	const [sheetName, setSheetName] = useState("Untitled Spreadsheet");

	// Share state
	const [shareSettings, setShareSettings] = useState<ShareSettings>({
		accessLevel: "private",
		linkPermission: "view",
		collaborators: [],
		expiryDate: null,
		password: null,
	});

	// Load data from localStorage
	useEffect(() => {
		const stored = localStorage.getItem("excel-editor-files");
		if (stored) {
			const spreadsheets = JSON.parse(stored);
			const currentSheet = spreadsheets.find((s: any) => s.id === id);
			if (currentSheet) {
				setSheetName(currentSheet.name);
				if (currentSheet.data) {
					setData(currentSheet.data);
				}
				// Load share settings if they exist
				if (currentSheet.shareSettings) {
					setShareSettings(currentSheet.shareSettings);
				}
			}
		}
	}, [id, setData]);

	// Auto-save
	useEffect(() => {
		const save = () => {
			const stored = localStorage.getItem("excel-editor-files");
			if (stored) {
				try {
					const spreadsheets = JSON.parse(stored);
					const index = spreadsheets.findIndex((s: any) => s.id === id);
					if (index !== -1) {
						spreadsheets[index] = {
							...spreadsheets[index],
							data,
							name: sheetName,
							shareSettings, // Save share settings
							lastModified: Date.now(),
						};
						localStorage.setItem(
							"excel-editor-files",
							JSON.stringify(spreadsheets),
						);
					}
				} catch (e) {
					console.error(e);
				}
			}
		};

		const timer = setTimeout(save, 1000);
		return () => clearTimeout(timer);
	}, [data, id, sheetName, shareSettings]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!selectedCell) return;

			if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
				const currentStyle = data[selectedCell]?.style || {};

				if (e.key.toLowerCase() === "b") {
					e.preventDefault();
					updateCellStyle(selectedCell, { bold: !currentStyle.bold });
				}
				if (e.key.toLowerCase() === "i") {
					e.preventDefault();
					updateCellStyle(selectedCell, { italic: !currentStyle.italic });
				}
				if (e.key.toLowerCase() === "u") {
					e.preventDefault();
					updateCellStyle(selectedCell, { underline: !currentStyle.underline });
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedCell, data, updateCellStyle]);

	const handleCellChange = (cellId: string, value: string) => {
		updateCell(cellId, value);
	};

	const handleFormulaBarChange = (value: string) => {
		if (selectedCell) {
			updateCell(selectedCell, value);
		}
	};

	const handleStyleChange = (style: any) => {
		if (selectedCell) {
			const currentStyle = data[selectedCell]?.style || {};
			const newStyle = { ...currentStyle, ...style };
			updateCellStyle(selectedCell, newStyle);
		}
	};

	const handleSave = useCallback(() => {
		toast.success("Saved", {
			description: "Your spreadsheet has been saved.",
		});
	}, []);

	const handleExport = useCallback(async () => {
		try {
			await exportToExcel(data, sheetName);
			toast.success("Export Successful", {
				description: "Your spreadsheet has been exported to Excel.",
			});
		} catch (error) {
			toast.error("Export Failed", {
				description: "There was an error exporting your spreadsheet.",
			});
		}
	}, [data, sheetName, exportToExcel]);

	const handleImport = useCallback(
		async (file: File) => {
			try {
				const { data: importedData, name: importedName } =
					await importFromExcel(file);
				setData(importedData);
				setSheetName(importedName);
				toast.success("Import Successful", {
					description: "Your Excel file has been imported.",
				});
			} catch (error) {
				toast.error("Import Failed", {
					description: "There was an error importing your Excel file.",
				});
			}
		},
		[importFromExcel, setData],
	);

	// Share handlers
	const handleShareSave = async (settings: ShareSettings) => {
		setShareSettings(settings);
		// You can add API call here for real sharing
		return Promise.resolve();
	};

	const handleInvite = async (emails: string[], permission: Permission) => {
		// Here you would typically send invitations via API
		console.log("Inviting:", emails, "with permission:", permission);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
	};

	const handleRemoveCollaborator = async (collaboratorId: string) => {
		// Here you would typically remove collaborator via API
		console.log("Removing collaborator:", collaboratorId);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));
	};

	const handleCopyLink = () => {
		// Custom copy link logic
		const shareUrl = `${window.location.origin}/share/${id}`;
		navigator.clipboard.writeText(shareUrl);
	};

	return (
		<div className="h-screen flex flex-col font-sans overflow-hidden">
			{/* Top Header */}
			<header className="h-14 border-b flex items-center justify-between px-4 bg-background">
				<div className="flex items-center gap-4">
					<Link href="/">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-5 w-5" />
						</Button>
					</Link>
					<div className="flex flex-col">
						<input
							className="text-sm font-semibold border-none outline-none bg-transparent hover:bg-muted/50 rounded px-1"
							value={sheetName}
							onChange={(e) => setSheetName(e.target.value)}
						/>
						<div className="text-xs text-muted-foreground flex gap-2">
							<span>File</span>
							<span>Edit</span>
							<span>View</span>
							<span>Insert</span>
							<span>Format</span>
							<span>Data</span>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{/* Share Dialog komponent */}
					<ShareDialog
						resourceName={sheetName}
						resourceType="spreadsheet"
						initialSettings={shareSettings}
						currentUserEmail="user@example.com" // Replace with actual user email
						currentUserId="current-user-id" // Replace with actual user ID
						onSave={handleShareSave}
						onInvite={handleInvite}
						onRemoveCollaborator={handleRemoveCollaborator}
						onCopyLink={handleCopyLink}
						isLoading={false}
					/>
					<div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
						U
					</div>
				</div>
			</header>

			{/* Toolbar */}
			<Toolbar
				onStyleChange={handleStyleChange}
				onExport={handleExport}
				onImport={handleImport}
				onSave={handleSave}
			/>

			{/* Formula Bar */}
			<FormulaBar
				selectedCell={selectedCell}
				value={selectedCell ? getCellFormula(selectedCell) : ""}
				onChange={handleFormulaBarChange}
			/>

			{/* Grid */}
			<Grid
				data={data}
				selectedCell={selectedCell}
				onSelectCell={selectCell}
				onCellChange={handleCellChange}
			/>
		</div>
	);
}
