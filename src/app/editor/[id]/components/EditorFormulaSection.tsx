"use client";

import { FormulaBar } from "@/components/editor/FormulaBar";
import { InsertFunctionDialog } from "@/components/editor/InsertFunctionDialog";
import { toast } from "sonner";
import type { useEditorHandlers } from "@/hooks/use-editor-handlers";
import type { UseEditorStateReturn } from "@/hooks/use-editor-state";
import type { useSpreadsheet } from "@/hooks/use-spreadsheet";

interface EditorFormulaSectionProps {
	handlers: ReturnType<typeof useEditorHandlers>;
	state: UseEditorStateReturn;
	spreadsheet: ReturnType<typeof useSpreadsheet>;
}

export function EditorFormulaSection({
	handlers,
	state,
	spreadsheet,
}: EditorFormulaSectionProps) {
	const { selectedCell, getCellFormula, getCellValue, data, updateCell } =
		spreadsheet;
	const { insertFunctionDialog, setShowInsertFunctionDialog } = state;
	const { showFormulaBar } = state;

	if (!showFormulaBar)
		return (
			<InsertFunctionDialog
				open={insertFunctionDialog}
				onOpenChange={setShowInsertFunctionDialog}
				currentFormula={selectedCell ? getCellFormula(selectedCell) : ""}
				onInsert={(_, template) => {
					if (selectedCell) {
						updateCell(selectedCell, template);
						toast.success("Function inserted");
					}
				}}
			/>
		);

	return (
		<>
			<FormulaBar
				selectedCell={selectedCell}
				value={selectedCell ? getCellFormula(selectedCell) : ""}
				onChange={handlers.handleFormulaBarChange}
				onInsertFunctionClick={() => setShowInsertFunctionDialog(true)}
				previewValue={
					selectedCell && data[selectedCell]?.formula?.startsWith("=")
						? getCellValue(selectedCell)
						: undefined
				}
			/>
			<InsertFunctionDialog
				open={insertFunctionDialog}
				onOpenChange={setShowInsertFunctionDialog}
				currentFormula={selectedCell ? getCellFormula(selectedCell) : ""}
				onInsert={(_, template) => {
					if (selectedCell) {
						updateCell(selectedCell, template);
						toast.success("Function inserted");
					}
				}}
			/>
		</>
	);
}
