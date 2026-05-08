"use client";

import { Grid, GridHandle } from "@/components/editor/Grid";
import { RefObject } from "react";
import type { useEditorHandlers } from "@/hooks/use-editor-handlers";
import type { UseEditorStateReturn } from "@/hooks/use-editor-state";
import type { useSpreadsheet } from "@/hooks/use-spreadsheet";

interface EditorGridSectionProps {
	gridRef: RefObject<GridHandle | null>;
	handlers: ReturnType<typeof useEditorHandlers>;
	state: UseEditorStateReturn;
	spreadsheet: ReturnType<typeof useSpreadsheet>;
}

export function EditorGridSection({
	gridRef,
	handlers,
	state,
	spreadsheet,
}: EditorGridSectionProps) {
	const {
		data,
		selectedCell,
		selectionRange,
		selectRange,
		insertRow,
		deleteRow,
		insertColumn,
		deleteColumn,
		updateCell,
		charts,
		images,
		updateChart,
		updateImage,
		removeChart,
		removeImage,
		shapes,
		icons,
		removeShape,
		removeIcon,
		updateShape,
		updateIcon,
	} = spreadsheet;
	const { showGrid, showHeaders, freezePanes, zoom } = state;

	return (
		<div className="flex-1 overflow-hidden relative">
			<Grid
				ref={gridRef}
				data={data}
				selectedCell={selectedCell}
				selectionRange={selectionRange}
				onSelectCell={handlers.handleSelectCell}
				onSelectRange={selectRange}
				onCellChange={handlers.handleCellChange}
				showGrid={showGrid}
				showHeaders={showHeaders}
				freezePanes={freezePanes}
				zoom={zoom}
				onCopy={handlers.handleCopy}
				onCut={handlers.handleCut}
				onPaste={handlers.handlePaste}
				onInsertRow={insertRow}
				onDeleteRow={deleteRow}
				onInsertColumn={(idx) => insertColumn(idx)}
				onDeleteColumn={(idx) => deleteColumn(idx)}
				onClearCell={(id) => updateCell(id, "")}
				charts={charts}
				images={images}
				onUpdateChart={updateChart}
				onUpdateImage={updateImage}
				onRemoveChart={removeChart}
				onRemoveImage={removeImage}
				shapes={shapes}
				icons={icons}
				onRemoveShape={removeShape}
				onRemoveIcon={removeIcon}
				onUpdateShape={updateShape}
				onUpdateIcon={updateIcon}
				onStyleChange={handlers.handleStyleChange}
				onUndo={handlers.handleUndo}
				onRedo={handlers.handleRedo}
				onInsertComment={() => state.setShowCommentDialog(true)}
				onInsertHyperlink={() => state.setShowHyperlinkDialog(true)}
				onFillDown={handlers.handleFillDown}
				onFillRight={handlers.handleFillRight}
			/>
		</div>
	);
}
