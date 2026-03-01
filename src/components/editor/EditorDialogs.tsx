"use client";

import React from "react";
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
import { Upload, Keyboard } from "lucide-react";

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
		handleInsertChart,
		showIconDialog,
		setShowIconDialog,
		iconName,
		setIconName,
		handleInsertIcon,
		showShortcutsDialog,
		setShowShortcutsDialog,
		isMac = false,
	} = props;

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
					<div className="grid grid-cols-2 gap-6 py-4">
						<div className="space-y-4">
							<h4 className="font-semibold text-sm text-primary">General</h4>
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Undo / Redo</span>
									<kbd className="bg-muted px-1.5 rounded">
										{getShortcutText("Ctrl+Z")} / Y
									</kbd>
								</div>
								<div className="flex justify-between text-sm">
									<span>Save</span>
									<kbd className="bg-muted px-1.5 rounded">
										{getShortcutText("Ctrl+S")}
									</kbd>
								</div>
								<div className="flex justify-between text-sm">
									<span>Find</span>
									<kbd className="bg-muted px-1.5 rounded">
										{getShortcutText("Ctrl+F")}
									</kbd>
								</div>
								<div className="flex justify-between text-sm">
									<span>Help / Shortcuts</span>
									<kbd className="bg-muted px-1.5 rounded">
										{getShortcutText("Ctrl+/")}
									</kbd>
								</div>
							</div>
						</div>
						<div className="space-y-4">
							<h4 className="font-semibold text-sm text-primary">Editing</h4>
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Copy / Cut / Paste</span>
									<kbd className="bg-muted px-1.5 rounded">
										{getShortcutText("Ctrl+C")} / X / V
									</kbd>
								</div>
								<div className="flex justify-between text-sm">
									<span>Clear Cell</span>
									<kbd className="bg-muted px-1.5 rounded">Delete</kbd>
								</div>
								<div className="flex justify-between text-sm">
									<span>Edit Cell</span>
									<kbd className="bg-muted px-1.5 rounded">Enter</kbd>
								</div>
								<div className="flex justify-between text-sm">
									<span>Bold / Italic</span>
									<kbd className="bg-muted px-1.5 rounded">
										{getShortcutText("Ctrl+B")} / I
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
		</>
	);
};
