"use client";

import { useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";
import { useExcelService } from "@/hooks/use-excel-service";
import { useSpreadsheetDB } from "@/hooks/use-spreadsheet-db";
import { useEditorState } from "@/hooks/use-editor-state";
import { useEditorHandlers } from "@/hooks/use-editor-handlers";
import { GridHandle } from "@/components/editor/Grid";
import { toast } from "sonner";
import { FileSpreadsheet } from "lucide-react";
import { EditorSkeleton } from "./components/EditorSkeleton";
import { EditorToolbarSection } from "./components/EditorToolbarSection";
import { EditorFormulaSection } from "./components/EditorFormulaSection";
import { EditorGridSection } from "./components/EditorGridSection";
import { EditorSheetSection } from "./components/EditorSheetSection";
import { EditorModalsSection } from "./components/EditorModalsSection";

export default function EditorContent() {
	const { id } = useParams();
	const router = useRouter();
	const gridRef = useRef<GridHandle>(null);

	// Custom Hooks
	const db = useSpreadsheetDB();
	const spreadsheet = useSpreadsheet();
	const excelService = useExcelService();
	const state = useEditorState();

	// Handlers bridge
	const handlers = useEditorHandlers({
		id: id as string,
		router,
		gridRef,
		spreadsheet,
		excelService,
		state,
		db,
	});

	const { setData } = spreadsheet;
	const { setIsLoading, setSheetName, setShareSettings } = state;

	// 1. Initial Load from IndexedDB (with migration)
	useEffect(() => {
		if (!db.isReady) return;

		const loadData = async () => {
			try {
				setIsLoading(true);
				// Simulate slight delay for premium feel
				await new Promise((resolve) => setTimeout(resolve, 500));

				const record = await db.loadSpreadsheet(id as string);
				if (record) {
					setSheetName(record.name);
					if (record.data) setData(record.data);
					if (record.shareSettings) setShareSettings(record.shareSettings);

					toast.success(`Welcome back to "${record.name}"`, {
						icon: <FileSpreadsheet className="h-4 w-4" />,
						duration: 3000,
					});
				} else {
					toast.success("Welcome to your new spreadsheet!", {
						duration: 4000,
					});
				}
			} catch (e) {
				console.error("Load error:", e);
				toast.error("Failed to load spreadsheet");
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [id, db.isReady, setData, setIsLoading, setSheetName, setShareSettings, db.loadSpreadsheet]);

	// 2. Auto-save to IndexedDB
	useEffect(() => {
		if (state.isLoading || !db.isReady) return;

		const timer = setTimeout(async () => {
			try {
				await db.saveSpreadsheet({
					id: id as string,
					name: state.sheetName,
					data: spreadsheet.data,
					shareSettings: state.shareSettings,
					lastModified: Date.now(),
				});
			} catch (e) {
				console.error("Auto-save error:", e);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [spreadsheet.data, state.sheetName, state.shareSettings, state.isLoading, id, db.isReady, db.saveSpreadsheet]);

	if (state.isLoading) {
		return <EditorSkeleton />;
	}

	return (
		<div className="h-screen flex flex-col font-sans overflow-hidden bg-background">
			<EditorToolbarSection handlers={handlers} state={state} />
			<EditorFormulaSection handlers={handlers} state={state} spreadsheet={spreadsheet} />
			<EditorGridSection gridRef={gridRef} handlers={handlers} state={state} spreadsheet={spreadsheet} />
			<EditorSheetSection handlers={handlers} state={state} spreadsheet={spreadsheet} />
			<EditorModalsSection handlers={handlers} state={state} spreadsheet={spreadsheet} />
		</div>
	);
}
