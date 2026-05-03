"use client";

import { EditorDialogs } from "@/components/editor/EditorDialogs";
import type { useEditorHandlers } from "@/hooks/use-editor-handlers";
import type { UseEditorStateReturn } from "@/hooks/use-editor-state";
import type { useSpreadsheet } from "@/hooks/use-spreadsheet";

interface EditorModalsSectionProps {
	handlers: ReturnType<typeof useEditorHandlers>;
	state: UseEditorStateReturn;
	spreadsheet: ReturnType<typeof useSpreadsheet>;
	id: string;
}

export function EditorModalsSection({
	handlers,
	state,
	spreadsheet,
	id,
}: EditorModalsSectionProps) {
	const { sheetNames, selectedCell } = spreadsheet;

	return (
		<EditorDialogs
			// Find & Replace
			showFindDialog={state.findDialog}
			setShowFindDialog={state.setShowFindDialog}
			findText={state.findText}
			setFindText={state.setFindText}
			replaceText={state.replaceText}
			setReplaceText={state.setReplaceText}
			matchCase={state.matchCase}
			setMatchCase={state.setMatchCase}
			wholeCell={state.wholeCell}
			setWholeCell={state.setWholeCell}
			handleFind={handlers.handleFind}
			handleReplace={handlers.handleReplace}
			// New Sheet
			showNewSheetDialog={state.newSheetDialog}
			setShowNewSheetDialog={state.setShowNewSheetDialog}
			newSheetName={state.newSheetName}
			setNewSheetName={state.setNewSheetName}
			sheetNames={sheetNames}
			handleCreateSheet={handlers.handleCreateSheet}
			// Named Range
			showNamedRangeDialog={state.namedRangeDialog}
			setShowNamedRangeDialog={state.setShowNamedRangeDialog}
			newRangeName={state.newRangeName}
			setNewRangeName={state.setNewRangeName}
			newRangeRef={state.newRangeRef}
			setNewRangeRef={state.setNewRangeRef}
			handleCreateNamedRange={handlers.handleCreateNamedRange}
			// Note
			showNoteDialog={state.noteDialog}
			setShowNoteDialog={state.setShowNoteDialog}
			cellNote={state.cellNote}
			setCellNote={state.setCellNote}
			selectedCell={selectedCell}
			handleSaveNote={handlers.handleSaveNote}
			// Validation
			showValidationDialog={state.validationDialog}
			setShowValidationDialog={state.setShowValidationDialog}
			validationType={state.validationType}
			setValidationType={state.setValidationType}
			validationMin={state.validationMin}
			setValidationMin={state.setValidationMin}
			validationMax={state.validationMax}
			setValidationMax={state.setValidationMax}
			validationList={state.validationList}
			setValidationList={state.setValidationList}
			validationRequired={state.validationRequired}
			setValidationRequired={state.setValidationRequired}
			handleSaveValidation={handlers.handleSaveValidation}
			// Export
			showExportDialog={state.exportDialog}
			setShowExportDialog={state.setShowExportDialog}
			handleExport={handlers.handleExport}
			// Import
			showImportDialog={state.importDialog}
			setShowImportDialog={state.setShowImportDialog}
			handleImport={handlers.handleImport}
			// Page Setup
			showPageSetupDialog={state.pageSetupDialog}
			setShowPageSetupDialog={state.setShowPageSetupDialog}
			handlePageSetup={handlers.handlePageSetup}
			// Print
			showPrintDialog={state.printDialog}
			setShowPrintDialog={state.setShowPrintDialog}
			handlePrint={handlers.handlePrint}
			// Clear Sheet
			showDeleteDialog={state.deleteDialog}
			setShowDeleteDialog={state.setShowDeleteDialog}
			handleClearAll={handlers.handleClearAll}
			// Chart
			showChartDialog={state.chartDialog}
			setShowChartDialog={state.setShowChartDialog}
			chartTitle={state.chartTitle}
			setChartTitle={state.setChartTitle}
			chartRange={state.chartRange}
			setChartRange={state.setChartRange}
			chartType={state.chartType}
			setChartType={state.setChartType}
			handleInsertChart={handlers.handleInsertChart}
			// Icon
			showIconDialog={state.iconDialog}
			setShowIconDialog={state.setShowIconDialog}
			iconName={state.iconName}
			setIconName={state.setIconName}
			handleInsertIcon={handlers.handleInsertIcon}
			// Shortcuts
			showShortcutsDialog={state.shortcutsDialog}
			setShowShortcutsDialog={state.setShowShortcutsDialog}
			// User Guide
			showUserGuideDialog={state.userGuideDialog}
			setShowUserGuideDialog={state.setShowUserGuideDialog}
			showAboutDialog={state.aboutDialog}
			setShowAboutDialog={(open) =>
				open
					? state.openDialog("aboutDialog")
					: state.closeDialog("aboutDialog")
			}
			showSaveDialog={state.saveDialog}
			setShowSaveDialog={state.setShowSaveDialog}
			handleSave={handlers.handleConfirmSave}
			sheetName={state.sheetName}
			setSheetName={state.setSheetName}
			// Additional
			showSpecialCharDialog={state.specialCharDialog}
			setShowSpecialCharDialog={state.setShowSpecialCharDialog}
			showHyperlinkDialog={state.hyperlinkDialog}
			setShowHyperlinkDialog={state.setShowHyperlinkDialog}
			showCommentDialog={state.commentDialog}
			setShowCommentDialog={state.setShowCommentDialog}
			showConditionalFormattingDialog={state.conditionalFormattingDialog}
			setShowConditionalFormattingDialog={
				state.setShowConditionalFormattingDialog
			}
			handleInsertSpecialChar={handlers.handleInsertSpecialChar}
			handleInsertHyperlink={handlers.handleInsertHyperlink}
			handleInsertComment={handlers.handleInsertComment}
			handleApplyConditionalFormatting={
				handlers.handleApplyConditionalFormatting
			}
			// Share
			showShareDialog={state.shareDialog}
			setShowShareDialog={state.setShowShareDialog}
			shareSettings={state.shareSettings}
			handleShareSave={handlers.handleShareSave}
			handleCopyLink={handlers.handleCopyLink}
			spreadsheetId={id}
		/>
	);
}
