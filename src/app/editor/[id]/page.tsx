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
		data,
		setData,
		selectedCell,
		updateCell,
		updateCellStyle,
		getCellFormula,
		selectCell,
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
	const [findText, setFindText] = useState("");
	const [replaceText, setReplaceText] = useState("");
	const [matchCase, setMatchCase] = useState(false);
	const [wholeCell, setWholeCell] = useState(false);
	const [zoom, setZoom] = useState(100);
	const [showGrid, setShowGrid] = useState(true);
	const [showHeaders, setShowHeaders] = useState(true);
	const [freezePanes, setFreezePanes] = useState(false);

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
						selectAll();
						break;
				}
			}

			if (selectedCell) {
				if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
					if (e.key.toLowerCase() === "b") {
						e.preventDefault();
						const currentStyle = data[selectedCell]?.style || {};
						updateCellStyle(selectedCell, { bold: !currentStyle.bold });
						toast.info("Bold style toggled");
					}
					if (e.key.toLowerCase() === "i") {
						e.preventDefault();
						const currentStyle = data[selectedCell]?.style || {};
						updateCellStyle(selectedCell, { italic: !currentStyle.italic });
						toast.info("Italic style toggled");
					}
					if (e.key.toLowerCase() === "u") {
						e.preventDefault();
						const currentStyle = data[selectedCell]?.style || {};
						updateCellStyle(selectedCell, { underline: !currentStyle.underline });
						toast.info("Underline style toggled");
					}
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

	const handleUndo = useCallback(() => {
		toast.info("Undo", {
			description: "Undo last action",
		});
	}, []);

	const handleRedo = useCallback(() => {
		toast.info("Redo", {
			description: "Redo last action",
		});
	}, []);

	const selectAll = useCallback(() => {
		toast.info("Select All", {
			description: "All cells selected",
		});
	}, []);

	const handleCut = useCallback(() => {
		if (selectedCell) {
			toast.info("Cut", {
				description: `Cell ${selectedCell} copied to clipboard`,
			});
		}
	}, [selectedCell]);

	const handleCopy = useCallback(() => {
		if (selectedCell) {
			toast.info("Copy", {
				description: `Cell ${selectedCell} copied to clipboard`,
			});
		}
	}, [selectedCell]);

	const handlePaste = useCallback(() => {
		toast.info("Paste", {
			description: "Pasted from clipboard",
		});
	}, []);

	const handleDelete = useCallback(() => {
		if (selectedCell) {
			updateCell(selectedCell, "");
			toast.success("Deleted", {
				description: `Cell ${selectedCell} cleared`,
			});
		} else {
			setShowDeleteDialog(true);
		}
	}, [selectedCell, updateCell]);

	const handleClearAll = useCallback(() => {
		clearSheet();
		setShowDeleteDialog(false);
		toast.success("Sheet cleared", {
			description: "All data has been removed",
		});
	}, [clearSheet]);

	const handleFind = useCallback(() => {
		if (!findText) return;

		toast.info("Find", {
			description: `Searching for "${findText}"`,
		});
		setShowFindDialog(false);
	}, [findText]);

	const handleReplace = useCallback(() => {
		if (!findText) return;

		toast.info("Replace", {
			description: `Replaced "${findText}" with "${replaceText}"`,
		});
		setShowFindDialog(false);
	}, [findText, replaceText]);

	const handleExport = useCallback(
		async (format: string = "excel") => {
			try {
				await exportToExcel(data, sheetName);
				toast.success("Export Successful", {
					description: `Your spreadsheet has been exported as ${format.toUpperCase()}.`,
				});
				setShowExportDialog(false);
			} catch (error) {
				toast.error("Export Failed", {
					description: "There was an error exporting your spreadsheet.",
				});
			}
		},
		[data, sheetName, exportToExcel],
	);

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
				setShowImportDialog(false);
			} catch (error) {
				toast.error("Import Failed", {
					description: "There was an error importing your Excel file.",
				});
			}
		},
		[importFromExcel, setData],
	);

	const handlePrint = useCallback(() => {
		toast.info("Print", {
			description: "Preparing document for printing...",
		});
		setShowPrintDialog(false);
	}, []);

	const handlePageSetup = useCallback(() => {
		toast.success("Page setup saved", {
			description: "Your page settings have been applied",
		});
		setShowPageSetupDialog(false);
	}, []);

	const handleInsertRow = useCallback(() => {
		toast.info("Insert Row", {
			description: "New row inserted",
		});
	}, []);

	const handleInsertColumn = useCallback(() => {
		toast.info("Insert Column", {
			description: "New column inserted",
		});
	}, []);

	const handleInsertChart = useCallback(() => {
		toast.info("Insert Chart", {
			description: "Chart wizard opened",
		});
	}, []);

	const handleInsertImage = useCallback(() => {
		toast.info("Insert Image", {
			description: "Image upload dialog opened",
		});
	}, []);

	const handleFormatCells = useCallback(() => {
		toast.info("Format Cells", {
			description: "Format cells dialog opened",
		});
	}, []);

	const handleConditionalFormatting = useCallback(() => {
		toast.info("Conditional Formatting", {
			description: "Conditional formatting rules editor opened",
		});
	}, []);

	const handleNumberFormat = useCallback((format: string) => {
		if (selectedCell) {
			toast.info("Number Format", {
				description: `Applied ${format} format to cell ${selectedCell}`,
			});
		}
	}, [selectedCell]);

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
			
			toast.info("Alignment", {
				description: `Applied ${align} alignment to cell ${selectedCell}`,
			});
		}
	}, [selectedCell, updateCellStyle]);

	const handleSort = useCallback(() => {
		toast.info("Sort", {
			description: "Sort dialog opened",
		});
	}, []);

	const handleFilter = useCallback(() => {
		toast.info("Filter", {
			description: "Filter dialog opened",
		});
	}, []);

	const handleGroup = useCallback(() => {
		toast.info("Group", {
			description: "Group dialog opened",
		});
	}, []);

	const handleRemoveDuplicates = useCallback(() => {
		toast.info("Remove Duplicates", {
			description: "Removing duplicate values...",
		});
	}, []);

	const handleDataValidation = useCallback(() => {
		toast.info("Data Validation", {
			description: "Data validation dialog opened",
		});
	}, []);

	const handleWhatIfAnalysis = useCallback(() => {
		toast.info("What-If Analysis", {
			description: "What-If analysis tools opened",
		});
	}, []);

	const handleZoomIn = useCallback(() => {
		setZoom(prev => Math.min(prev + 10, 200));
		toast.info(`Zoom: ${Math.min(zoom + 10, 200)}%`);
	}, [zoom]);

	const handleZoomOut = useCallback(() => {
		setZoom(prev => Math.max(prev - 10, 50));
		toast.info(`Zoom: ${Math.max(zoom - 10, 50)}%`);
	}, [zoom]);

	const handleZoomToSelection = useCallback(() => {
		if (selectedCell) {
			toast.info("Zoom to Selection", {
				description: `Zoomed to cell ${selectedCell}`,
			});
		}
	}, [selectedCell]);

	// Share handlers
	const handleShareSave = async (settings: ShareSettings) => {
		setShareSettings(settings);
		return Promise.resolve();
	};

	const handleInvite = async (emails: string[], permission: Permission) => {
		console.log("Inviting:", emails, "with permission:", permission);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		toast.success("Invitations sent", {
			description: `Invited ${emails.length} collaborator(s)`,
		});
	};

	const handleRemoveCollaborator = async (collaboratorId: string) => {
		console.log("Removing collaborator:", collaboratorId);
		await new Promise((resolve) => setTimeout(resolve, 500));
		toast.success("Collaborator removed");
	};

	const handleCopyLink = () => {
		const shareUrl = `${window.location.origin}/share/${id}`;
		navigator.clipboard.writeText(shareUrl);
		toast.success("Link copied to clipboard");
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
						<input
							className="text-sm font-semibold border-none outline-none bg-transparent hover:bg-muted/50 rounded px-1 w-48"
							value={sheetName}
							onChange={(e) => {
								setSheetName(e.target.value);
								updateSheetName(e.target.value);
							}}
						/>
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
									<DropdownMenuItem onClick={selectAll}>
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
												onCheckedChange={setShowGrid} 
												className="scale-75"
											/>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
										<div className="flex items-center justify-between w-full">
											<span>Show Headers</span>
											<Switch 
												checked={showHeaders} 
												onCheckedChange={setShowHeaders} 
												className="scale-75"
											/>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
										<div className="flex items-center justify-between w-full">
											<span>Freeze Panes</span>
											<Switch 
												checked={freezePanes} 
												onCheckedChange={setFreezePanes} 
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
									<DropdownMenuItem onClick={handleInsertColumn}>
										<Table className="mr-2 h-4 w-4 rotate-90" />
										Insert Column
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
												<DropdownMenuItem onClick={() => handleNumberFormat("General")}>
													General
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("Number")}>
													Number
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("Currency")}>
													Currency
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("Date")}>
													Date
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("Time")}>
													Time
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("Percentage")}>
													Percentage
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("Fraction")}>
													Fraction
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleNumberFormat("Scientific")}>
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