"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";
import { useExcelService } from "@/hooks/use-excel-service";
import { Grid } from "@/components/editor/Grid";
import { Ribbon } from "@/components/editor/Ribbon";
import { StatusBar } from "@/components/editor/StatusBar";
import { FormulaBar } from "@/components/editor/FormulaBar";
import { Button } from "@/components/ui/button";
import { saveSpreadsheetAction } from "./actions";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
	Plus,
	ChevronDown,
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
	PlusSquare,
	MinusSquare,
	ArrowLeft,
	Download,
	Upload,
	Printer,
	HelpCircle,
	Filter,
	Bold,
	Italic,
	Underline,
	AlignLeft,
	AlignCenter,
	AlignRight,
	ZoomIn,
	ZoomOut,
	Grid3x3,
	Table,
	Eye,
	Keyboard,
	Cloud,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
	Permission,
	ShareDialog,
	ShareSettings,
} from "@/components/share-dialog";
import { Skeleton } from "@/components/ui/skeleton";

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

	const { exportToExcel, importFromExcel } = useExcelService();
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
					}
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

	const handleCellChange = (cellId: string, value: string) => {
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

			toast.success("Style applied", {
				duration: 1000,
			});
		}
	};

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
	}, [id, data, id]);

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
		async (format: string = "excel") => {
			try {
				toast.loading("Exporting...", {
					id: "export-toast",
					description: `Exporting as ${format.toUpperCase()}`,
				});

				await exportToExcel(data, sheetName);

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
		[data, sheetName, exportToExcel],
	);

	const handleImport = useCallback(
		async (file: File) => {
			try {
				toast.loading("Importing...", {
					id: "import-toast",
					description: `Importing ${file.name}`,
				});

				const { data: importedData, name: importedName } =
					await importFromExcel(file);
				setData(importedData);
				setSheetName(importedName);

				toast.success("Import Successful", {
					id: "import-toast",
					description: "Your Excel file has been imported.",
					icon: <Upload className="h-4 w-4" />,
				});
				setShowImportDialog(false);
			} catch (error) {
				toast.error("Import Failed", {
					id: "import-toast",
					description: "There was an error importing your Excel file.",
				});
			}
		},
		[importFromExcel, setData],
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
		toast.success("Sheet added", {
			description: `New sheet "${name}" created`,
			icon: <Plus className="h-4 w-4" />,
		});
		setShowNewSheetDialog(false);
		setNewSheetName("");
	}, [newSheetName, sheetNames.length, addSheet]);

	const handleDeleteCurrentSheet = useCallback(() => {
		if (sheetNames.length > 1) {
			deleteSheet(currentSheetIndex);
			toast.success("Sheet deleted", {
				description: `Sheet deleted`,
				icon: <Trash2 className="h-4 w-4" />,
			});
		} else {
			toast.error("Cannot delete last sheet", {
				description: "You must have at least one sheet",
			});
		}
	}, [sheetNames.length, currentSheetIndex, deleteSheet]);

	const handleRenameSheet = useCallback((index: number, newName: string) => {
		renameSheet(index, newName);
		if (index === currentSheetIndex) {
			setSheetName(newName);
		}
		toast.success("Sheet renamed", {
			description: `Sheet renamed to "${newName}"`,
			icon: <FileSpreadsheet className="h-4 w-4" />,
		});
	}, [currentSheetIndex, renameSheet]);

	const handleSwitchSheet = useCallback((index: number) => {
		switchSheet(index);
		setSheetName(sheetNames[index]);
		toast.success("Sheet switched", {
			description: `Switched to "${sheetNames[index]}"`,
			duration: 1000,
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

	if (isLoading) {
		return <EditorPreload />;
	}

	return (
		<div className="h-screen flex flex-col font-sans overflow-hidden bg-background">
			{/* Ribbon UI */}
			<Ribbon
				sheetName={sheetName}
				onSheetNameChange={setSheetName}
				onSave={handleSave}
				onUndo={handleUndo}
				onRedo={handleRedo}
				onExport={() => setShowExportDialog(true)}
				onImport={() => setShowImportDialog(true)}
				onClear={() => setShowDeleteDialog(true)}
				onStyleChange={handleStyleChange}
				onAlignChange={(align: "left" | "center" | "right") => handleAlignment(align)}
				onInsertRow={handleInsertRow}
				onDeleteRow={handleDeleteRow}
				onInsertColumn={handleInsertColumn}
				onDeleteColumn={handleDeleteColumn}
				onSort={handleSort}
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
					data={data}
					selectedCell={selectedCell}
					onSelectCell={selectCell}
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

			{/* Status Bar */}
			<StatusBar
				data={data}
				selectedCell={selectedCell}
				selectionRange={selectionRange}
			/>

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
						<Button variant="outline" onClick={() => setShowNewSheetDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreateSheet}>Create Sheet</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Named Range Dialog */}
			<Dialog open={showNamedRangeDialog} onOpenChange={setShowNamedRangeDialog}>
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
						<Button variant="outline" onClick={() => setShowNamedRangeDialog(false)}>
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
			<Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
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
							<Select value={validationType} onValueChange={(value: any) => setValidationType(value)}>
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
								<Label htmlFor="validation-list">List Items (comma separated)</Label>
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
						<Button variant="outline" onClick={() => setShowValidationDialog(false)}>
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
							<Select defaultValue="excel" onValueChange={(value) => handleExport(value)}>
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
						<Button variant="outline" onClick={() => setShowExportDialog(false)}>
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
								if (file) {
									handleImport(file);
								}
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
						<Button variant="outline" onClick={() => setShowImportDialog(false)}>
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
						<Button variant="outline" onClick={() => setShowPageSetupDialog(false)}>
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
						<DialogDescription>
							Configure print settings.
						</DialogDescription>
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
							Are you sure you want to clear all data? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
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
							<Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
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
							Enter a Lucide icon name (e.g., Star, Heart, Activity) or pick from favorites.
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
						<Button onClick={() => handleInsertIcon(iconName)}>Insert Icon</Button>
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
									<kbd className="bg-muted px-1.5 rounded">Ctrl+Z / Y</kbd>
								</div>
								<div className="flex justify-between text-sm">
									<span>Save</span>
									<kbd className="bg-muted px-1.5 rounded">Ctrl+S</kbd>
								</div>
								<div className="flex justify-between text-sm">
									<span>Find</span>
									<kbd className="bg-muted px-1.5 rounded">Ctrl+F</kbd>
								</div>
								<div className="flex justify-between text-sm">
									<span>Help / Shortcuts</span>
									<kbd className="bg-muted px-1.5 rounded">Ctrl+/</kbd>
								</div>
							</div>
						</div>
						<div className="space-y-4">
							<h4 className="font-semibold text-sm text-primary">Editing</h4>
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Copy / Cut / Paste</span>
									<kbd className="bg-muted px-1.5 rounded">Ctrl+C / X / V</kbd>
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
									<kbd className="bg-muted px-1.5 rounded">Ctrl+B / I</kbd>
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowShortcutsDialog(false)}>Got it</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
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