"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";
import { useExcelService } from "@/hooks/use-excel-service";
import { Grid } from "@/components/editor/Grid";
import { Toolbar } from "@/components/editor/Toolbar";
import { FormulaBar } from "@/components/editor/FormulaBar";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Save,
	Download,
	Upload,
	Printer,
	HelpCircle,
	Filter,
	Undo,
	Redo,
	Scissors,
	Copy,
	ClipboardPaste,
	Trash2,
	Search,
	ZoomIn,
	ZoomOut,
	Grid3x3,
	Table,
	BarChart,
	Bold,
	Eye,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Underline,
	Italic,
	Plus,
	ChevronDown,
	FileSpreadsheet,
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

export default function EditorPage() {
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
		
		// Data operations
		sortRange,
		filterRange,
		findAndReplace,
		
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
			try {
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
			} catch (e) {
				console.error(e);
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
	}, [data, id, sheetName, shareSettings]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
				switch (e.key.toLowerCase()) {
					case "s":
						e.preventDefault();
						handleSave();
						break;
					case "o":
						e.preventDefault();
						setShowImportDialog(true);
						break;
					case "p":
						e.preventDefault();
						setShowPrintDialog(true);
						break;
					case "f":
						e.preventDefault();
						setShowFindDialog(true);
						break;
					case "z":
						e.preventDefault();
						handleUndo();
						break;
					case "y":
						e.preventDefault();
						handleRedo();
						break;
					case "a":
						e.preventDefault();
						handleSelectAll();
						break;
					case "c":
						if (!e.shiftKey) {
							e.preventDefault();
							handleCopy();
						}
						break;
					case "x":
						e.preventDefault();
						handleCut();
						break;
					case "v":
						e.preventDefault();
						handlePaste();
						break;
				}
			}

			if (selectedCell) {
				if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
					if (e.key.toLowerCase() === "b") {
						e.preventDefault();
						const currentStyle = data[selectedCell]?.style || {};
						updateCellStyle(selectedCell, { bold: !currentStyle.bold });
						toast.success("Bold style toggled", {
							icon: <Bold className="h-4 w-4" />,
							duration: 1500,
						});
					}
					if (e.key.toLowerCase() === "i") {
						e.preventDefault();
						const currentStyle = data[selectedCell]?.style || {};
						updateCellStyle(selectedCell, { italic: !currentStyle.italic });
						toast.success("Italic style toggled", {
							icon: <Italic className="h-4 w-4" />,
							duration: 1500,
						});
					}
					if (e.key.toLowerCase() === "u") {
						e.preventDefault();
						const currentStyle = data[selectedCell]?.style || {};
						updateCellStyle(selectedCell, { underline: !currentStyle.underline });
						toast.success("Underline style toggled", {
							icon: <Underline className="h-4 w-4" />,
							duration: 1500,
						});
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedCell, data, updateCellStyle]);

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

	const handleSave = useCallback(() => {
		toast.success("Saved", {
			description: "Your spreadsheet has been saved.",
			icon: <Save className="h-4 w-4" />,
		});
	}, []);

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

	const handleInsertChart = useCallback(() => {
		toast.success("Insert Chart", {
			description: "Chart wizard opened",
			icon: <BarChart className="h-4 w-4" />,
		});
	}, []);

	const handleInsertImage = useCallback(() => {
		toast.success("Insert Image", {
			description: "Image upload dialog opened",
			icon: <Upload className="h-4 w-4" />,
		});
	}, []);

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
			filterRange(range, 0, () => true);
			toast.success("Filter", {
				description: "Filter applied",
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
			toast.success("Remove Duplicates", {
				description: "Removing duplicate values...",
				icon: <Trash2 className="h-4 w-4" />,
			});
		} else {
			toast.error("No range selected", {
				description: "Please select a range to remove duplicates",
			});
		}
	}, [selectionRange]);

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

	return (
		<div className="h-screen flex flex-col font-sans overflow-hidden">
			{/* Top Header */}
			<header className="h-14 border-b flex items-center justify-between px-4 bg-background">
				<div className="flex items-center gap-4">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link href="/">
									<Button variant="ghost" size="icon">
										<ArrowLeft className="h-5 w-5" />
									</Button>
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								<p>Back to home</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<div className="flex flex-col">
						<div className="flex items-center gap-2">
							<input
								className="text-sm font-semibold border-none outline-none bg-transparent hover:bg-muted/50 rounded px-1 w-48"
								value={sheetName}
								onChange={(e) => {
									setSheetName(e.target.value);
									handleRenameSheet(currentSheetIndex, e.target.value);
								}}
							/>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-6 w-6">
										<ChevronDown className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuLabel>Sheets</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{sheetNames.map((name, index) => (
										<DropdownMenuItem 
											key={index}
											onClick={() => handleSwitchSheet(index)}
											className={index === currentSheetIndex ? "bg-accent" : ""}
										>
											<FileSpreadsheet className="mr-2 h-4 w-4" />
											{name}
										</DropdownMenuItem>
									))}
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleAddSheet}>
										<Plus className="mr-2 h-4 w-4" />
										Add Sheet
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleDeleteCurrentSheet}>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete Sheet
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<div className="text-xs text-muted-foreground flex gap-2">
							{/* File Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-6 px-1 text-xs hover:bg-accent">
										File
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuLabel>File Operations</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleSave}>
										<Save className="mr-2 h-4 w-4" />
										Save
										<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setShowImportDialog(true)}>
										<Upload className="mr-2 h-4 w-4" />
										Import
										<DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setShowExportDialog(true)}>
										<Download className="mr-2 h-4 w-4" />
										Export
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => setShowPrintDialog(true)}>
										<Printer className="mr-2 h-4 w-4" />
										Print
										<DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setShowPageSetupDialog(true)}>
										<Grid3x3 className="mr-2 h-4 w-4" />
										Page Setup
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
										<Trash2 className="mr-2 h-4 w-4 text-destructive" />
										<span className="text-destructive">Clear Sheet</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Edit Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-6 px-1 text-xs hover:bg-accent">
										Edit
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuLabel>Edit Actions</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleUndo}>
										<Undo className="mr-2 h-4 w-4" />
										Undo
										<DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleRedo}>
										<Redo className="mr-2 h-4 w-4" />
										Redo
										<DropdownMenuShortcut>⌘Y</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleCut}>
										<Scissors className="mr-2 h-4 w-4" />
										Cut
										<DropdownMenuShortcut>⌘X</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleCopy}>
										<Copy className="mr-2 h-4 w-4" />
										Copy
										<DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handlePaste}>
										<ClipboardPaste className="mr-2 h-4 w-4" />
										Paste
										<DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleDelete}>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete
										<DropdownMenuShortcut>Del</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleSelectAll}>
										<Grid3x3 className="mr-2 h-4 w-4" />
										Select All
										<DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setShowFindDialog(true)}>
										<Search className="mr-2 h-4 w-4" />
										Find & Replace
										<DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* View Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-6 px-1 text-xs hover:bg-accent">
										View
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuLabel>View Options</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleZoomIn}>
										<ZoomIn className="mr-2 h-4 w-4" />
										Zoom In
										<DropdownMenuShortcut>⌘+</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleZoomOut}>
										<ZoomOut className="mr-2 h-4 w-4" />
										Zoom Out
										<DropdownMenuShortcut>⌘-</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setZoom(100)}>
										<Grid3x3 className="mr-2 h-4 w-4" />
										Reset Zoom
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleZoomToSelection}>
										<Search className="mr-2 h-4 w-4" />
										Zoom to Selection
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
										<div className="flex items-center justify-between w-full">
											<span>Show Grid</span>
											<Switch 
												checked={showGrid} 
												onCheckedChange={(checked) => {
													setShowGrid(checked);
													toast.success(checked ? "Grid shown" : "Grid hidden", {
														duration: 1000,
													});
												}} 
												className="scale-75"
											/>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
										<div className="flex items-center justify-between w-full">
											<span>Show Headers</span>
											<Switch 
												checked={showHeaders} 
												onCheckedChange={(checked) => {
													setShowHeaders(checked);
													toast.success(checked ? "Headers shown" : "Headers hidden", {
														duration: 1000,
													});
												}} 
												className="scale-75"
											/>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
										<div className="flex items-center justify-between w-full">
											<span>Freeze Panes</span>
											<Switch 
												checked={freezePanes} 
												onCheckedChange={(checked) => {
													setFreezePanes(checked);
													toast.success(checked ? "Panes frozen" : "Panes unfrozen", {
														duration: 1000,
													});
												}} 
												className="scale-75"
											/>
										</div>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Insert Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-6 px-1 text-xs hover:bg-accent">
										Insert
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuLabel>Insert Elements</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleInsertRow}>
										<Table className="mr-2 h-4 w-4" />
										Insert Row
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleDeleteRow}>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete Row
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleInsertColumn}>
										<Table className="mr-2 h-4 w-4 rotate-90" />
										Insert Column
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleDeleteColumn}>
										<Trash2 className="mr-2 h-4 w-4 rotate-90" />
										Delete Column
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleInsertChart}>
										<BarChart className="mr-2 h-4 w-4" />
										Chart
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleInsertImage}>
										<Upload className="mr-2 h-4 w-4" />
										Image
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Format Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-6 px-1 text-xs hover:bg-accent">
										Format
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuLabel>Format Options</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleFormatCells}>
										<Bold className="mr-2 h-4 w-4" />
										Format Cells
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleConditionalFormatting}>
										<Eye className="mr-2 h-4 w-4" />
										Conditional Formatting
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuSub>
										<DropdownMenuSubTrigger>
											<Table className="mr-2 h-4 w-4" />
											<span>Number Format</span>
										</DropdownMenuSubTrigger>
										<DropdownMenuPortal>
											<DropdownMenuSubContent>
												<DropdownMenuItem onClick={() => handleNumberFormat("general")}>
													General
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("number")}>
													Number
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("currency")}>
													Currency
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("date")}>
													Date
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("time")}>
													Time
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("percentage")}>
													Percentage
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("fraction")}>
													Fraction
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("scientific")}>
													Scientific
												</DropdownMenuItem>
											</DropdownMenuSubContent>
										</DropdownMenuPortal>
									</DropdownMenuSub>
									<DropdownMenuSub>
										<DropdownMenuSubTrigger>
											<AlignLeft className="mr-2 h-4 w-4" />
											<span>Alignment</span>
										</DropdownMenuSubTrigger>
										<DropdownMenuPortal>
											<DropdownMenuSubContent>
												<DropdownMenuItem onClick={() => handleAlignment("Left")}>
													Left
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleAlignment("Center")}>
													Center
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleAlignment("Right")}>
													Right
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleAlignment("Top")}>
													Top
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleAlignment("Middle")}>
													Middle
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleAlignment("Bottom")}>
													Bottom
												</DropdownMenuItem>
											</DropdownMenuSubContent>
										</DropdownMenuPortal>
									</DropdownMenuSub>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleAddNamedRange}>
										<FileSpreadsheet className="mr-2 h-4 w-4" />
										Define Named Range
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleAddNote}>
										<FileSpreadsheet className="mr-2 h-4 w-4" />
										Add Note
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleDataValidation}>
										<Grid3x3 className="mr-2 h-4 w-4" />
										Data Validation
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Data Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-6 px-1 text-xs hover:bg-accent">
										Data
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuLabel>Data Tools</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleSort}>
										<Search className="mr-2 h-4 w-4" />
										Sort
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleFilter}>
										<Filter className="mr-2 h-4 w-4" />
										Filter
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleGroup}>
										<Table className="mr-2 h-4 w-4" />
										Group
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleRemoveDuplicates}>
										<Trash2 className="mr-2 h-4 w-4" />
										Remove Duplicates
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleDataValidation}>
										<Grid3x3 className="mr-2 h-4 w-4" />
										Data Validation
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleWhatIfAnalysis}>
										<BarChart className="mr-2 h-4 w-4" />
										What-If Analysis
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Share Dialog komponent */}
					<ShareDialog
						resourceName={sheetName}
						resourceType="spreadsheet"
						initialSettings={shareSettings}
						currentUserEmail="user@example.com"
						currentUserId="current-user-id"
						onSave={handleShareSave}
						onInvite={handleInvite}
						onRemoveCollaborator={handleRemoveCollaborator}
						onCopyLink={handleCopyLink}
						isLoading={false}
					/>
					
					{/* Help Button */}
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => {
										toast.info("Help", {
											description: "Press ⌘? for keyboard shortcuts",
										});
									}}
								>
									<HelpCircle className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Help</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

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
			<div className="flex-1 overflow-auto" style={{ zoom: `${zoom}%` }}>
				<Grid
					data={data}
					selectedCell={selectedCell}
					onSelectCell={selectCell}
					onCellChange={handleCellChange}
					showGrid={showGrid}
					showHeaders={showHeaders}
					freezePanes={freezePanes}
				/>
			</div>

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
		</div>
	);
}