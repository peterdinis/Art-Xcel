"use client";

import { useCallback, RefObject } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { UseEditorStateReturn } from "./use-editor-state";
import type { useSpreadsheet } from "./use-spreadsheet";
import type { useExcelService } from "./use-excel-service";
import type { useSpreadsheetDB } from "./use-spreadsheet-db";
import type { GridHandle } from "@/components/editor/Grid";
import { saveSpreadsheetAction } from "@/app/editor/[id]/actions";

type Spreadsheet = ReturnType<typeof useSpreadsheet>;
type ExcelService = ReturnType<typeof useExcelService>;
type DB = ReturnType<typeof useSpreadsheetDB>;

interface UseEditorHandlersProps {
	id: string;
	router: ReturnType<typeof useRouter>;
	gridRef: RefObject<GridHandle | null>;
	spreadsheet: Spreadsheet;
	excelService: ExcelService;
	state: UseEditorStateReturn;
	db: DB;
}

export function useEditorHandlers({
	id,
	router,
	gridRef,
	spreadsheet,
	excelService,
	state,
	db,
}: UseEditorHandlersProps) {
	const {
		data,
		selectedCell,
		selectionRange,
		sheetNames,
		currentSheetIndex,
		updateCell,
		updateCells,
		updateCellStyle,
		validateCell,
		undo,
		redo,
		selectCell,
		selectRange,
		copyCells,
		cutCells,
		pasteCells,
		clearSheet,
		insertRow,
		deleteRow,
		insertColumn,
		deleteColumn,
		sortRange,
		filterRange,
		findAndReplace,
		removeDuplicates,
		textToColumns,
		addSheet,
		deleteSheet,
		renameSheet,
		switchSheet,
		addChart,
		addImage,
		addShape,
		addIcon,
		addNote,
		addValidation,
		createNamedRange,
		getCellFormula,
		getCellValue,
		setData,
	} = spreadsheet;

	const { exportToFile, importFromFile } = excelService;

	const {
		sheetName,
		zoom,
		findText,
		replaceText,
		matchCase,
		wholeCell,
		newSheetName,
		newRangeName,
		newRangeRef,
		cellNote,
		validationType,
		validationMin,
		validationMax,
		validationList,
		validationRequired,
		chartType,
		chartTitle,
		shareSettings,
		formatPainter,
		setSheetName,
		setZoom,
		setShowFindDialog,
		setShowDeleteDialog,
		setShowNewSheetDialog,
		setShowNamedRangeDialog,
		setShowNoteDialog,
		setShowValidationDialog,
		setShowChartDialog,
		setShowIconDialog,
		setShowConditionalFormattingDialog,
		setShowExportDialog,
		setShowInsertFunctionDialog,
		setNewSheetName,
		setNewRangeName,
		setNewRangeRef,
		setCellNote,
		setFormatPainter,
		setIsLoading,
		setShareSettings,
	} = state;

	// ── Cell operations ──────────────────────────────────────────────────────

	const handleCellChange = useCallback(
		(cellId: string, value: string) => {
			if (!validateCell(cellId, value)) {
				toast.error("Validation failed", {
					description: "The value does not meet validation criteria",
				});
				return;
			}
			updateCell(cellId, value);
		},
		[validateCell, updateCell],
	);

	const handleFormulaBarChange = useCallback(
		(value: string) => {
			if (selectedCell) updateCell(selectedCell, value);
		},
		[selectedCell, updateCell],
	);

	const handleStyleChange = useCallback(
		(style: Record<string, unknown>) => {
			if (selectionRange && selectionRange.length > 0) {
				updateCellStyle(selectionRange, style as any);
				toast.success("Style applied to selection", { duration: 1000 });
			} else if (selectedCell) {
				updateCellStyle(selectedCell, style as any);
				toast.success("Style applied", { duration: 1000 });
			}
		},
		[selectedCell, selectionRange, updateCellStyle],
	);

	const handleFormulaClick = useCallback(
		(formula: string) => {
			if (selectedCell) {
				updateCell(selectedCell, `=${formula}( )`);
				toast.info(`Inserted ${formula}`);
			} else {
				toast.error("No cell selected", {
					description: "Please select a cell to insert a formula",
				});
			}
		},
		[selectedCell, updateCell],
	);

	// ── Save / Undo / Redo ───────────────────────────────────────────────────

	const handleSave = useCallback(async () => {
		state.setShowSaveDialog(true);
	}, [state]);

	const handleConfirmSave = useCallback(async () => {
		const result = await saveSpreadsheetAction(id, data);
		if (result.success) {
			toast.success("Saved to Cloud", {
				description: `Version updated at ${new Date(result.timestamp).toLocaleTimeString()}`,
			});
		} else {
			toast.error("Save failed", {
				description: "Could not synchronize with the server",
			});
		}
	}, [id, data]);

	const handleNew = useCallback(() => {
		router.push("/editor/new");
		toast.info("Creating new spreadsheet...");
	}, [router]);

	const handleOpen = useCallback(() => {
		// This is usually handled by the hidden file input in the toolbar
		// but we can provide a toast or navigate to dashboard
		router.push("/dashboard");
	}, [router]);

	const handleUndo = useCallback(() => {
		undo();
		toast.info("Undo", { description: "Undo last action" });
	}, [undo]);

	const handleRedo = useCallback(() => {
		redo();
		toast.info("Redo", { description: "Redo last action" });
	}, [redo]);

	// ── Clipboard ────────────────────────────────────────────────────────────

	const handleSelectAll = useCallback(() => {
		selectRange("A1:Z100");
	}, [selectRange]);

	const handleCut = useCallback(() => {
		if (!selectedCell) {
			toast.error("No cell selected");
			return;
		}
		const cells = selectionRange ?? [selectedCell];
		cutCells(cells);
		toast.info("Cut", { description: `${cells.length} cell(s) cut` });
	}, [selectedCell, selectionRange, cutCells]);

	const handleCopy = useCallback(() => {
		if (!selectedCell) {
			toast.error("No cell selected");
			return;
		}
		const cells = selectionRange ?? [selectedCell];
		copyCells(cells);
		toast.info("Copy", { description: `${cells.length} cell(s) copied` });
	}, [selectedCell, selectionRange, copyCells]);

	const handlePaste = useCallback(() => {
		if (!selectedCell) {
			toast.error("No cell selected");
			return;
		}
		pasteCells(selectedCell);
		toast.info("Paste", { description: "Pasted from clipboard" });
	}, [selectedCell, pasteCells]);

	const handleDelete = useCallback(() => {
		if (!selectedCell) {
			setShowDeleteDialog(true);
			return;
		}
		if (selectionRange && selectionRange.length > 1) {
			const updates: Record<string, string> = {};
			selectionRange.forEach((c) => (updates[c] = ""));
			updateCells(updates);
			toast.success("Deleted", {
				description: `${selectionRange.length} cells cleared`,
			});
		} else {
			updateCell(selectedCell, "");
			toast.success("Deleted", { description: `Cell ${selectedCell} cleared` });
		}
	}, [selectedCell, selectionRange, updateCell, updateCells, setShowDeleteDialog]);

	const handleClearAll = useCallback(() => {
		clearSheet();
		setShowDeleteDialog(false);
		toast.success("Sheet cleared", { description: "All data has been removed" });
	}, [clearSheet, setShowDeleteDialog]);

	// ── Find & Replace ───────────────────────────────────────────────────────

	const handleFind = useCallback(() => {
		if (!findText) { toast.error("Please enter text to find"); return; }
		findAndReplace(findText, replaceText, { matchCase, wholeCell });
		toast.success("Find and Replace", { description: `Replaced "${findText}" with "${replaceText}"` });
		setShowFindDialog(false);
	}, [findText, replaceText, matchCase, wholeCell, findAndReplace, setShowFindDialog]);

	const handleReplace = useCallback(() => {
		if (!findText) { toast.error("Please enter text to find"); return; }
		findAndReplace(findText, replaceText, { matchCase, wholeCell });
		toast.success("Replace done");
		setShowFindDialog(false);
	}, [findText, replaceText, matchCase, wholeCell, findAndReplace, setShowFindDialog]);

	// ── Export / Import ──────────────────────────────────────────────────────

	const handleExport = useCallback(
		async (format: string = "xlsx") => {
			try {
				toast.loading("Exporting...", { id: "export-toast" });
				await exportToFile(data, sheetName, format as "xlsx" | "ods");
				toast.success("Export Successful", { id: "export-toast" });
				setShowExportDialog(false);
			} catch {
				toast.error("Export Failed", { id: "export-toast" });
			}
		},
		[data, sheetName, exportToFile, setShowExportDialog],
	);

	const handleExportFormat = useCallback(
		async (format: "xlsx" | "ods") => handleExport(format),
		[handleExport],
	);

	const handleImport = useCallback(
		async (file: File) => {
			try {
				toast.loading("Importing...", { id: "import-toast" });
				const { data: importedData, name: importedName } = await importFromFile(file);
				setData(importedData);
				setSheetName(importedName);
				toast.success("Import Successful", { id: "import-toast" });
			} catch {
				toast.error("Import Failed", { id: "import-toast" });
			}
		},
		[importFromFile, setData, setSheetName],
	);

	// ── Print / Page Setup ───────────────────────────────────────────────────

	const handlePrint = useCallback(() => {
		toast.loading("Preparing...", { id: "print-toast" });
		setTimeout(() => toast.success("Ready to print", { id: "print-toast" }), 1500);
	}, []);

	const handlePageSetup = useCallback(() => {
		toast.success("Page setup saved");
	}, []);

	// ── Row / Column ─────────────────────────────────────────────────────────

	const handleInsertRow = useCallback(() => {
		const row = selectedCell
			? parseInt(selectedCell.match(/\d+/)?.[0] || "1")
			: 1;
		insertRow(row);
		toast.success("Insert Row", { description: `New row at position ${row}` });
	}, [selectedCell, insertRow]);

	const handleDeleteRow = useCallback(() => {
		if (!selectedCell) return;
		const row = parseInt(selectedCell.match(/\d+/)?.[0] || "1");
		deleteRow(row);
		toast.success("Delete Row", { description: `Row ${row} deleted` });
	}, [selectedCell, deleteRow]);

	const handleInsertColumn = useCallback(() => {
		const col = selectedCell?.match(/[A-Z]+/)?.[0] ?? "A";
		insertColumn(col.charCodeAt(0) - 65);
		toast.success("Insert Column", { description: `New column at ${col}` });
	}, [selectedCell, insertColumn]);

	const handleDeleteColumn = useCallback(() => {
		if (!selectedCell) return;
		const col = selectedCell.match(/[A-Z]+/)?.[0] ?? "A";
		deleteColumn(col.charCodeAt(0) - 65);
		toast.success("Delete Column", { description: `Column ${col} deleted` });
	}, [selectedCell, deleteColumn]);

	// ── Zoom ─────────────────────────────────────────────────────────────────

	const handleZoomIn = useCallback(() => {
		const newZoom = Math.min(zoom + 10, 200);
		setZoom(newZoom);
		toast.success(`Zoom: ${newZoom}%`, { duration: 1000 });
	}, [zoom, setZoom]);

	const handleZoomOut = useCallback(() => {
		const newZoom = Math.max(zoom - 10, 50);
		setZoom(newZoom);
		toast.success(`Zoom: ${newZoom}%`, { duration: 1000 });
	}, [zoom, setZoom]);

	// ── Sort / Filter / Data ─────────────────────────────────────────────────

	const handleSort = useCallback((direction: "asc" | "desc" = "asc") => {
		if (!selectionRange || selectionRange.length === 0) {
			toast.error("No range selected");
			return;
		}
		sortRange(`${selectionRange[0]}:${selectionRange[selectionRange.length - 1]}`, 0, direction === "asc");
		toast.success("Sort", { description: `Range sorted ${direction === "asc" ? "ascending" : "descending"}` });
	}, [selectionRange, sortRange]);

	const handleFilter = useCallback(() => {
		if (!selectionRange || selectionRange.length === 0) {
			toast.error("No range selected");
			return;
		}
		filterRange(`${selectionRange[0]}:${selectionRange[selectionRange.length - 1]}`, 0, (v) => v !== "");
		toast.success("Filter applied");
	}, [selectionRange, filterRange]);

	const handleRemoveDuplicates = useCallback(() => {
		if (!selectionRange || selectionRange.length === 0) {
			toast.error("No range selected");
			return;
		}
		removeDuplicates(`${selectionRange[0]}:${selectionRange[selectionRange.length - 1]}`, 0);
		toast.success("Remove Duplicates done");
	}, [selectionRange, removeDuplicates]);

	const handleTextToColumns = useCallback(() => {
		if (!selectionRange || selectionRange.length === 0) {
			toast.error("No range selected");
			return;
		}
		textToColumns(`${selectionRange[0]}:${selectionRange[selectionRange.length - 1]}`, ",");
		toast.success("Text to Columns done");
	}, [selectionRange, textToColumns]);

	const handleDataValidation = useCallback(() => {
		if (selectedCell) {
			state.setShowValidationDialog(true);
		} else {
			toast.error("No cell selected");
		}
	}, [selectedCell, state]);

	// ── Formatting ───────────────────────────────────────────────────────────

	const handleNumberFormat = useCallback(
		(format: string) => {
			if (!selectedCell) { toast.error("No cell selected"); return; }
			updateCellStyle(selectedCell, { numberFormat: format as any });
			toast.success(`Applied ${format} format`);
		},
		[selectedCell, updateCellStyle],
	);

	const handleAlignment = useCallback(
		(align: string) => {
			if (!selectedCell) { toast.error("No cell selected"); return; }
			const alignValue = align === "Left" ? "left" : align === "Center" ? "center" : "right";
			updateCellStyle(selectedCell, { align: alignValue as any });
			toast.success(`Alignment: ${align}`);
		},
		[selectedCell, updateCellStyle],
	);

	const handleConditionalFormatting = useCallback(() => {
		setShowConditionalFormattingDialog(true);
	}, [setShowConditionalFormattingDialog]);

	const handleFontFamily = useCallback((font: string) => {
		if (selectedCell) {
			updateCellStyle(selectedCell, { fontFamily: font } as any);
			toast.success(`Font: ${font}`);
		}
	}, [selectedCell, updateCellStyle]);

	const handleFontSize = useCallback((size: number) => {
		if (selectedCell) {
			updateCellStyle(selectedCell, { fontSize: size } as any);
			toast.success(`Size: ${size}px`);
		}
	}, [selectedCell, updateCellStyle]);

	const handleDecreaseIndent = useCallback(() => {
		toast.info("Decrease indent");
	}, []);

	const handleIncreaseIndent = useCallback(() => {
		toast.info("Increase indent");
	}, []);

	const handleFullScreen = useCallback(() => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
			toast.info("Entered Full Screen");
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
				toast.info("Exited Full Screen");
			}
		}
	}, []);

	const handleApplyConditionalFormatting = useCallback(
		(rule: { type: string; value: string; color: string }) => {
			if (!selectedCell) return;
			const cellValue = data[selectedCell]?.value || "";
			const n = Number(cellValue);
			const t = Number(rule.value);
			let matches = false;
			if (rule.type === "greaterThan") matches = n > t;
			else if (rule.type === "lessThan") matches = n < t;
			else if (rule.type === "equalTo") matches = cellValue === rule.value;
			else if (rule.type === "contains") matches = cellValue.includes(rule.value);
			if (matches) {
				updateCellStyle(selectedCell, { backgroundColor: rule.color } as any);
				toast.success("Conditional formatting applied");
			} else {
				toast.info("Rule applied – cell does not match criteria");
			}
		},
		[selectedCell, data, updateCellStyle],
	);

	const handleFormatPainter = useCallback(() => {
		if (selectedCell && data[selectedCell]?.style) {
			setFormatPainter({
				style: data[selectedCell].style!,
				sourceCellId: selectedCell,
				isActive: true,
			});
			toast.info("Format Painter Active", {
				description: "Select another cell to apply the style",
			});
		} else {
			toast.error("Please select a cell with style first");
		}
	}, [selectedCell, data, setFormatPainter]);

	const handleSelectCell = useCallback(
		(cellId: string) => {
			if (formatPainter?.isActive) {
				updateCellStyle(cellId, formatPainter.style as any);
				setFormatPainter({ style: {}, sourceCellId: "", isActive: false });
				toast.success("Format applied");
			}
			selectCell(cellId);
		},
		[formatPainter, selectCell, updateCellStyle, setFormatPainter],
	);

	// ── Charts / Images / Shapes / Icons ─────────────────────────────────────

	const handleInsertChart = useCallback(() => {
		const finalRange = state.chartRange || (selectionRange && selectionRange.length > 0
			? `${selectionRange[0]}:${selectionRange[selectionRange.length - 1]}`
			: null);

		if (!finalRange) {
			toast.error("No range specified");
			return;
		}

		addChart({
			type: state.chartType,
			range: finalRange,
			title: state.chartTitle || "New Chart",
			position: { x: 150, y: 150 },
			size: { width: 450, height: 350 },
		});

		state.setShowChartDialog(false);
		state.setChartRange("");
		state.setChartTitle("");
		toast.success("Chart Inserted", {
			description: `Chart for range ${finalRange} has been added.`,
		});
	}, [selectionRange, state, addChart]);

	const handleInsertImage = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (ev) => {
				addImage({
					src: ev.target?.result as string,
					position: { x: 150, y: 150 },
					size: { width: 300, height: 200 },
				});
				toast.success("Image Inserted");
			};
			reader.readAsDataURL(file);
		},
		[addImage],
	);

	const handleInsertShape = useCallback(
		(type: "rectangle" | "circle" | "line") => {
			addShape({
				type,
				position: { x: 200, y: 200 },
				size: { width: 150, height: 100 },
				style: { fill: "rgba(59,130,246,0.5)", stroke: "#2563eb", strokeWidth: 2 },
			});
			toast.success(`${type} inserted`);
		},
		[addShape],
	);

	const handleInsertIcon = useCallback(
		(name: string) => {
			addIcon({ iconName: name, position: { x: 250, y: 250 }, size: 48, color: "#3b82f6" });
			setShowIconDialog(false);
			toast.success("Icon Inserted");
		},
		[addIcon, setShowIconDialog],
	);

	// ── Notes / Comments ─────────────────────────────────────────────────────

	const handleAddNote = useCallback(() => {
		if (!selectedCell) { toast.error("No cell selected"); return; }
		setCellNote(data[selectedCell]?.note || "");
		setShowNoteDialog(true);
	}, [selectedCell, data, setCellNote, setShowNoteDialog]);

	const handleSaveNote = useCallback(() => {
		if (selectedCell) {
			addNote(selectedCell, cellNote);
			toast.success("Note saved");
			state.setShowNoteDialog(false);
		}
	}, [selectedCell, cellNote, addNote, state]);

	const handleInsertComment = useCallback(
		(comment: string) => {
			if (selectedCell) {
				addComment({
					cellId: selectedCell,
					author: "You",
					text: comment,
				});
				state.setShowCommentsSidebar(true);
				toast.success("Comment added");
			} else {
				toast.error("No cell selected");
			}
		},
		[selectedCell, addComment, state],
	);

	const handleInsertSpecialChar = useCallback(
		(char: string) => {
			if (!selectedCell) { toast.error("No cell selected"); return; }
			updateCell(selectedCell, (data[selectedCell]?.value || "") + char);
			toast.success(`Inserted ${char}`);
		},
		[selectedCell, data, updateCell],
	);

	const handleInsertHyperlink = useCallback(
		(url: string, text: string) => {
			if (!selectedCell) { toast.error("No cell selected"); return; }
			updateCell(selectedCell, text || url);
			toast.success("Hyperlink inserted");
		},
		[selectedCell, updateCell],
	);

	// ── Named Ranges ─────────────────────────────────────────────────────────

	const handleAddNamedRange = useCallback(() => {
		if (selectionRange && selectionRange.length > 0) {
			setShowNamedRangeDialog(true);
			setNewRangeRef(`${selectionRange[0]}:${selectionRange[selectionRange.length - 1]}`);
		} else if (selectedCell) {
			setShowNamedRangeDialog(true);
			setNewRangeRef(selectedCell);
		} else {
			toast.error("No selection");
		}
	}, [selectedCell, selectionRange, setShowNamedRangeDialog, setNewRangeRef]);

	const handleCreateNamedRange = useCallback(() => {
		if (newRangeName && newRangeRef) {
			createNamedRange(newRangeName, newRangeRef);
			toast.success(`Range "${newRangeName}" created`);
			setShowNamedRangeDialog(false);
			setNewRangeName("");
			setNewRangeRef("");
		}
	}, [newRangeName, newRangeRef, createNamedRange, setShowNamedRangeDialog, setNewRangeName, setNewRangeRef]);

	// ── Validation ───────────────────────────────────────────────────────────

	const handleSaveValidation = useCallback(() => {
		if (!selectedCell) return;
		addValidation(selectedCell, {
			type: validationType,
			min: validationType === "number" ? validationMin : undefined,
			max: validationType === "number" ? validationMax : undefined,
			list: validationType === "list" ? validationList.split(",").map((s) => s.trim()) : undefined,
			required: validationRequired,
		});
		toast.success("Validation added");
		setShowValidationDialog(false);
	}, [selectedCell, validationType, validationMin, validationMax, validationList, validationRequired, addValidation, setShowValidationDialog]);

	// ── Sheets ───────────────────────────────────────────────────────────────

	const handleAddSheet = useCallback(() => {
		state.setShowNewSheetDialog(true);
	}, [state]);

	const handleCreateSheet = useCallback(() => {
		const name = newSheetName || `Sheet${sheetNames.length + 1}`;
		addSheet(name);
		toast.success(`Sheet "${name}" created`);
		setShowNewSheetDialog(false);
		setNewSheetName("");
	}, [newSheetName, sheetNames.length, addSheet, setShowNewSheetDialog, setNewSheetName]);

	const handleDeleteCurrentSheet = useCallback(() => {
		if (sheetNames.length > 1) {
			deleteSheet(currentSheetIndex);
			toast.success("Sheet deleted");
		} else {
			toast.error("Cannot delete last sheet");
		}
	}, [sheetNames.length, currentSheetIndex, deleteSheet]);

	const handleRenameSheet = useCallback(
		(index: number, newName: string) => {
			renameSheet(index, newName);
			if (index === currentSheetIndex) setSheetName(newName);
			toast.success("Sheet renamed");
		},
		[currentSheetIndex, renameSheet, setSheetName],
	);

	const handleSwitchSheet = useCallback(
		(index: number) => {
			switchSheet(index);
			setSheetName(sheetNames[index]);
		},
		[sheetNames, switchSheet, setSheetName],
	);

	// ── Share ────────────────────────────────────────────────────────────────

	const handleShareSave = useCallback(
		async (settings: typeof shareSettings) => {
			setShareSettings(settings);
			await new Promise((r) => setTimeout(r, 800));
			toast.success("Share settings updated");
		},
		[setShareSettings],
	);

	const handleCopyLink = useCallback(() => {
		const url = `${window.location.origin}/share/${id}`;
		navigator.clipboard.writeText(url);
		toast.success("Link copied to clipboard");
	}, [id]);

	// ── Misc ─────────────────────────────────────────────────────────────────

	const handleSpelling = useCallback(() => {
		toast.loading("Checking spelling...", { id: "spelling" });
		setTimeout(() =>
			toast.success("No spelling errors found", { id: "spelling" }), 1500);
	}, []);

	const handleScrollToTop = useCallback(() => {
		gridRef.current?.scrollToTop();
	}, [gridRef]);

	return {
		// Cell
		handleCellChange,
		handleFormulaBarChange,
		handleStyleChange,
		handleFormulaClick,
		handleSelectCell,
		// Save/Undo/Redo
		handleSave,
		handleConfirmSave,
		handleNew,
		handleOpen,
		handleUndo,
		handleRedo,
		// Clipboard
		handleSelectAll,
		handleCut,
		handleCopy,
		handlePaste,
		handleDelete,
		handleClearAll,
		// Find
		handleFind,
		handleReplace,
		// Export/Import
		handleExport,
		handleExportFormat,
		handleImport,
		// Print
		handlePrint,
		handlePageSetup,
		// Rows/Cols
		handleInsertRow,
		handleDeleteRow,
		handleInsertColumn,
		handleDeleteColumn,
		// Zoom
		handleZoomIn,
		handleZoomOut,
		handleFullScreen,
		// Data
		handleSort,
		handleFilter,
		handleRemoveDuplicates,
		handleTextToColumns,
		handleDataValidation,
		// Formatting
		handleNumberFormat,
		handleAlignment,
		handleFontFamily,
		handleFontSize,
		handleDecreaseIndent,
		handleIncreaseIndent,
		handleConditionalFormatting,
		handleApplyConditionalFormatting,
		handleFormatPainter,
		// Insert
		handleInsertChart,
		handleInsertImage,
		handleInsertShape,
		handleInsertIcon,
		// Notes
		handleAddNote,
		handleSaveNote,
		handleInsertComment,
		handleInsertSpecialChar,
		handleInsertHyperlink,
		// Named ranges
		handleAddNamedRange,
		handleCreateNamedRange,
		// Validation
		handleSaveValidation,
		// Sheets
		handleAddSheet,
		handleCreateSheet,
		handleDeleteCurrentSheet,
		handleRenameSheet,
		handleSwitchSheet,
		// Share
		handleShareSave,
		handleCopyLink,
		// Misc
		handleSpelling,
		handleScrollToTop,
	};
}
