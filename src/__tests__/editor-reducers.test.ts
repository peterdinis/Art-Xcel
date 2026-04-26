import { describe, it, expect } from "vitest";
import {
	dialogsReducer,
	editorReducer,
	initialDialogsState,
	initialEditorState,
} from "../app/editor/[id]/editor-reducers";

describe("Editor Reducers", () => {
	describe("dialogsReducer", () => {
		it("should open a dialog", () => {
			const state = dialogsReducer(initialDialogsState, {
				type: "OPEN",
				dialog: "findDialog",
			});
			expect(state.findDialog).toBe(true);
			expect(state.printDialog).toBe(false);
		});

		it("should close a dialog", () => {
			const openedState = { ...initialDialogsState, findDialog: true };
			const state = dialogsReducer(openedState, {
				type: "CLOSE",
				dialog: "findDialog",
			});
			expect(state.findDialog).toBe(false);
		});

		it("should toggle a dialog", () => {
			let state = dialogsReducer(initialDialogsState, {
				type: "TOGGLE",
				dialog: "chartDialog",
			});
			expect(state.chartDialog).toBe(true);

			state = dialogsReducer(state, {
				type: "TOGGLE",
				dialog: "chartDialog",
			});
			expect(state.chartDialog).toBe(false);
		});
	});

	describe("editorReducer", () => {
		it("should set a field value", () => {
			const state = editorReducer(initialEditorState, {
				type: "SET_FIELD",
				field: "sheetName",
				value: "My New Sheet",
			});
			expect(state.sheetName).toBe("My New Sheet");
		});

		it("should toggle a boolean field", () => {
			const state = editorReducer(initialEditorState, {
				type: "TOGGLE_FIELD",
				field: "showGrid",
			});
			// initial showGrid is true
			expect(state.showGrid).toBe(false);

			const state2 = editorReducer(state, {
				type: "TOGGLE_FIELD",
				field: "showGrid",
			});
			expect(state2.showGrid).toBe(true);
		});

		it("should set zoom level", () => {
			const state = editorReducer(initialEditorState, {
				type: "SET_ZOOM",
				value: 150,
			});
			expect(state.zoom).toBe(150);
		});

		it("should handle complex field updates (formatPainter)", () => {
			const painter = {
				style: { bold: true },
				sourceCellId: "A1",
				isActive: true,
			};
			const state = editorReducer(initialEditorState, {
				type: "SET_FIELD",
				field: "formatPainter",
				value: painter,
			});
			expect(state.formatPainter).toEqual(painter);
		});
	});
});
