"use client";

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";
import { useExcelService } from "@/hooks/use-excel-service";
import { Grid, GridHandle } from "@/components/editor/Grid";
import { ClassicToolbar } from "@/components/editor/ClassicToolbar";
import { StatusBar } from "@/components/editor/StatusBar";
import { FormulaBar } from "@/components/editor/FormulaBar";
import { EditorDialogs } from "@/components/editor/EditorDialogs";
import { SheetTabs } from "@/components/editor/SheetTabs";
import { FloatingQuickMenu } from "@/components/editor/FloatingQuickMenu";
import { saveSpreadsheetAction } from "./actions";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
	Plus,
	FileSpreadsheet,
	ShieldCheck,
	Columns,
	BarChart2,
	Image as ImageIcon,
	Save,
	Undo,
	Redo,
	Scissors,
	Copy,
	ClipboardPaste,
	Trash2,
	Search,
	BarChart,
	Download,
	Upload,
	Printer,
	Filter,
	Bold,
	AlignLeft,
	AlignCenter,
	AlignRight,
	ZoomIn,
	ZoomOut,
	Grid3x3,
	Table,
	Eye,
	Cloud,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Permission, ShareSettings } from "@/components/shared/share-dialog";

// Preload component for the editor
const EditorPreload = () => {
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
};

// Main Editor Component with Suspense
function EditorContent() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const {
		// Core data
		data,
		setData,
		selectedCell,
		selectionRange,
		sheetNames,
		currentSheetIndex,
		namedRanges,
		hiddenRows,

		// Cell operations
		updateCell,
		updateCells,
		updateCellStyle,
		getCellFormula,
		getCellValue,
		selectCell,
		selectRange,

		// Row/Column operations
		insertRow,
		deleteRow,
		insertColumn,
		deleteColumn,

		// Clipboard
		copyCells,
		cutCells,
		pasteCells,

		// Undo/Redo
		undo,
		redo,

		// Charts and Images
		charts,
		images,
		addChart,
		removeChart,
		updateChart,
		addImage,
		removeImage,
		updateImage,
		shapes,
		icons,
		addShape,
		removeShape,
		updateShape,
		addIcon,
		removeIcon,
		updateIcon,

		// Data operations
		sortRange,
		filterRange,
		findAndReplace,
		removeDuplicates,
		textToColumns,

		// Cell features
		addNote,
		addValidation,
		validateCell,

		// Named ranges
		createNamedRange,
		deleteNamedRange,

		// Sheet management
		addSheet,
		deleteSheet,
		renameSheet,
		switchSheet,

		// Utilities
		clearSheet,
		updateSheetName,
	} = useSpreadsheet();

	const { exportToFile, importFromFile } = useExcelService();
	const [sheetName, setSheetName] = useState("Untitled Spreadsheet");
	const [showFindDialog, setShowFindDialog] = useState(false);
	const [showPrintDialog, setShowPrintDialog] = useState(false);
	const [showPageSetupDialog, setShowPageSetupDialog] = useState(false);
	const [showExportDialog, setShowExportDialog] = useState(false);
	const [showImportDialog, setShowImportDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showNewSheetDialog, setShowNewSheetDialog] = useState(false);
	const [showNamedRangeDialog, setShowNamedRangeDialog] = useState(false);
	const [showValidationDialog, setShowValidationDialog] = useState(false);
	const [showNoteDialog, setShowNoteDialog] = useState(false);
	const [findText, setFindText] = useState("");
	const [replaceText, setReplaceText] = useState("");
	const [matchCase, setMatchCase] = useState(false);
	const [wholeCell, setWholeCell] = useState(false);
	const [zoom, setZoom] = useState(100);
	const [showGrid, setShowGrid] = useState(true);
	const [showHeaders, setShowHeaders] = useState(true);
	const [freezePanes, setFreezePanes] = useState(false);

	// Apply saved editor preferences from Settings (localStorage)
	useEffect(() => {
		try {
			const storedGrid = localStorage.getItem("excel-editor-showGrid");
			if (storedGrid !== null) setShowGrid(storedGrid === "true");
			const storedHeaders = localStorage.getItem("excel-editor-showHeaders");
			if (storedHeaders !== null) setShowHeaders(storedHeaders === "true");
			const storedZoom = localStorage.getItem("excel-editor-defaultZoom");
			if (storedZoom !== null) {
				const n = parseInt(storedZoom, 10);
				if (!isNaN(n) && n >= 50 && n <= 200) setZoom(n);
			}
		} catch {
			// ignore
		}
	}, []);
	const [newSheetName, setNewSheetName] = useState("");
	const [newRangeName, setNewRangeName] = useState("");
	const [newRangeRef, setNewRangeRef] = useState("");
	const [cellNote, setCellNote] = useState("");
	const [validationType, setValidationType] = useState<"number" | "text" | "list" | "date">("number");
	const [validationMin, setValidationMin] = useState<number>(0);
	const [validationMax, setValidationMax] = useState<number>(100);
	const [validationList, setValidationList] = useState<string>("");
	const [validationRequired, setValidationRequired] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Insertion states
	const [showChartDialog, setShowChartDialog] = useState(false);
	const [showImageDialog, setShowImageDialog] = useState(false);
	const [showShapeDialog, setShowShapeDialog] = useState(false);
	const [showIconDialog, setShowIconDialog] = useState(false);
	const [iconName, setIconName] = useState("Activity");
	const [shapeType, setShapeType] = useState<"rectangle" | "circle" | "line">("rectangle");
	const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
	const [chartTitle, setChartTitle] = useState("New Chart");
	const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

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
		const loadData = async () => {
			try {
				setIsLoading(true);
				// Simulate loading delay for better UX
				await new Promise(resolve => setTimeout(resolve, 500));

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

						// Show welcome toast when opening an existing spreadsheet
						toast.success(`Welcome back to "${currentSheet.name}"`, {
							description: "Your spreadsheet is ready for editing",
							icon: <FileSpreadsheet className="h-4 w-4" />,
							duration: 3000,
						});
					}
				} else {
					// Show welcome toast for new spreadsheet
					toast.success("Welcome to your new spreadsheet!", {
						description: "Start editing by clicking on any cell",
						icon: <Sparkles className="h-4 w-4" />,
						duration: 4000,
					});
				}
			} catch (e) {
				console.error(e);
				toast.error("Failed to load spreadsheet", {
					description: "There was an error loading your spreadsheet.",
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [id, setData]);

	// Auto-save
	useEffect(() => {
		if (isLoading) return;

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
							shareSettings,
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
	}, [data, id, sheetName, shareSettings, isLoading]);

	// Keyboard shortcuts with @tanstack/react-hotkeys
	useHotkey("Mod+S", (e: KeyboardEvent) => { e.preventDefault(); handleSave(); });
	useHotkey("Mod+Z", (e: KeyboardEvent) => { e.preventDefault(); handleUndo(); });
	useHotkey("Mod+Y", (e: KeyboardEvent) => { e.preventDefault(); handleRedo(); });
	useHotkey("Mod+Shift+Z", (e: KeyboardEvent) => { e.preventDefault(); handleRedo(); });
	useHotkey("Mod+B", (e: KeyboardEvent) => { e.preventDefault(); if (selectedCell) updateCellStyle(selectedCell, { bold: !data[selectedCell]?.style?.bold }); });
	useHotkey("Mod+I", (e: KeyboardEvent) => { e.preventDefault(); if (selectedCell) updateCellStyle(selectedCell, { italic: !data[selectedCell]?.style?.italic }); });
	useHotkey("Mod+U", (e: KeyboardEvent) => { e.preventDefault(); if (selectedCell) updateCellStyle(selectedCell, { underline: !data[selectedCell]?.style?.underline }); });
	useHotkey("Mod+C", (e: KeyboardEvent) => { e.preventDefault(); handleCopy(); });
	useHotkey("Mod+X", (e: KeyboardEvent) => { e.preventDefault(); handleCut(); });
	useHotkey("Mod+V", (e: KeyboardEvent) => { e.preventDefault(); handlePaste(); });
	useHotkey("Delete", (e: KeyboardEvent) => { e.preventDefault(); if (selectedCell) updateCell(selectedCell, ""); });
	useHotkey("Backspace", (e: KeyboardEvent) => { if (selectedCell) updateCell(selectedCell, ""); });

	const handleCellChange = useCallback((cellId: string, value: string) => {
		// Validate before update
		if (!validateCell(cellId, value)) {
			toast.error("Validation failed", {
				description: "The value does not meet validation criteria",
			});
			return;
		}

		updateCell(cellId, value);
		toast.success(`Cell ${cellId} updated`, {
			duration: 1000,
		});
	}, [validateCell, updateCell]);

	const handleFormulaBarChange = useCallback((value: string) => {
		if (selectedCell) {
			updateCell(selectedCell, value);
		}
	}, [selectedCell, updateCell]);

	const handleStyleChange = useCallback((style: any) => {
		if (selectedCell) {
			const currentStyle = data[selectedCell]?.style || {};
			const newStyle = { ...currentStyle, ...style };
			updateCellStyle(selectedCell, newStyle);

			toast.success("Style applied", {
				duration: 1000,
			});
		}
	}, [selectedCell, data, updateCellStyle]);

	const handleSave = useCallback(async () => {
		const result = await saveSpreadsheetAction(id as string, data);
		if (result.success) {
			toast.success("Saved to Cloud", {
				description: `Version updated at ${new Date(result.timestamp).toLocaleTimeString()}`,
				icon: <Cloud className="h-4 w-4" />,
			});
		} else {
			toast.error("Save failed", {
				description: "Could not synchronize with the server",
			});
		}
	}, [id, data]);

	const handleFormulaClick = useCallback((formula: string) => {
		if (selectedCell) {
			updateCell(selectedCell, `=${formula}( )`);
			toast.info(`Inserted ${formula}`, {
				description: `Formula template inserted for ${formula}`,
			});
		} else {
			toast.error("No cell selected", {
				description: "Please select a cell to insert a formula",
			});
		}
	}, [selectedCell, updateCell]);

	const handleUndo = useCallback(() => {
		undo();
		toast.info("Undo", {
			description: "Undo last action",
			icon: <Undo className="h-4 w-4" />,
		});
	}, [undo]);

	const handleRedo = useCallback(() => {
		redo();
		toast.info("Redo", {
			description: "Redo last action",
			icon: <Redo className="h-4 w-4" />,
		});
	}, [redo]);

	const handleSelectAll = useCallback(() => {
		selectRange("A1:Z100");
		toast.info("Select All", {
			description: "All cells selected",
			icon: <Grid3x3 className="h-4 w-4" />,
		});
	}, [selectRange]);

	const handleCut = useCallback(() => {
		if (selectedCell) {
			if (selectionRange) {
				cutCells(selectionRange);
				toast.info("Cut", {
					description: `${selectionRange.length} cells cut to clipboard`,
					icon: <Scissors className="h-4 w-4" />,
				});
			} else {
				cutCells([selectedCell]);
				toast.info("Cut", {
					description: `Cell ${selectedCell} cut to clipboard`,
					icon: <Scissors className="h-4 w-4" />,
				});
			}
		} else {
			toast.error("No cell selected", {
				description: "Please select a cell to cut",
			});
		}
	}, [selectedCell, selectionRange, cutCells]);

	const handleCopy = useCallback(() => {
		if (selectedCell) {
			if (selectionRange) {
				copyCells(selectionRange);
				toast.info("Copy", {
					description: `${selectionRange.length} cells copied to clipboard`,
					icon: <Copy className="h-4 w-4" />,
				});
			} else {
				copyCells([selectedCell]);
				toast.info("Copy", {
					description: `Cell ${selectedCell} copied to clipboard`,
					icon: <Copy className="h-4 w-4" />,
				});
			}
		} else {
			toast.error("No cell selected", {
				description: "Please select a cell to copy",
			});
		}
	}, [selectedCell, selectionRange, copyCells]);

	const handlePaste = useCallback(() => {
		if (selectedCell) {
			pasteCells(selectedCell);
			toast.info("Paste", {
				description: "Pasted from clipboard",
				icon: <ClipboardPaste className="h-4 w-4" />,
			});
		} else {
			toast.error("No cell selected", {
				description: "Please select a cell to paste to",
			});
		}
	}, [selectedCell, pasteCells]);

	const handleDelete = useCallback(() => {
		if (selectedCell) {
			if (selectionRange && selectionRange.length > 1) {
				const updates: Record<string, string> = {};
				selectionRange.forEach(cell => {
					updates[cell] = "";
				});
				updateCells(updates);
				toast.success("Deleted", {
					description: `${selectionRange.length} cells cleared`,
					icon: <Trash2 className="h-4 w-4" />,
				});
			} else {
				updateCell(selectedCell, "");
				toast.success("Deleted", {
					description: `Cell ${selectedCell} cleared`,
					icon: <Trash2 className="h-4 w-4" />,
				});
			}
		} else {
			setShowDeleteDialog(true);
		}
	}, [selectedCell, selectionRange, updateCell, updateCells]);

	const handleClearAll = useCallback(() => {
		clearSheet();
		setShowDeleteDialog(false);
		toast.success("Sheet cleared", {
			description: "All data has been removed",
			icon: <Trash2 className="h-4 w-4" />,
		});
	}, [clearSheet]);

	const handleFind = useCallback(() => {
		if (!findText) {
			toast.error("Please enter text to find");
			return;
		}

		findAndReplace(findText, replaceText, { matchCase, wholeCell });
		toast.success("Find and Replace", {
			description: `Replaced "${findText}" with "${replaceText}"`,
			icon: <Search className="h-4 w-4" />,
		});
		setShowFindDialog(false);
	}, [findText, replaceText, matchCase, wholeCell, findAndReplace]);

	const handleReplace = useCallback(() => {
		if (!findText) {
			toast.error("Please enter text to find");
			return;
		}

		findAndReplace(findText, replaceText, { matchCase, wholeCell });
		toast.success("Replace", {
			description: `Replaced "${findText}" with "${replaceText}"`,
			icon: <Search className="h-4 w-4" />,
		});
		setShowFindDialog(false);
	}, [findText, replaceText, matchCase, wholeCell, findAndReplace]);

	const handleExport = useCallback(
		async (format: string = "xlsx") => {
			try {
				toast.loading("Exporting...", {
					id: "export-toast",
					description: `Exporting as ${format.toUpperCase()}`,
				});

				await exportToFile(data, sheetName, format as "xlsx" | "ods");

				toast.success("Export Successful", {
					id: "export-toast",
					description: `Your spreadsheet has been exported as ${format.toUpperCase()}.`,
					icon: <Download className="h-4 w-4" />,
				});
				setShowExportDialog(false);
			} catch (error) {
				toast.error("Export Failed", {
					id: "export-toast",
					description: "There was an error exporting your spreadsheet.",
				});
			}
		},
		[data, sheetName, exportToFile],
	);

	const handleExportFormat = useCallback(
		async (format: "xlsx" | "ods") => {
			await handleExport(format);
		},
		[handleExport],
	);

	const handleImport = useCallback(
		async (file: File) => {
			try {
				toast.loading("Importing...", {
					id: "import-toast",
					description: `Importing ${file.name}`,
				});

				const { data: importedData, name: importedName } =
					await importFromFile(file);
				setData(importedData);
				setSheetName(importedName);

				toast.success("Import Successful", {
					id: "import-toast",
					description: "Your file has been imported.",
					icon: <Upload className="h-4 w-4" />,
				});
				setShowImportDialog(false);
			} catch (error) {
				toast.error("Import Failed", {
					id: "import-toast",
					description: "There was an error importing your file.",
				});
			}
		},
		[importFromFile, setData],
	);

	const handlePrint = useCallback(() => {
		toast.loading("Preparing document...", {
			id: "print-toast",
			description: "Preparing document for printing...",
		});

		setTimeout(() => {
			toast.success("Ready to print", {
				id: "print-toast",
				description: "Document is ready for printing",
				icon: <Printer className="h-4 w-4" />,
			});
		}, 1500);

		setShowPrintDialog(false);
	}, []);

	const handlePageSetup = useCallback(() => {
		toast.success("Page setup saved", {
			description: "Your page settings have been applied",
			icon: <Grid3x3 className="h-4 w-4" />,
		});
		setShowPageSetupDialog(false);
	}, []);

	const handleInsertRow = useCallback(() => {
		if (selectedCell) {
			const row = parseInt(selectedCell.match(/\d+/)?.[0] || "1");
			insertRow(row);
			toast.success("Insert Row", {
				description: `New row inserted at position ${row}`,
				icon: <Table className="h-4 w-4" />,
			});
		} else {
			insertRow(1);
			toast.success("Insert Row", {
				description: "New row inserted at position 1",
				icon: <Table className="h-4 w-4" />,
			});
		}
	}, [selectedCell, insertRow]);

	const handleDeleteRow = useCallback(() => {
		if (selectedCell) {
			const row = parseInt(selectedCell.match(/\d+/)?.[0] || "1");
			deleteRow(row);
			toast.success("Delete Row", {
				description: `Row ${row} deleted`,
				icon: <Trash2 className="h-4 w-4" />,
			});
		}
	}, [selectedCell, deleteRow]);

	const handleInsertColumn = useCallback(() => {
		if (selectedCell) {
			const col = selectedCell.match(/[A-Z]+/)?.[0] || "A";
			const colNum = col.charCodeAt(0) - 65;
			insertColumn(colNum);
			toast.success("Insert Column", {
				description: `New column inserted at position ${col}`,
				icon: <Table className="h-4 w-4" />,
			});
		} else {
			insertColumn(0);
			toast.success("Insert Column", {
				description: "New column inserted at position A",
				icon: <Table className="h-4 w-4" />,
			});
		}
	}, [selectedCell, insertColumn]);

	const handleDeleteColumn = useCallback(() => {
		if (selectedCell) {
			const col = selectedCell.match(/[A-Z]+/)?.[0] || "A";
			const colNum = col.charCodeAt(0) - 65;
			deleteColumn(colNum);
			toast.success("Delete Column", {
				description: `Column ${col} deleted`,
				icon: <Trash2 className="h-4 w-4" />,
			});
		}
	}, [selectedCell, deleteColumn]);


	const handleFormatCells = useCallback(() => {
		toast.success("Format Cells", {
			description: "Format cells dialog opened",
			icon: <Bold className="h-4 w-4" />,
		});
	}, []);

	const handleConditionalFormatting = useCallback(() => {
		toast.success("Conditional Formatting", {
			description: "Conditional formatting rules editor opened",
			icon: <Eye className="h-4 w-4" />,
		});
	}, []);

	const handleNumberFormat = useCallback((format: string) => {
		if (selectedCell) {
			updateCellStyle(selectedCell, { numberFormat: format as any });
			toast.success("Number Format", {
				description: `Applied ${format} format to cell ${selectedCell}`,
				icon: <Table className="h-4 w-4" />,
			});
		} else {
			toast.error("No cell selected", {
				description: "Please select a cell to apply number format",
			});
		}
	}, [selectedCell, updateCellStyle]);

	const handleAlignment = useCallback((align: string) => {
		if (selectedCell) {
			// Map alignment to style
			let alignValue: "left" | "center" | "right" | undefined;

			if (align === "Left") alignValue = "left";
			else if (align === "Center") alignValue = "center";
			else if (align === "Right") alignValue = "right";

			if (alignValue) {
				updateCellStyle(selectedCell, { align: alignValue });
			}

			toast.success("Alignment", {
				description: `Applied ${align} alignment to cell ${selectedCell}`,
				icon: align === "Left" ? <AlignLeft className="h-4 w-4" /> :
					align === "Center" ? <AlignCenter className="h-4 w-4" /> :
						<AlignRight className="h-4 w-4" />,
			});
		} else {
			toast.error("No cell selected", {
				description: "Please select a cell to apply alignment",
			});
		}
	}, [selectedCell, updateCellStyle]);

	const handleSort = useCallback(() => {
		if (selectionRange && selectionRange.length > 0) {
			const range = selectionRange[0] + ":" + selectionRange[selectionRange.length - 1];
			sortRange(range, 0, true);
			toast.success("Sort", {
				description: "Range sorted",
				icon: <Search className="h-4 w-4" />,
			});
		} else {
			toast.error("No range selected", {
				description: "Please select a range to sort",
			});
		}
	}, [selectionRange, sortRange]);

	const handleFilter = useCallback(() => {
		if (selectionRange && selectionRange.length > 0) {
			const range = selectionRange[0] + ":" + selectionRange[selectionRange.length - 1];
			filterRange(range, 0, (val) => val !== "");
			toast.success("Filter", {
				description: "Filter applied (hiding empty cells)",
				icon: <Filter className="h-4 w-4" />,
			});
		} else {
			toast.error("No range selected", {
				description: "Please select a range to filter",
			});
		}
	}, [selectionRange, filterRange]);

	const handleGroup = useCallback(() => {
		toast.success("Group", {
			description: "Group dialog opened",
			icon: <Table className="h-4 w-4" />,
		});
	}, []);

	const handleRemoveDuplicates = useCallback(() => {
		if (selectionRange && selectionRange.length > 0) {
			const range = selectionRange[0] + ":" + selectionRange[selectionRange.length - 1];
			removeDuplicates(range, 0);
			toast.success("Remove Duplicates", {
				description: "Duplicates removed from selected range",
				icon: <ShieldCheck className="h-4 w-4" />,
			});
		} else {
			toast.error("No range selected", {
				description: "Please select a range to remove duplicates",
			});
		}
	}, [selectionRange, removeDuplicates]);

	const handleTextToColumns = useCallback(() => {
		if (selectionRange && selectionRange.length > 0) {
			const range = selectionRange[0] + ":" + selectionRange[selectionRange.length - 1];
			textToColumns(range, ",");
			toast.success("Text to Columns", {
				description: "Text split by comma",
				icon: <Columns className="h-4 w-4" />,
			});
		} else {
			toast.error("No range selected");
		}
	}, [selectionRange, textToColumns]);

	const handleInsertChart = useCallback(() => {
		if (selectionRange && selectionRange.length > 0) {
			const range = selectionRange[0] + ":" + selectionRange[selectionRange.length - 1];
			addChart({
				type: chartType,
				range,
				title: chartTitle,
				position: { x: 100, y: 100 },
				size: { width: 400, height: 300 },
			});
			setShowChartDialog(false);
			toast.success("Chart Inserted", {
				description: "Your chart has been added to the sheet",
				icon: <BarChart2 className="h-4 w-4" />,
			});
		} else {
			toast.error("No range selected", {
				description: "Please select data for the chart",
			});
		}
	}, [selectionRange, chartType, chartTitle, addChart]);

	const handleInsertImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				addImage({
					src: event.target?.result as string,
					position: { x: 150, y: 150 },
					size: { width: 300, height: 200 },
				});
				toast.success("Image Inserted", {
					icon: <ImageIcon className="h-4 w-4" />,
				});
			};
			reader.readAsDataURL(file);
		}
	}, [addImage]);

	const handleInsertShape = useCallback((type: "rectangle" | "circle" | "line") => {
		addShape({
			type,
			position: { x: 200, y: 200 },
			size: { width: 150, height: 100 },
			style: {
				fill: "rgba(59, 130, 246, 0.5)",
				stroke: "#2563eb",
				strokeWidth: 2,
			}
		});
		toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} Inserted`);
	}, [addShape]);

	const handleInsertIcon = useCallback((name: string) => {
		addIcon({
			iconName: name,
			position: { x: 250, y: 250 },
			size: 48,
			color: "#3b82f6",
		});
		setShowIconDialog(false);
		toast.success("Icon Inserted");
	}, [addIcon]);

	const handleDataValidation = useCallback(() => {
		if (selectedCell) {
			setShowValidationDialog(true);
		} else {
			toast.error("No cell selected", {
				description: "Please select a cell to add validation",
			});
		}
	}, [selectedCell]);

	const handleAddNote = useCallback(() => {
		if (selectedCell) {
			const existingNote = data[selectedCell]?.note || "";
			setCellNote(existingNote);
			setShowNoteDialog(true);
		} else {
			toast.error("No cell selected", {
				description: "Please select a cell to add a note",
			});
		}
	}, [selectedCell, data]);

	const handleSaveNote = useCallback(() => {
		if (selectedCell) {
			addNote(selectedCell, cellNote);
			toast.success("Note added", {
				description: `Note added to cell ${selectedCell}`,
				icon: <FileSpreadsheet className="h-4 w-4" />,
			});
			setShowNoteDialog(false);
		}
	}, [selectedCell, cellNote, addNote]);

	const handleWhatIfAnalysis = useCallback(() => {
		toast.success("What-If Analysis", {
			description: "What-If analysis tools opened",
			icon: <BarChart className="h-4 w-4" />,
		});
	}, []);

	const handleZoomIn = useCallback(() => {
		setZoom((prev: number) => Math.min(prev + 10, 200));
		toast.success(`Zoom: ${Math.min(zoom + 10, 200)}%`, {
			icon: <ZoomIn className="h-4 w-4" />,
			duration: 1000,
		});
	}, [zoom]);

	const handleZoomOut = useCallback(() => {
		setZoom((prev: number) => Math.max(prev - 10, 50));
		toast.success(`Zoom: ${Math.max(zoom - 10, 50)}%`, {
			icon: <ZoomOut className="h-4 w-4" />,
			duration: 1000,
		});
	}, [zoom]);

	const handleZoomToSelection = useCallback(() => {
		if (selectedCell) {
			toast.success("Zoom to Selection", {
				description: `Zoomed to cell ${selectedCell}`,
				icon: <Search className="h-4 w-4" />,
			});
		} else {
			toast.error("No cell selected", {
				description: "Please select a cell to zoom to",
			});
		}
	}, [selectedCell]);

	// Sheet management
	const handleAddSheet = useCallback(() => {
		setShowNewSheetDialog(true);
	}, []);

	const handleCreateSheet = useCallback(() => {
		const name = newSheetName || `Sheet${sheetNames.length + 1}`;
		addSheet(name);

		// Show success toast for new sheet creation
		toast.success("New sheet created", {
			description: `Sheet "${name}" has been added`,
			icon: <Plus className="h-4 w-4" />,
			duration: 3000,
		});

		setShowNewSheetDialog(false);
		setNewSheetName("");
	}, [newSheetName, sheetNames.length, addSheet]);

	const handleDeleteCurrentSheet = useCallback(() => {
		if (sheetNames.length > 1) {
			const deletedSheetName = sheetNames[currentSheetIndex];
			deleteSheet(currentSheetIndex);
			toast.success("Sheet deleted", {
				description: `"${deletedSheetName}" has been deleted`,
				icon: <Trash2 className="h-4 w-4" />,
			});
		} else {
			toast.error("Cannot delete last sheet", {
				description: "You must have at least one sheet",
			});
		}
	}, [sheetNames, currentSheetIndex, deleteSheet]);

	const handleRenameSheet = useCallback((index: number, newName: string) => {
		const oldName = sheetNames[index];
		renameSheet(index, newName);
		if (index === currentSheetIndex) {
			setSheetName(newName);
		}
		toast.success("Sheet renamed", {
			description: `"${oldName}" renamed to "${newName}"`,
			icon: <FileSpreadsheet className="h-4 w-4" />,
		});
	}, [currentSheetIndex, renameSheet, sheetNames]);

	const handleSwitchSheet = useCallback((index: number) => {
		switchSheet(index);
		setSheetName(sheetNames[index]);
		toast.success(`Switched to "${sheetNames[index]}"`, {
			duration: 1500,
			icon: <FileSpreadsheet className="h-4 w-4" />,
		});
	}, [sheetNames, switchSheet]);

	// Named ranges
	const handleAddNamedRange = useCallback(() => {
		if (selectionRange && selectionRange.length > 0) {
			setShowNamedRangeDialog(true);
			setNewRangeRef(selectionRange[0] + ":" + selectionRange[selectionRange.length - 1]);
		} else if (selectedCell) {
			setShowNamedRangeDialog(true);
			setNewRangeRef(selectedCell);
		} else {
			toast.error("No selection", {
				description: "Please select a cell or range to name",
			});
		}
	}, [selectedCell, selectionRange]);

	const handleCreateNamedRange = useCallback(() => {
		if (newRangeName && newRangeRef) {
			createNamedRange(newRangeName, newRangeRef);
			toast.success("Named range created", {
				description: `Range "${newRangeName}" created`,
				icon: <FileSpreadsheet className="h-4 w-4" />,
			});
			setShowNamedRangeDialog(false);
			setNewRangeName("");
			setNewRangeRef("");
		}
	}, [newRangeName, newRangeRef, createNamedRange]);

	// Validation
	const handleSaveValidation = useCallback(() => {
		if (selectedCell) {
			const validation = {
				type: validationType,
				min: validationType === "number" ? validationMin : undefined,
				max: validationType === "number" ? validationMax : undefined,
				list: validationType === "list" ? validationList.split(",").map(s => s.trim()) : undefined,
				required: validationRequired,
			};
			addValidation(selectedCell, validation);
			toast.success("Validation added", {
				description: `Validation added to cell ${selectedCell}`,
				icon: <Grid3x3 className="h-4 w-4" />,
			});
			setShowValidationDialog(false);
		}
	}, [selectedCell, validationType, validationMin, validationMax, validationList, validationRequired, addValidation]);

	// Share handlers
	const handleShareSave = async (settings: ShareSettings) => {
		setShareSettings(settings);

		toast.loading("Updating share settings...", {
			id: "share-toast",
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		toast.success("Share settings updated", {
			id: "share-toast",
			description: "Your sharing preferences have been saved",
			icon: <Copy className="h-4 w-4" />,
		});

		return Promise.resolve();
	};

	const handleInvite = async (emails: string[], permission: Permission) => {
		toast.loading("Sending invitations...", {
			id: "invite-toast",
			description: `Inviting ${emails.length} collaborator(s)`,
		});

		await new Promise((resolve) => setTimeout(resolve, 1500));

		toast.success("Invitations sent", {
			id: "invite-toast",
			description: `Invited ${emails.length} collaborator(s) with ${permission} permission`,
			icon: <Copy className="h-4 w-4" />,
		});
	};

	const handleRemoveCollaborator = async (collaboratorId: string) => {
		toast.loading("Removing collaborator...", {
			id: "remove-toast",
		});

		await new Promise((resolve) => setTimeout(resolve, 500));

		toast.success("Collaborator removed", {
			id: "remove-toast",
			icon: <Trash2 className="h-4 w-4" />,
		});
	};

	const handleCopyLink = () => {
		const shareUrl = `${window.location.origin}/share/${id}`;
		navigator.clipboard.writeText(shareUrl);
		toast.success("Link copied to clipboard", {
			icon: <Copy className="h-4 w-4" />,
		});
	};

	// Refs
	const gridRef = useRef<GridHandle>(null);

	const handleScrollToTop = useCallback(() => {
		gridRef.current?.scrollToTop();
	}, []);

	if (isLoading) {
		return <EditorPreload />;
	}

	return (
		<div className="h-screen flex flex-col font-sans overflow-hidden bg-background">
			{/* Ribbon UI */}
			<ClassicToolbar
				onSave={handleSave}
				onUndo={handleUndo}
				onRedo={handleRedo}
				onExport={() => handleExport("xlsx")}
				onExportFormat={handleExportFormat}
				onImport={handleImport}
				onClear={() => setShowDeleteDialog(true)}
				onStyleChange={handleStyleChange}
				onInsertRow={handleInsertRow}
				onDeleteRow={handleDeleteRow}
				onInsertColumn={handleInsertColumn}
				onDeleteColumn={handleDeleteColumn}
				onSort={(dir) => {
					// Handle sort direction if needed
					handleSort();
				}}
				onFilter={handleFilter}
				onFind={() => setShowFindDialog(true)}
				onDataValidation={handleDataValidation}
				onRemoveDuplicates={handleRemoveDuplicates}
				onTextToColumns={handleTextToColumns}
				onInsertChart={() => setShowChartDialog(true)}
				onInsertImage={handleInsertImage}
				onInsertShape={handleInsertShape}
				onInsertIcon={() => setShowIconDialog(true)}
				onInsertFunction={handleFormulaClick}
				onScrollToTop={handleScrollToTop}
				onNew={() => {
					toast.info("Creating new spreadsheet...", {
						description: "Your current work is auto-saved.",
					});
					setTimeout(() => window.location.reload(), 1000);
				}}
				onOpen={() => {
					const input = document.createElement('input');
					input.type = 'file';
					input.accept = '.xlsx,.xls,.csv,.ods';
					input.onchange = (e) => {
						const file = (e.target as HTMLInputElement).files?.[0];
						if (file) handleImport(file);
					};
					input.click();
				}}
				onPrint={handlePrint}
				onCut={handleCut}
				onCopy={handleCopy}
				onPaste={handlePaste}
				onSelectAll={handleSelectAll}
				onToggleToolbars={() => toast.info("Toggle Toolbars", { description: "Toolbar visibility settings coming soon" })}
				onToggleFormulaBar={() => toast.info("Toggle Formula Bar", { description: "Formula bar visibility toggle coming soon" })}
				onToggleStatusBar={() => toast.info("Toggle Status Bar", { description: "Status bar visibility toggle coming soon" })}
				onToggleFreezePanes={() => toast.info("Freeze Panes", { description: "Freeze panes functionality coming soon" })}
				onToggleFullScreen={() => {
					if (!document.fullscreenElement) {
						document.documentElement.requestFullscreen();
						toast.success("Entered Full Screen");
					} else {
						document.exitFullscreen();
						toast.success("Exited Full Screen");
					}
				}}
				onFormatSpacing={() => toast.info("Spacing", { description: "Cell spacing and padding coming soon" })}
				onFormatAlignment={() => toast.info("Alignment", { description: "Use the alignment icons in the toolbar for quick access" })}
				onConditionalFormatting={handleConditionalFormatting}
				onUserGuides={() => toast.info("User Guides", { description: "Documentation and user guides are under development" })}
				onShortcuts={() => setShowShortcutsDialog(true)}
				onAbout={() => toast.info("About Art-Xcel", { description: "Art-Xcel Spreadsheet v0.1.0 - Premium Edition" })}
				onToggleGrid={() => setShowGrid(!showGrid)}
			/>

			{/* Formula Bar */}
			<FormulaBar
				selectedCell={selectedCell}
				value={selectedCell ? getCellFormula(selectedCell) : ""}
				onChange={handleFormulaBarChange}
			/>

			{/* Main Grid Area */}
			<div className="flex-1 overflow-hidden relative" style={{ zoom: `${zoom}%` }}>
				<Grid
					ref={gridRef}
					data={data}
					selectedCell={selectedCell}
					selectionRange={selectionRange}
					onSelectCell={selectCell}
					onSelectRange={selectRange}
					onCellChange={handleCellChange}
					showGrid={showGrid}
					showHeaders={showHeaders}
					freezePanes={freezePanes}
					// Context Menu Actions
					onCopy={handleCopy}
					onCut={handleCut}
					onPaste={handlePaste}
					onInsertRow={insertRow}
					onDeleteRow={deleteRow}
					onInsertColumn={insertColumn}
					onDeleteColumn={deleteColumn}
					onClearCell={(id) => updateCell(id, "")}
					hiddenRows={hiddenRows}
					charts={charts}
					images={images}
					onRemoveChart={removeChart}
					onRemoveImage={removeImage}
					onUpdateChart={updateChart}
					onUpdateImage={updateImage}
					shapes={shapes}
					icons={icons}
					onRemoveShape={removeShape}
					onRemoveIcon={removeIcon}
					onUpdateShape={updateShape}
					onUpdateIcon={updateIcon}
					onShowShortcuts={() => setShowShortcutsDialog(true)}
				/>
			</div>

			{/* Sheet Tabs */}
			<SheetTabs
				sheetNames={sheetNames}
				currentSheetIndex={currentSheetIndex}
				onSwitchSheet={handleSwitchSheet}
				onAddSheet={handleAddSheet}
				onRenameSheet={handleRenameSheet}
				onDeleteSheet={(index) => {
					// Switch before delete if necessary
					if (index === currentSheetIndex) {
						if (index > 0) handleSwitchSheet(index - 1);
						else if (sheetNames.length > 1) handleSwitchSheet(1);
					}
					deleteSheet(index);
					toast.success("Sheet deleted");
				}}
			/>

			{/* Status Bar */}
			<StatusBar
				data={data}
				selectedCell={selectedCell}
				selectionRange={selectionRange}
			/>

			<FloatingQuickMenu
				onSave={handleSave}
				onUndo={handleUndo}
				onRedo={handleRedo}
				onHelp={() => setShowShortcutsDialog(true)}
				onSettings={() => toast.info("Settings", { description: "Editor settings coming soon" })}
			/>

			<EditorDialogs
				showFindDialog={showFindDialog}
				setShowFindDialog={setShowFindDialog}
				findText={findText}
				setFindText={setFindText}
				replaceText={replaceText}
				setReplaceText={setReplaceText}
				matchCase={matchCase}
				setMatchCase={setMatchCase}
				wholeCell={wholeCell}
				setWholeCell={setWholeCell}
				handleFind={handleFind}
				handleReplace={handleReplace}
				showNewSheetDialog={showNewSheetDialog}
				setShowNewSheetDialog={setShowNewSheetDialog}
				newSheetName={newSheetName}
				setNewSheetName={setNewSheetName}
				sheetNames={sheetNames}
				handleCreateSheet={handleCreateSheet}
				showNamedRangeDialog={showNamedRangeDialog}
				setShowNamedRangeDialog={setShowNamedRangeDialog}
				newRangeName={newRangeName}
				setNewRangeName={setNewRangeName}
				newRangeRef={newRangeRef}
				setNewRangeRef={setNewRangeRef}
				handleCreateNamedRange={handleCreateNamedRange}
				showNoteDialog={showNoteDialog}
				setShowNoteDialog={setShowNoteDialog}
				cellNote={cellNote}
				setCellNote={setCellNote}
				selectedCell={selectedCell}
				handleSaveNote={handleSaveNote}
				showValidationDialog={showValidationDialog}
				setShowValidationDialog={setShowValidationDialog}
				validationType={validationType}
				setValidationType={setValidationType}
				validationMin={validationMin}
				setValidationMin={setValidationMin}
				validationMax={validationMax}
				setValidationMax={setValidationMax}
				validationList={validationList}
				setValidationList={setValidationList}
				validationRequired={validationRequired}
				setValidationRequired={setValidationRequired}
				handleSaveValidation={handleSaveValidation}
				showExportDialog={showExportDialog}
				setShowExportDialog={setShowExportDialog}
				handleExport={handleExport}
				showImportDialog={showImportDialog}
				setShowImportDialog={setShowImportDialog}
				handleImport={handleImport}
				showPageSetupDialog={showPageSetupDialog}
				setShowPageSetupDialog={setShowPageSetupDialog}
				handlePageSetup={handlePageSetup}
				showPrintDialog={showPrintDialog}
				setShowPrintDialog={setShowPrintDialog}
				handlePrint={handlePrint}
				showDeleteDialog={showDeleteDialog}
				setShowDeleteDialog={setShowDeleteDialog}
				handleClearAll={handleClearAll}
				showChartDialog={showChartDialog}
				setShowChartDialog={setShowChartDialog}
				chartTitle={chartTitle}
				setChartTitle={setChartTitle}
				chartType={chartType}
				setChartType={setChartType}
				handleInsertChart={handleInsertChart}
				showIconDialog={showIconDialog}
				setShowIconDialog={setShowIconDialog}
				iconName={iconName}
				setIconName={setIconName}
				handleInsertIcon={handleInsertIcon}
				showShortcutsDialog={showShortcutsDialog}
				setShowShortcutsDialog={setShowShortcutsDialog}
			/>
		</div>
	);
}

// Main export with Suspense
export default function EditorPage() {
	return (
		<Suspense fallback={<EditorPreload />}>
			<EditorContent />
		</Suspense>
	);
}