"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import {
	Upload,
	Keyboard,
	BookOpen,
	FunctionSquare,
	BarChart3,
	Database,
	AtSign,
	Scissors,
	Plus,
} from "lucide-react";

interface EditorDialogsProps {
	// Find & Replace
	showFindDialog: boolean;
	setShowFindDialog: (open: boolean) => void;
	findText: string;
	setFindText: (text: string) => void;
	replaceText: string;
	setReplaceText: (text: string) => void;
	matchCase: boolean;
	setMatchCase: (match: boolean) => void;
	wholeCell: boolean;
	setWholeCell: (whole: boolean) => void;
	handleFind: () => void;
	handleReplace: () => void;

	// New Sheet
	showNewSheetDialog: boolean;
	setShowNewSheetDialog: (open: boolean) => void;
	newSheetName: string;
	setNewSheetName: (name: string) => void;
	sheetNames: string[];
	handleCreateSheet: () => void;

	// Named Range
	showNamedRangeDialog: boolean;
	setShowNamedRangeDialog: (open: boolean) => void;
	newRangeName: string;
	setNewRangeName: (name: string) => void;
	newRangeRef: string;
	setNewRangeRef: (ref: string) => void;
	handleCreateNamedRange: () => void;

	// Note
	showNoteDialog: boolean;
	setShowNoteDialog: (open: boolean) => void;
	cellNote: string;
	setCellNote: (note: string) => void;
	selectedCell: string | null;
	handleSaveNote: () => void;

	// Validation
	showValidationDialog: boolean;
	setShowValidationDialog: (open: boolean) => void;
	validationType: "number" | "text" | "list" | "date";
	setValidationType: (type: "number" | "text" | "list" | "date") => void;
	validationMin: number;
	setValidationMin: (min: number) => void;
	validationMax: number;
	setValidationMax: (max: number) => void;
	validationList: string;
	setValidationList: (list: string) => void;
	validationRequired: boolean;
	setValidationRequired: (required: boolean) => void;
	handleSaveValidation: () => void;

	// Export
	showExportDialog: boolean;
	setShowExportDialog: (open: boolean) => void;
	handleExport: (format: string) => void;

	// Import
	showImportDialog: boolean;
	setShowImportDialog: (open: boolean) => void;
	handleImport: (file: File) => void;

	// Page Setup
	showPageSetupDialog: boolean;
	setShowPageSetupDialog: (open: boolean) => void;
	handlePageSetup: () => void;

	// Print
	showPrintDialog: boolean;
	setShowPrintDialog: (open: boolean) => void;
	handlePrint: () => void;

	// Clear Sheet
	showDeleteDialog: boolean;
	setShowDeleteDialog: (open: boolean) => void;
	handleClearAll: () => void;

	// Chart
	showChartDialog: boolean;
	setShowChartDialog: (open: boolean) => void;
	chartTitle: string;
	setChartTitle: (title: string) => void;
	chartType: "bar" | "line" | "pie";
	setChartType: (type: "bar" | "line" | "pie") => void;
	chartRange?: string;
	setChartRange?: (range: string) => void;
	handleInsertChart: () => void;

	// Icon
	showIconDialog: boolean;
	setShowIconDialog: (open: boolean) => void;
	iconName: string;
	setIconName: (name: string) => void;
	handleInsertIcon: (name: string) => void;

	// Shortcuts
	showShortcutsDialog: boolean;
	setShowShortcutsDialog: (open: boolean) => void;

	// User Guide
	showUserGuideDialog: boolean;
	setShowUserGuideDialog: (open: boolean) => void;

	// About
	showAboutDialog?: boolean;
	setShowAboutDialog?: (open: boolean) => void;

	// Additional Features
	showSpecialCharDialog: boolean;
	setShowSpecialCharDialog: (open: boolean) => void;
	showHyperlinkDialog: boolean;
	setShowHyperlinkDialog: (open: boolean) => void;
	showCommentDialog: boolean;
	setShowCommentDialog: (open: boolean) => void;
	showConditionalFormattingDialog: boolean;
	setShowConditionalFormattingDialog: (open: boolean) => void;
	handleInsertSpecialChar: (char: string) => void;
	handleInsertHyperlink: (url: string, text: string) => void;
	handleInsertComment: (comment: string) => void;
	handleApplyConditionalFormatting: (rule: { type: string; value: string; color: string }) => void;

	// Platform detection
	isMac?: boolean;
}

export const EditorDialogs: React.FC<EditorDialogsProps> = (props) => {
	const {
		showFindDialog,
		setShowFindDialog,
		findText,
		setFindText,
		replaceText,
		setReplaceText,
		matchCase,
		setMatchCase,
		wholeCell,
		setWholeCell,
		handleFind,
		handleReplace,
		showNewSheetDialog,
		setShowNewSheetDialog,
		newSheetName,
		setNewSheetName,
		sheetNames,
		handleCreateSheet,
		showNamedRangeDialog,
		setShowNamedRangeDialog,
		newRangeName,
		setNewRangeName,
		newRangeRef,
		setNewRangeRef,
		handleCreateNamedRange,
		showNoteDialog,
		setShowNoteDialog,
		cellNote,
		setCellNote,
		selectedCell,
		handleSaveNote,
		showValidationDialog,
		setShowValidationDialog,
		validationType,
		setValidationType,
		validationMin,
		setValidationMin,
		validationMax,
		setValidationMax,
		validationList,
		setValidationList,
		validationRequired,
		setValidationRequired,
		handleSaveValidation,
		showExportDialog,
		setShowExportDialog,
		handleExport,
		showImportDialog,
		setShowImportDialog,
		handleImport,
		showPageSetupDialog,
		setShowPageSetupDialog,
		handlePageSetup,
		showPrintDialog,
		setShowPrintDialog,
		handlePrint,
		showDeleteDialog,
		setShowDeleteDialog,
		handleClearAll,
		showChartDialog,
		setShowChartDialog,
		chartTitle,
		setChartTitle,
		chartType,
		setChartType,
		chartRange,
		setChartRange,
		handleInsertChart,
		showIconDialog,
		setShowIconDialog,
		iconName,
		setIconName,
		handleInsertIcon,
		showShortcutsDialog,
		setShowShortcutsDialog,
		showUserGuideDialog,
		setShowUserGuideDialog,
		showSpecialCharDialog,
		setShowSpecialCharDialog,
		showHyperlinkDialog,
		setShowHyperlinkDialog,
		showCommentDialog,
		setShowCommentDialog,
		showConditionalFormattingDialog,
		setShowConditionalFormattingDialog,
		handleInsertSpecialChar,
		handleInsertHyperlink,
		handleInsertComment,
		handleApplyConditionalFormatting,
		showAboutDialog,
		setShowAboutDialog,
		isMac = false,
	} = props;

	const [hyperlinkUrl, setHyperlinkUrl] = useState("");
	const [hyperlinkText, setHyperlinkText] = useState("");
	const [commentText, setCommentText] = useState("");
	const [cfType, setCfType] = useState("greaterThan");
	const [cfValue, setCfValue] = useState("");
	const [cfColor, setCfColor] = useState("#fef08a"); // Default yellow

	const specialChars = [
		"©", "®", "™", "§", "¶", "†", "‡", "•", "–", "—",
		"€", "£", "¥", "¢", "¤", "±", "×", "÷", "≈", "≠",
		"≤", "≥", "∞", "√", "∑", "∆", "∏", "µ", "π", "Ω",
		"α", "β", "γ", "δ", "ε", "θ", "λ", "ω", "ø", "←",
		"↑", "→", "↓", "↔", "♠", "♣", "♥", "♦", "♩", "♪"
	];

	// Helper function to format shortcuts based on platform
	const getShortcutText = (shortcut: string): string => {
		if (isMac) {
			return shortcut
				.replace(/Ctrl\+/g, "⌘")
				.replace(/Alt\+/g, "⌥")
				.replace(/Shift\+/g, "⇧");
		}
		return shortcut;
	};

	return (
		<>
			{/* Find & Replace Dialog */}
			<Dialog open={showFindDialog} onOpenChange={setShowFindDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Find and Replace</DialogTitle>
						<DialogDescription>
							Search for text and replace it with new content.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="find">Find</Label>
							<Input
								id="find"
								value={findText}
								onChange={(e) => setFindText(e.target.value)}
								placeholder="Text to find..."
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="replace">Replace with</Label>
							<Input
								id="replace"
								value={replaceText}
								onChange={(e) => setReplaceText(e.target.value)}
								placeholder="Replacement text..."
							/>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="match-case"
								checked={matchCase}
								onCheckedChange={setMatchCase}
							/>
							<Label htmlFor="match-case">Match case</Label>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="whole-cell"
								checked={wholeCell}
								onCheckedChange={setWholeCell}
							/>
							<Label htmlFor="whole-cell">Match entire cell contents</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowFindDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handleFind}>Find Next</Button>
						<Button onClick={handleReplace}>Replace</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* New Sheet Dialog */}
			<Dialog open={showNewSheetDialog} onOpenChange={setShowNewSheetDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Sheet</DialogTitle>
						<DialogDescription>
							Enter a name for the new sheet.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="sheet-name">Sheet Name</Label>
							<Input
								id="sheet-name"
								value={newSheetName}
								onChange={(e) => setNewSheetName(e.target.value)}
								placeholder={`Sheet${sheetNames.length + 1}`}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowNewSheetDialog(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleCreateSheet}>Create Sheet</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Named Range Dialog */}
			<Dialog
				open={showNamedRangeDialog}
				onOpenChange={setShowNamedRangeDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Define Named Range</DialogTitle>
						<DialogDescription>
							Give a name to the selected cell or range.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="range-name">Range Name</Label>
							<Input
								id="range-name"
								value={newRangeName}
								onChange={(e) => setNewRangeName(e.target.value)}
								placeholder="e.g., SalesData"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="range-ref">Refers to</Label>
							<Input
								id="range-ref"
								value={newRangeRef}
								onChange={(e) => setNewRangeRef(e.target.value)}
								placeholder="e.g., A1:B10"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowNamedRangeDialog(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleCreateNamedRange}>Create</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Note Dialog */}
			<Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Note</DialogTitle>
						<DialogDescription>
							Add a note to cell {selectedCell}.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="cell-note">Note</Label>
							<Input
								id="cell-note"
								value={cellNote}
								onChange={(e) => setCellNote(e.target.value)}
								placeholder="Enter your note here..."
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowNoteDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handleSaveNote}>Save Note</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Validation Dialog */}
			<Dialog
				open={showValidationDialog}
				onOpenChange={setShowValidationDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Data Validation</DialogTitle>
						<DialogDescription>
							Set validation rules for cell {selectedCell}.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="validation-type">Validation Type</Label>
							<Select
								value={validationType}
								onValueChange={(value) =>
									setValidationType(
										value as unknown as "number" | "text" | "list" | "date",
									)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="number">Number</SelectItem>
									<SelectItem value="text">Text</SelectItem>
									<SelectItem value="list">List</SelectItem>
									<SelectItem value="date">Date</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{validationType === "number" && (
							<>
								<div className="space-y-2">
									<Label htmlFor="validation-min">Minimum</Label>
									<Input
										id="validation-min"
										type="number"
										value={validationMin}
										onChange={(e) => setValidationMin(Number(e.target.value))}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="validation-max">Maximum</Label>
									<Input
										id="validation-max"
										type="number"
										value={validationMax}
										onChange={(e) => setValidationMax(Number(e.target.value))}
									/>
								</div>
							</>
						)}
						{validationType === "list" && (
							<div className="space-y-2">
								<Label htmlFor="validation-list">
									List Items (comma separated)
								</Label>
								<Input
									id="validation-list"
									value={validationList}
									onChange={(e) => setValidationList(e.target.value)}
									placeholder="Option1, Option2, Option3"
								/>
							</div>
						)}
						<div className="flex items-center space-x-2">
							<Switch
								id="validation-required"
								checked={validationRequired}
								onCheckedChange={setValidationRequired}
							/>
							<Label htmlFor="validation-required">Required</Label>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowValidationDialog(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSaveValidation}>Apply Validation</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Export Dialog */}
			<Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Export Spreadsheet</DialogTitle>
						<DialogDescription>
							Choose export format and options.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Format</Label>
							<Select
								defaultValue="excel"
								onValueChange={(value) => handleExport(value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select format" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="excel">Excel (.xlsx)</SelectItem>
									<SelectItem value="csv">CSV (.csv)</SelectItem>
									<SelectItem value="pdf">PDF (.pdf)</SelectItem>
									<SelectItem value="html">HTML (.html)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowExportDialog(false)}
						>
							Cancel
						</Button>
						<Button onClick={() => handleExport("excel")}>Export</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Import Dialog */}
			<Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Import File</DialogTitle>
						<DialogDescription>
							Upload an Excel file to import.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<input
							type="file"
							id="file-import"
							className="hidden"
							accept=".xlsx,.xls,.csv"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleImport(file);
							}}
						/>
						<Button
							variant="outline"
							className="w-full h-32 border-dashed"
							onClick={() => document.getElementById("file-import")?.click()}
						>
							<div className="flex flex-col items-center gap-2">
								<Upload className="h-8 w-8 text-muted-foreground" />
								<span>Click to upload or drag and drop</span>
								<span className="text-xs text-muted-foreground">
									XLSX, XLS, CSV (max 10MB)
								</span>
							</div>
						</Button>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowImportDialog(false)}
						>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Page Setup Dialog */}
			<Dialog open={showPageSetupDialog} onOpenChange={setShowPageSetupDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Page Setup</DialogTitle>
						<DialogDescription>
							Configure page layout and print settings.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Orientation</Label>
								<Select defaultValue="portrait">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="portrait">Portrait</SelectItem>
										<SelectItem value="landscape">Landscape</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Paper Size</Label>
								<Select defaultValue="a4">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="a4">A4</SelectItem>
										<SelectItem value="letter">Letter</SelectItem>
										<SelectItem value="legal">Legal</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Margins (inches)</Label>
							<div className="grid grid-cols-2 gap-4">
								<Input type="number" placeholder="Top" defaultValue="1" />
								<Input type="number" placeholder="Bottom" defaultValue="1" />
								<Input type="number" placeholder="Left" defaultValue="1" />
								<Input type="number" placeholder="Right" defaultValue="1" />
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowPageSetupDialog(false)}
						>
							Cancel
						</Button>
						<Button onClick={handlePageSetup}>Apply</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Print Dialog */}
			<Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Print</DialogTitle>
						<DialogDescription>Configure print settings.</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Print what</Label>
							<Select defaultValue="sheet">
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="sheet">Active Sheet</SelectItem>
									<SelectItem value="workbook">Entire Workbook</SelectItem>
									<SelectItem value="selection">Current Selection</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Copies</Label>
							<Input type="number" min="1" max="99" defaultValue="1" />
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowPrintDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handlePrint}>Print</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Clear Sheet Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Clear Sheet</DialogTitle>
						<DialogDescription>
							Are you sure you want to clear all data? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleClearAll}>
							Clear All
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Chart Dialog */}
			<Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Insert Chart</DialogTitle>
						<DialogDescription>
							Select a chart type and title for your data.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Chart Title</Label>
							<Input
								value={chartTitle}
								onChange={(e) => setChartTitle(e.target.value)}
								placeholder="Enter chart title..."
							/>
						</div>
						<div className="space-y-2">
							<Label>Data Range (e.g., A1:B10)</Label>
							<Input
								value={props.chartRange}
								onChange={(e) => props.setChartRange?.(e.target.value)}
								placeholder="Leave empty to use selection..."
							/>
						</div>
						<div className="space-y-2">
							<Label>Chart Type</Label>
							<Select
								value={chartType}
								onValueChange={(v) =>
									setChartType(v as unknown as "bar" | "line" | "pie")
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="bar">Bar Chart</SelectItem>
									<SelectItem value="line">Line Chart</SelectItem>
									<SelectItem value="pie">Pie Chart</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowChartDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handleInsertChart}>Insert Chart</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Icon Dialog */}
			<Dialog open={showIconDialog} onOpenChange={setShowIconDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Insert Icon</DialogTitle>
						<DialogDescription>
							Enter a Lucide icon name (e.g., Star, Heart, Activity) or pick
							from favorites.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Icon Name</Label>
							<Select value={iconName} onValueChange={setIconName}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Activity">Activity</SelectItem>
									<SelectItem value="Star">Star</SelectItem>
									<SelectItem value="Heart">Heart</SelectItem>
									<SelectItem value="Info">Info</SelectItem>
									<SelectItem value="Shield">Shield</SelectItem>
									<SelectItem value="Database">Database</SelectItem>
									<SelectItem value="Zap">Zap</SelectItem>
									<SelectItem value="Trophy">Trophy</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowIconDialog(false)}>
							Cancel
						</Button>
						<Button onClick={() => handleInsertIcon(iconName)}>
							Insert Icon
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Shortcuts Dialog */}
			<Dialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Keyboard className="h-5 w-5" />
							Available Shortcuts
						</DialogTitle>
						<DialogDescription>
							Master the spreadsheet with these keyboard shortcuts.
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-3 gap-6 py-4">
						<div className="space-y-4">
							<h4 className="font-semibold text-sm text-primary flex items-center gap-1">
								<AtSign className="h-3 w-3" /> General
							</h4>
							<div className="space-y-2">
								<div className="flex justify-between text-xs">
									<span>Undo / Redo</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+Z")} / Y
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Save / Print</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+S")} / P
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Find & Replace</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+F")}
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Help / Shortcuts</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+/")}
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Zoom In / Out</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl++")} / -
									</kbd>
								</div>
							</div>
						</div>
						<div className="space-y-4">
							<h4 className="font-semibold text-sm text-primary flex items-center gap-1">
								<Scissors className="h-3 w-3" /> Editing
							</h4>
							<div className="space-y-2">
								<div className="flex justify-between text-xs">
									<span>Copy / Cut / Paste</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+C")} / X / V
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Clear Cell</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">Del</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Bold / Italic</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+B")} / I
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Underline</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+U")}
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Insert Row/Col</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Alt+I")}
									</kbd>
								</div>
							</div>
						</div>
						<div className="space-y-4">
							<h4 className="font-semibold text-sm text-primary flex items-center gap-1">
								<Plus className="h-3 w-3" /> Navigation
							</h4>
							<div className="space-y-2">
								<div className="flex justify-between text-xs">
									<span>Next / Prev Cell</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										Tab / ⇧Tab
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Select All</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+A")}
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Start of Row</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">Home</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>End of Sheet</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+End")}
									</kbd>
								</div>
								<div className="flex justify-between text-xs">
									<span>Add Sheet</span>
									<kbd className="bg-muted px-1.5 rounded text-[10px]">
										{getShortcutText("Ctrl+⇧N")}
									</kbd>
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowShortcutsDialog(false)}>
							Got it
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* User Guide Dialog */}
			<Dialog open={showUserGuideDialog} onOpenChange={setShowUserGuideDialog}>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5 text-primary" />
							Art-Xcel User Guide
						</DialogTitle>
						<DialogDescription>
							Learn how to get the most out of your premium spreadsheet editor.
						</DialogDescription>
					</DialogHeader>

					<Tabs defaultValue="formulas" className="flex-1 overflow-hidden flex flex-col">
						<TabsList className="grid grid-cols-3 w-full">
							<TabsTrigger value="formulas" className="flex items-center gap-2">
								<FunctionSquare className="h-4 w-4" /> Formulas
							</TabsTrigger>
							<TabsTrigger value="data" className="flex items-center gap-2">
								<Database className="h-4 w-4" /> Data
							</TabsTrigger>
							<TabsTrigger value="visuals" className="flex items-center gap-2">
								<BarChart3 className="h-4 w-4" /> Visuals
							</TabsTrigger>
						</TabsList>

						<div className="flex-1 overflow-y-auto py-4 pr-2">
							<TabsContent value="formulas" className="space-y-4 mt-0">
								<div>
									<h4 className="font-semibold text-sm mb-2">Basic Arithmetic</h4>
									<p className="text-xs text-muted-foreground mb-2">
										Start with an equals sign <code className="bg-muted px-1 rounded">=</code> followed by your expression.
									</p>
									<ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
										<li><code className="bg-muted px-1 rounded">=A1 + B1</code> (Addition)</li>
										<li><code className="bg-muted px-1 rounded">=SUM(A1:A10)</code> (Range Sum)</li>
										<li><code className="bg-muted px-1 rounded">=AVERAGE(B1:B20)</code> (Average)</li>
									</ul>
								</div>
								<div>
									<h4 className="font-semibold text-sm mb-2">Advanced Functions</h4>
									<ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
										<li><code className="bg-muted px-1 rounded">=VLOOKUP(value, range, col, [match])</code> - Search in ranges</li>
										<li><code className="bg-muted px-1 rounded">=IF(condition, true, false)</code> - Logical operations</li>
										<li><code className="bg-muted px-1 rounded">=PMT(rate, nper, pv)</code> - Financial calculations</li>
									</ul>
								</div>
							</TabsContent>

							<TabsContent value="data" className="space-y-4 mt-0">
								<div>
									<h4 className="font-semibold text-sm mb-2">Data Operations</h4>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1">
											<p className="text-xs font-medium">Sorting</p>
											<p className="text-[11px] text-muted-foreground">Select a range and use Data {">"} Sort to organize your rows alphabetically or numerically.</p>
										</div>
										<div className="space-y-1">
											<p className="text-xs font-medium">Filtering</p>
											<p className="text-[11px] text-muted-foreground">Enable AutoFilter to quickly find specific values in large data sets.</p>
										</div>
									</div>
								</div>
								<div>
									<h4 className="font-semibold text-sm mb-2">Validation</h4>
									<p className="text-xs text-muted-foreground">Restrict cell input to specific types (numbers, dates, lists) via the Data Validation dialog.</p>
								</div>
							</TabsContent>

							<TabsContent value="visuals" className="space-y-4 mt-0">
								<div>
									<h4 className="font-semibold text-sm mb-2">Charts</h4>
									<p className="text-xs text-muted-foreground">Select data including headers and click Insert {">"} Chart. Supports Bar, Line, and Pie charts.</p>
								</div>
								<div>
									<h4 className="font-semibold text-sm mb-2">Graphics</h4>
									<p className="text-xs text-muted-foreground">Insert shapes, icons, and images to enhance your spreadsheet's visual appeal. All objects are draggable and resizable.</p>
								</div>
							</TabsContent>
						</div>
					</Tabs>

					<DialogFooter>
						<Button onClick={() => setShowUserGuideDialog(false)}>
							Close Guide
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Special Character Dialog */}
			<Dialog open={showSpecialCharDialog} onOpenChange={setShowSpecialCharDialog}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Special Characters</DialogTitle>
						<DialogDescription>
							Click a character to insert it into the selected cell.
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-10 gap-2 py-4">
						{specialChars.map((char) => (
							<Button
								key={char}
								variant="outline"
								className="h-8 w-8 p-0 text-lg"
								onClick={() => {
									handleInsertSpecialChar(char);
									setShowSpecialCharDialog(false);
								}}
							>
								{char}
							</Button>
						))}
					</div>
				</DialogContent>
			</Dialog>

			{/* Hyperlink Dialog */}
			<Dialog open={showHyperlinkDialog} onOpenChange={setShowHyperlinkDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Insert Hyperlink</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Text to display</Label>
							<Input
								placeholder="e.g. My Website"
								value={hyperlinkText}
								onChange={(e) => setHyperlinkText(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label>URL</Label>
							<Input
								placeholder="https://example.com"
								value={hyperlinkUrl}
								onChange={(e) => setHyperlinkUrl(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							onClick={() => {
								handleInsertHyperlink(hyperlinkUrl, hyperlinkText);
								setShowHyperlinkDialog(false);
								setHyperlinkUrl("");
								setHyperlinkText("");
							}}
						>
							Insert
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Comment Dialog */}
			<Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Insert Comment</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<Label>Comment</Label>
						<textarea
							className="w-full h-32 p-2 rounded-md border bg-background text-sm"
							placeholder="Write your comment here..."
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button
							onClick={() => {
								handleInsertComment(commentText);
								setShowCommentDialog(false);
								setCommentText("");
							}}
						>
							Post Comment
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* Conditional Formatting Dialog */}
			<Dialog open={showConditionalFormattingDialog} onOpenChange={setShowConditionalFormattingDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Conditional Formatting</DialogTitle>
						<DialogDescription>
							Apply formatting if cell content matches criteria.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Condition</Label>
							<Select value={cfType} onValueChange={setCfType}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="greaterThan">Is Greater Than</SelectItem>
									<SelectItem value="lessThan">Is Less Than</SelectItem>
									<SelectItem value="equalTo">Is Equal To</SelectItem>
									<SelectItem value="contains">Text Contains</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Value</Label>
							<Input 
								placeholder="Enter value" 
								value={cfValue}
								onChange={(e) => setCfValue(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label>Fill Color</Label>
							<div className="flex gap-2">
								<Input 
									type="color" 
									className="w-12 h-8 p-1" 
									value={cfColor}
									onChange={(e) => setCfColor(e.target.value)}
								/>
								<Input 
									value={cfColor}
									onChange={(e) => setCfColor(e.target.value)}
									placeholder="#RRGGBB"
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							onClick={() => {
								handleApplyConditionalFormatting({ type: cfType, value: cfValue, color: cfColor });
								setShowConditionalFormattingDialog(false);
							}}
						>
							Apply Rule
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* About Dialog */}
			<Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>About Art-Xcel</DialogTitle>
						<DialogDescription>
							Premium Spreadsheet Editor v1.0.0
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4 text-sm">
						<p>
							Art-Xcel is a state-of-the-art spreadsheet application built for
							modern teams. It combines the power of Excel with a sleek,
							intuitive interface.
						</p>
						<div className="flex flex-col gap-1 text-xs text-muted-foreground">
							<span>Built with Next.js, Tailwind CSS, and Framer Motion.</span>
							<span>© 2026 Art-Xcel Inc. All rights reserved.</span>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowAboutDialog?.(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
