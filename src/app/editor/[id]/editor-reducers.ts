import { ShareSettings } from "@/components/shared/share-dialog";

export type DialogName =
	| "findDialog"
	| "printDialog"
	| "pageSetupDialog"
	| "exportDialog"
	| "importDialog"
	| "deleteDialog"
	| "newSheetDialog"
	| "namedRangeDialog"
	| "validationDialog"
	| "noteDialog"
	| "insertFunctionDialog"
	| "userGuideDialog"
	| "shortcutsDialog"
	| "specialCharDialog"
	| "hyperlinkDialog"
	| "commentDialog"
	| "conditionalFormattingDialog"
	| "chartDialog"
	| "imageDialog"
	| "shapeDialog"
	| "iconDialog";

export type DialogsState = Record<DialogName, boolean>;

export type DialogsAction =
	| { type: "OPEN"; dialog: DialogName }
	| { type: "CLOSE"; dialog: DialogName }
	| { type: "TOGGLE"; dialog: DialogName };

export const initialDialogsState: DialogsState = {
	findDialog: false,
	printDialog: false,
	pageSetupDialog: false,
	exportDialog: false,
	importDialog: false,
	deleteDialog: false,
	newSheetDialog: false,
	namedRangeDialog: false,
	validationDialog: false,
	noteDialog: false,
	insertFunctionDialog: false,
	userGuideDialog: false,
	shortcutsDialog: false,
	specialCharDialog: false,
	hyperlinkDialog: false,
	commentDialog: false,
	conditionalFormattingDialog: false,
	chartDialog: false,
	imageDialog: false,
	shapeDialog: false,
	iconDialog: false,
};

export function dialogsReducer(
	state: DialogsState,
	action: DialogsAction,
): DialogsState {
	switch (action.type) {
		case "OPEN":
			return { ...state, [action.dialog]: true };
		case "CLOSE":
			return { ...state, [action.dialog]: false };
		case "TOGGLE":
			return { ...state, [action.dialog]: !state[action.dialog] };
		default:
			return state;
	}
}

// ── Editor State Reducer ─────────────────────────────────────────────────────

export type EditorState = {
	sheetName: string;
	zoom: number;
	showFormulaBar: boolean;
	showStatusBar: boolean;
	showGrid: boolean;
	showHeaders: boolean;
	freezePanes: boolean;
	isLoading: boolean;
	formatPainter: {
		style: Record<string, unknown>;
		sourceCellId: string;
		isActive: boolean;
	} | null;
	findText: string;
	replaceText: string;
	matchCase: boolean;
	wholeCell: boolean;
	newSheetName: string;
	newRangeName: string;
	newRangeRef: string;
	cellNote: string;
	validationType: "number" | "text" | "list" | "date";
	validationMin: number;
	validationMax: number;
	validationList: string;
	validationRequired: boolean;
	iconName: string;
	shapeType: "rectangle" | "circle" | "line";
	chartType: "bar" | "line" | "pie";
	chartTitle: string;
	shareSettings: ShareSettings;
};

export type EditorAction =
	| { type: "SET_FIELD"; field: keyof EditorState; value: unknown }
	| { type: "TOGGLE_FIELD"; field: keyof EditorState }
	| { type: "SET_ZOOM"; value: number };

export const initialEditorState: EditorState = {
	sheetName: "Untitled Spreadsheet",
	zoom: 100,
	showFormulaBar: true,
	showStatusBar: true,
	showGrid: true,
	showHeaders: true,
	freezePanes: false,
	isLoading: true,
	formatPainter: null,
	findText: "",
	replaceText: "",
	matchCase: false,
	wholeCell: false,
	newSheetName: "",
	newRangeName: "",
	newRangeRef: "",
	cellNote: "",
	validationType: "number",
	validationMin: 0,
	validationMax: 100,
	validationList: "",
	validationRequired: false,
	iconName: "Activity",
	shapeType: "rectangle",
	chartType: "bar",
	chartTitle: "New Chart",
	shareSettings: {
		accessLevel: "private",
		linkPermission: "view",
		collaborators: [],
		expiryDate: null,
		password: null,
	},
};

export function editorReducer(
	state: EditorState,
	action: EditorAction,
): EditorState {
	switch (action.type) {
		case "SET_FIELD":
			return { ...state, [action.field]: action.value };
		case "TOGGLE_FIELD":
			return {
				...state,
				[action.field]: !state[action.field as keyof EditorState],
			};
		case "SET_ZOOM":
			return { ...state, zoom: action.value };
		default:
			return state;
	}
}
