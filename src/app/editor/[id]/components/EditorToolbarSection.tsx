"use client";

import { ClassicToolbar } from "@/components/editor/ClassicToolbar";
import type { useEditorHandlers } from "@/hooks/use-editor-handlers";
import type { UseEditorStateReturn } from "@/hooks/use-editor-state";

interface EditorToolbarSectionProps {
	handlers: ReturnType<typeof useEditorHandlers>;
	state: UseEditorStateReturn;
}

export function EditorToolbarSection({ handlers, state }: EditorToolbarSectionProps) {
	return (
		<ClassicToolbar
			onSave={handlers.handleSave}
			onNew={handlers.handleNew}
			onOpen={handlers.handleOpen}
			onUndo={handlers.handleUndo}
			onRedo={handlers.handleRedo}
			onExport={() => handlers.handleExport("xlsx")}
			onExportFormat={handlers.handleExportFormat}
			onImport={handlers.handleImport}
			onClear={() => state.setShowDeleteDialog(true)}
			onStyleChange={handlers.handleStyleChange as any}
			onInsertRow={handlers.handleInsertRow}
			onDeleteRow={handlers.handleDeleteRow}
			onInsertColumn={handlers.handleInsertColumn}
			onDeleteColumn={handlers.handleDeleteColumn}
			onSort={(dir) => handlers.handleSort(dir)}
			onFilter={handlers.handleFilter}
			onFind={() => state.setShowFindDialog(true)}
			onDataValidation={handlers.handleDataValidation}
			onRemoveDuplicates={handlers.handleRemoveDuplicates}
			onTextToColumns={handlers.handleTextToColumns}
			onInsertChart={() => state.setShowChartDialog(true)}
			onInsertImage={handlers.handleInsertImage}
			onInsertShape={handlers.handleInsertShape}
			onInsertIcon={() => state.setShowIconDialog(true)}
			onOpenInsertFunctionDialog={() => state.setShowInsertFunctionDialog(true)}
			onScrollToTop={handlers.handleScrollToTop}
			onPrint={handlers.handlePrint}
			onCut={handlers.handleCut}
			onCopy={handlers.handleCopy}
			onPaste={handlers.handlePaste}
			onSelectAll={handlers.handleSelectAll}
			onToggleFormulaBar={() => state.setShowFormulaBar((p) => !p)}
			onToggleStatusBar={() => state.setShowStatusBar((p) => !p)}
			onToggleGrid={() => state.setShowGrid(!state.showGrid)}
			onToggleHeaders={() => state.setShowHeaders(!state.showHeaders)}
			onToggleFreezePanes={() => state.setFreezePanes((p) => !p)}
			onToggleFullScreen={handlers.handleFullScreen}
			onNumberFormatChange={handlers.handleNumberFormat}
			onInsertComment={() => state.setShowCommentDialog(true)}
			onFormatPainter={handlers.handleFormatPainter}
			onFontFamilyChange={handlers.handleFontFamily}
			onFontSizeChange={handlers.handleFontSize}
			onFontColorPick={(color) => handlers.handleStyleChange({ color })}
			onBackgroundColorPick={(color) => handlers.handleStyleChange({ backgroundColor: color })}
			onDecreaseIndent={handlers.handleDecreaseIndent}
			onIncreaseIndent={handlers.handleIncreaseIndent}
			onInsertSpecialChar={() => state.setShowSpecialCharDialog(true)}
			onInsertHyperlink={() => state.setShowHyperlinkDialog(true)}
			onSpelling={handlers.handleSpelling}
			onConditionalFormatting={handlers.handleConditionalFormatting}
			onUserGuides={() => state.setShowUserGuideDialog(true)}
			onShortcuts={() => state.setShowShortcutsDialog(true)}
			onAbout={() => state.openDialog("aboutDialog")}
		/>
	);
}
