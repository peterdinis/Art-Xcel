"use client";

import { useEffect, useReducer } from "react";
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
	// Editor field setters
	setSheetName: (v: string) => void;
	setZoom: (v: number | ((prev: number) => number)) => void;
	setShowFormulaBar: (v: boolean | ((p: boolean) => boolean)) => void;
	setShowStatusBar: (v: boolean | ((p: boolean) => boolean)) => void;
	setShowGrid: (v: boolean) => void;
	setShowHeaders: (v: boolean) => void;
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
				dispatchEditor({ type: "SET_FIELD", field: "showGrid", value: g === "true" });
			const h = localStorage.getItem("excel-editor-showHeaders");
			if (h !== null)
				dispatchEditor({ type: "SET_FIELD", field: "showHeaders", value: h === "true" });
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
	const openDialog = (dialog: DialogName) =>
		dispatchDialogs({ type: "OPEN", dialog });
	const closeDialog = (dialog: DialogName) =>
		dispatchDialogs({ type: "CLOSE", dialog });
	const toggleDialog = (dialog: DialogName) =>
		dispatchDialogs({ type: "TOGGLE", dialog });

	const mkDialog = (d: DialogName) => (open: boolean) =>
		open ? openDialog(d) : closeDialog(d);

	// ── Editor field helper ───────────────────────────────────────────────────
	const setField = <K extends keyof EditorState>(
		field: K,
		value: EditorState[K],
	) => dispatchEditor({ type: "SET_FIELD", field, value });

	const setZoom = (v: number | ((prev: number) => number)) =>
		dispatchEditor({
			type: "SET_ZOOM",
			value: typeof v === "function" ? v(editorState.zoom) : v,
		});

	const mkToggle =
		(field: keyof EditorState) =>
		(v: boolean | ((p: boolean) => boolean)) =>
			typeof v === "function"
				? dispatchEditor({ type: "TOGGLE_FIELD", field })
				: setField(field, v as boolean);

	return {
		// Dialogs state
		...dialogs,
		// Editor state
		...editorState,
		// Dialog actions
		openDialog,
		closeDialog,
		toggleDialog,
		setShowFindDialog: mkDialog("findDialog"),
		setShowPrintDialog: mkDialog("printDialog"),
		setShowPageSetupDialog: mkDialog("pageSetupDialog"),
		setShowExportDialog: mkDialog("exportDialog"),
		setShowImportDialog: mkDialog("importDialog"),
		setShowDeleteDialog: mkDialog("deleteDialog"),
		setShowNewSheetDialog: mkDialog("newSheetDialog"),
		setShowNamedRangeDialog: mkDialog("namedRangeDialog"),
		setShowValidationDialog: mkDialog("validationDialog"),
		setShowNoteDialog: mkDialog("noteDialog"),
		setShowInsertFunctionDialog: mkDialog("insertFunctionDialog"),
		setShowUserGuideDialog: mkDialog("userGuideDialog"),
		setShowShortcutsDialog: mkDialog("shortcutsDialog"),
		setShowSpecialCharDialog: mkDialog("specialCharDialog"),
		setShowHyperlinkDialog: mkDialog("hyperlinkDialog"),
		setShowCommentDialog: mkDialog("commentDialog"),
		setShowConditionalFormattingDialog: mkDialog("conditionalFormattingDialog"),
		setShowChartDialog: mkDialog("chartDialog"),
		setShowIconDialog: mkDialog("iconDialog"),
		// Editor field setters
		setSheetName: (v) => setField("sheetName", v),
		setZoom,
		setShowFormulaBar: mkToggle("showFormulaBar"),
		setShowStatusBar: mkToggle("showStatusBar"),
		setShowGrid: (v) => setField("showGrid", v),
		setShowHeaders: (v) => setField("showHeaders", v),
		setFreezePanes: mkToggle("freezePanes"),
		setIsLoading: (v) => setField("isLoading", v),
		setFormatPainter: (v) => setField("formatPainter", v),
		setFindText: (v) => setField("findText", v),
		setReplaceText: (v) => setField("replaceText", v),
		setMatchCase: (v) => setField("matchCase", v),
		setWholeCell: (v) => setField("wholeCell", v),
		setNewSheetName: (v) => setField("newSheetName", v),
		setNewRangeName: (v) => setField("newRangeName", v),
		setNewRangeRef: (v) => setField("newRangeRef", v),
		setCellNote: (v) => setField("cellNote", v),
		setValidationType: (v) => setField("validationType", v),
		setValidationMin: (v) => setField("validationMin", v),
		setValidationMax: (v) => setField("validationMax", v),
		setValidationList: (v) => setField("validationList", v),
		setValidationRequired: (v) => setField("validationRequired", v),
		setIconName: (v) => setField("iconName", v),
		setChartType: (v) => setField("chartType", v),
		setChartTitle: (v) => setField("chartTitle", v),
		setShareSettings: (v) => setField("shareSettings", v),
	};
}
