"use client";

import { useEffect, useReducer, useCallback } from "react";
import {
	DialogName,
	DialogsState,
	EditorState,
	dialogsReducer,
	editorReducer,
	initialDialogsState,
	initialEditorState,
} from "@/app/editor/[id]/editor-reducers";
import type { ShareSettings } from "@/components/shared/share-dialog";

export type EditorStateActions = {
	// Dialog helpers
	openDialog: (d: DialogName) => void;
	closeDialog: (d: DialogName) => void;
	toggleDialog: (d: DialogName) => void;
	setShowFindDialog: (v: boolean) => void;
	setShowPrintDialog: (v: boolean) => void;
	setShowPageSetupDialog: (v: boolean) => void;
	setShowExportDialog: (v: boolean) => void;
	setShowImportDialog: (v: boolean) => void;
	setShowDeleteDialog: (v: boolean) => void;
	setShowNewSheetDialog: (v: boolean) => void;
	setShowNamedRangeDialog: (v: boolean) => void;
	setShowValidationDialog: (v: boolean) => void;
	setShowNoteDialog: (v: boolean) => void;
	setShowInsertFunctionDialog: (v: boolean) => void;
	setShowUserGuideDialog: (v: boolean) => void;
	setShowShortcutsDialog: (v: boolean) => void;
	setShowSpecialCharDialog: (v: boolean) => void;
	setShowHyperlinkDialog: (v: boolean) => void;
	setShowCommentDialog: (v: boolean) => void;
	setShowConditionalFormattingDialog: (v: boolean) => void;
	setShowChartDialog: (v: boolean) => void;
	setShowIconDialog: (v: boolean) => void;
	setShowSaveDialog: (v: boolean) => void;
	setShowShareDialog: (v: boolean) => void;
	// Editor field setters
	setSheetName: (v: string) => void;
	setZoom: (v: number | ((prev: number) => number)) => void;
	setShowFormulaBar: (v: boolean | ((p: boolean) => boolean)) => void;
	setShowStatusBar: (v: boolean | ((p: boolean) => boolean)) => void;
	setShowGrid: (v: boolean) => void;
	setShowHeaders: (v: boolean) => void;
	setShowCommentsSidebar: (v: boolean | ((p: boolean) => boolean)) => void;
	setFreezePanes: (v: boolean | ((p: boolean) => boolean)) => void;
	setIsLoading: (v: boolean) => void;
	setFormatPainter: (v: EditorState["formatPainter"]) => void;
	setFindText: (v: string) => void;
	setReplaceText: (v: string) => void;
	setMatchCase: (v: boolean) => void;
	setWholeCell: (v: boolean) => void;
	setNewSheetName: (v: string) => void;
	setNewRangeName: (v: string) => void;
	setNewRangeRef: (v: string) => void;
	setCellNote: (v: string) => void;
	setValidationType: (v: EditorState["validationType"]) => void;
	setValidationMin: (v: number) => void;
	setValidationMax: (v: number) => void;
	setValidationList: (v: string) => void;
	setValidationRequired: (v: boolean) => void;
	setIconName: (v: string) => void;
	setChartType: (v: EditorState["chartType"]) => void;
	setChartTitle: (v: string) => void;
	setChartRange: (v: string) => void;
	setShareSettings: (v: ShareSettings) => void;
};

export type UseEditorStateReturn = EditorState &
	DialogsState &
	EditorStateActions;

export function useEditorState(): UseEditorStateReturn {
	const [dialogs, dispatchDialogs] = useReducer(
		dialogsReducer,
		initialDialogsState,
	);
	const [editorState, dispatchEditor] = useReducer(
		editorReducer,
		initialEditorState,
	);

	// Apply saved preferences from localStorage on mount
	useEffect(() => {
		try {
			const g = localStorage.getItem("excel-editor-showGrid");
			if (g !== null)
				dispatchEditor({
					type: "SET_FIELD",
					field: "showGrid",
					value: g === "true",
				});
			const h = localStorage.getItem("excel-editor-showHeaders");
			if (h !== null)
				dispatchEditor({
					type: "SET_FIELD",
					field: "showHeaders",
					value: h === "true",
				});
			const z = localStorage.getItem("excel-editor-defaultZoom");
			if (z !== null) {
				const n = parseInt(z, 10);
				if (!isNaN(n) && n >= 50 && n <= 200)
					dispatchEditor({ type: "SET_ZOOM", value: n });
			}
		} catch {
			// ignore
		}
	}, []);

	// ── Dialog helpers ─────────────────────────────────────────────────────────
	const openDialog = useCallback(
		(dialog: DialogName) => dispatchDialogs({ type: "OPEN", dialog }),
		[],
	);

	const closeDialog = useCallback(
		(dialog: DialogName) => dispatchDialogs({ type: "CLOSE", dialog }),
		[],
	);

	const toggleDialog = useCallback(
		(dialog: DialogName) => dispatchDialogs({ type: "TOGGLE", dialog }),
		[],
	);

	const mkDialog = useCallback(
		(d: DialogName) => (open: boolean) =>
			open ? openDialog(d) : closeDialog(d),
		[openDialog, closeDialog],
	);

	// ── Editor field helper ───────────────────────────────────────────────────
	const setField = useCallback(
		<K extends keyof EditorState>(field: K, value: EditorState[K]) =>
			dispatchEditor({ type: "SET_FIELD", field, value }),
		[],
	);

	const setZoom = useCallback(
		(v: number | ((prev: number) => number)) =>
			dispatchEditor({
				type: "SET_ZOOM",
				value: typeof v === "function" ? v(editorState.zoom) : v,
			}),
		[editorState.zoom],
	);

	const mkToggle = useCallback(
		(field: keyof EditorState) => (v: boolean | ((p: boolean) => boolean)) =>
			typeof v === "function"
				? dispatchEditor({ type: "TOGGLE_FIELD", field })
				: setField(field, v as boolean),
		[setField],
	);

	// Memoize all dialog setters
	const setShowFindDialog = useCallback(mkDialog("findDialog"), [mkDialog]);
	const setShowPrintDialog = useCallback(mkDialog("printDialog"), [mkDialog]);
	const setShowPageSetupDialog = useCallback(mkDialog("pageSetupDialog"), [
		mkDialog,
	]);
	const setShowExportDialog = useCallback(mkDialog("exportDialog"), [mkDialog]);
	const setShowImportDialog = useCallback(mkDialog("importDialog"), [mkDialog]);
	const setShowDeleteDialog = useCallback(mkDialog("deleteDialog"), [mkDialog]);
	const setShowNewSheetDialog = useCallback(mkDialog("newSheetDialog"), [
		mkDialog,
	]);
	const setShowNamedRangeDialog = useCallback(mkDialog("namedRangeDialog"), [
		mkDialog,
	]);
	const setShowValidationDialog = useCallback(mkDialog("validationDialog"), [
		mkDialog,
	]);
	const setShowNoteDialog = useCallback(mkDialog("noteDialog"), [mkDialog]);
	const setShowInsertFunctionDialog = useCallback(
		mkDialog("insertFunctionDialog"),
		[mkDialog],
	);
	const setShowUserGuideDialog = useCallback(mkDialog("userGuideDialog"), [
		mkDialog,
	]);
	const setShowShortcutsDialog = useCallback(mkDialog("shortcutsDialog"), [
		mkDialog,
	]);
	const setShowSpecialCharDialog = useCallback(mkDialog("specialCharDialog"), [
		mkDialog,
	]);
	const setShowHyperlinkDialog = useCallback(mkDialog("hyperlinkDialog"), [
		mkDialog,
	]);
	const setShowCommentDialog = useCallback(mkDialog("commentDialog"), [
		mkDialog,
	]);
	const setShowConditionalFormattingDialog = useCallback(
		mkDialog("conditionalFormattingDialog"),
		[mkDialog],
	);
	const setShowChartDialog = useCallback(mkDialog("chartDialog"), [mkDialog]);
	const setShowIconDialog = useCallback(mkDialog("iconDialog"), [mkDialog]);
	const setShowSaveDialog = useCallback(mkDialog("saveDialog"), [mkDialog]);
	const setShowShareDialog = useCallback(mkDialog("shareDialog"), [mkDialog]);

	// Memoize editor field setters
	const setSheetName = useCallback(
		(v: string) => setField("sheetName", v),
		[setField],
	);
	const setShowGrid = useCallback(
		(v: boolean) => setField("showGrid", v),
		[setField],
	);
	const setShowHeaders = useCallback(
		(v: boolean) => setField("showHeaders", v),
		[setField],
	);
	const setIsLoading = useCallback(
		(v: boolean) => setField("isLoading", v),
		[setField],
	);
	const setFormatPainter = useCallback(
		(v: EditorState["formatPainter"]) => setField("formatPainter", v),
		[setField],
	);
	const setFindText = useCallback(
		(v: string) => setField("findText", v),
		[setField],
	);
	const setReplaceText = useCallback(
		(v: string) => setField("replaceText", v),
		[setField],
	);
	const setMatchCase = useCallback(
		(v: boolean) => setField("matchCase", v),
		[setField],
	);
	const setWholeCell = useCallback(
		(v: boolean) => setField("wholeCell", v),
		[setField],
	);
	const setNewSheetName = useCallback(
		(v: string) => setField("newSheetName", v),
		[setField],
	);
	const setNewRangeName = useCallback(
		(v: string) => setField("newRangeName", v),
		[setField],
	);
	const setNewRangeRef = useCallback(
		(v: string) => setField("newRangeRef", v),
		[setField],
	);
	const setCellNote = useCallback(
		(v: string) => setField("cellNote", v),
		[setField],
	);
	const setValidationType = useCallback(
		(v: EditorState["validationType"]) => setField("validationType", v),
		[setField],
	);
	const setValidationMin = useCallback(
		(v: number) => setField("validationMin", v),
		[setField],
	);
	const setValidationMax = useCallback(
		(v: number) => setField("validationMax", v),
		[setField],
	);
	const setValidationList = useCallback(
		(v: string) => setField("validationList", v),
		[setField],
	);
	const setValidationRequired = useCallback(
		(v: boolean) => setField("validationRequired", v),
		[setField],
	);
	const setIconName = useCallback(
		(v: string) => setField("iconName", v),
		[setField],
	);
	const setChartType = useCallback(
		(v: EditorState["chartType"]) => setField("chartType", v),
		[setField],
	);
	const setChartTitle = useCallback(
		(v: string) => setField("chartTitle", v),
		[setField],
	);
	const setChartRange = useCallback(
		(v: string) => setField("chartRange", v),
		[setField],
	);
	const setShareSettings = useCallback(
		(v: ShareSettings) => setField("shareSettings", v),
		[setField],
	);

	const setShowFormulaBar = useCallback(mkToggle("showFormulaBar"), [mkToggle]);
	const setShowStatusBar = useCallback(mkToggle("showStatusBar"), [mkToggle]);
	const setFreezePanes = useCallback(mkToggle("freezePanes"), [mkToggle]);
	const setShowCommentsSidebar = useCallback(mkToggle("showCommentsSidebar"), [
		mkToggle,
	]);

	return {
		// Dialogs state
		...dialogs,
		// Editor state
		...editorState,
		// Dialog actions
		openDialog,
		closeDialog,
		toggleDialog,
		setShowFindDialog,
		setShowPrintDialog,
		setShowPageSetupDialog,
		setShowExportDialog,
		setShowImportDialog,
		setShowDeleteDialog,
		setShowNewSheetDialog,
		setShowNamedRangeDialog,
		setShowValidationDialog,
		setShowNoteDialog,
		setShowInsertFunctionDialog,
		setShowUserGuideDialog,
		setShowShortcutsDialog,
		setShowSpecialCharDialog,
		setShowHyperlinkDialog,
		setShowCommentDialog,
		setShowConditionalFormattingDialog,
		setShowChartDialog,
		setShowIconDialog,
		setShowSaveDialog,
		setShowShareDialog,
		// Editor field setters
		setSheetName,
		setZoom,
		setShowFormulaBar,
		setShowStatusBar,
		setShowGrid,
		setShowHeaders,
		setShowCommentsSidebar,
		setFreezePanes,
		setIsLoading,
		setFormatPainter,
		setFindText,
		setReplaceText,
		setMatchCase,
		setWholeCell,
		setNewSheetName,
		setNewRangeName,
		setNewRangeRef,
		setCellNote,
		setValidationType,
		setValidationMin,
		setValidationMax,
		setValidationList,
		setValidationRequired,
		setIconName,
		setChartType,
		setChartTitle,
		setChartRange,
		setShareSettings,
	};
}
