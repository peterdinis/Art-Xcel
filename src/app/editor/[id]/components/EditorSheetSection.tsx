"use client";

import { SheetTabs } from "@/components/editor/SheetTabs";
import { StatusBar } from "@/components/editor/StatusBar";
import { FloatingQuickMenu } from "@/components/editor/FloatingQuickMenu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { useEditorHandlers } from "@/hooks/use-editor-handlers";
import type { UseEditorStateReturn } from "@/hooks/use-editor-state";
import type { useSpreadsheet } from "@/hooks/use-spreadsheet";

interface EditorSheetSectionProps {
	handlers: ReturnType<typeof useEditorHandlers>;
	state: UseEditorStateReturn;
	spreadsheet: ReturnType<typeof useSpreadsheet>;
}

export function EditorSheetSection({ handlers, state, spreadsheet }: EditorSheetSectionProps) {
	const router = useRouter();
	const {
		sheetNames,
		currentSheetIndex,
		deleteSheet,
		data,
		selectedCell,
		selectionRange,
	} = spreadsheet;
	const { showStatusBar, zoom, setZoom, showGrid } = state;

	return (
		<>
			{/* Sheet Tabs */}
			<SheetTabs
				sheetNames={sheetNames}
				currentSheetIndex={currentSheetIndex}
				onSwitchSheet={handlers.handleSwitchSheet}
				onAddSheet={handlers.handleAddSheet}
				onRenameSheet={handlers.handleRenameSheet}
				onDeleteSheet={(index) => {
					if (index === currentSheetIndex) {
						if (index > 0) handlers.handleSwitchSheet(index - 1);
						else if (sheetNames.length > 1) handlers.handleSwitchSheet(1);
					}
					deleteSheet(index);
					toast.success("Sheet deleted");
				}}
			/>

			{/* Status Bar */}
			{showStatusBar && (
				<StatusBar
					data={data}
					selectedCell={selectedCell}
					selectionRange={selectionRange}
					zoom={zoom}
					onZoomChange={setZoom}
				/>
			)}

			<FloatingQuickMenu
				onSave={handlers.handleSave}
				onUndo={handlers.handleUndo}
				onRedo={handlers.handleRedo}
				onHelp={() => state.setShowUserGuideDialog(true)}
				onSettings={() => toast.info("Settings coming soon")}
				onExport={() => state.setShowExportDialog(true)}
				onImport={() => state.setShowImportDialog(true)}
				onNew={() => {
					toast.info("Creating new spreadsheet...");
					setTimeout(() => window.location.reload(), 1000);
				}}
				onDelete={() => state.setShowDeleteDialog(true)}
				onPrint={handlers.handlePrint}
				onShare={() => toast.info("Opening share settings...")}
				onCopy={handlers.handleCopy}
				onCut={handlers.handleCut}
				onPaste={handlers.handlePaste}
				onZoomIn={handlers.handleZoomIn}
				onZoomOut={handlers.handleZoomOut}
				onToggleGrid={() => state.setShowGrid(!showGrid)}
				onSelectAll={handlers.handleSelectAll}
				onDashboard={() => router.push("/")}
				showExtraOptions={true}
			/>
		</>
	);
}
