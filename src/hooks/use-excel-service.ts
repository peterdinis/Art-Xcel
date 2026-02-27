import { useCallback } from "react";
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import { SheetData, CellData } from "./use-spreadsheet";

export const useExcelService = () => {
	const exportToFile = useCallback(
		async (data: SheetData, sheetName: string, format: "xlsx" | "ods") => {
			if (format === "xlsx") {
				const workbook = new ExcelJS.Workbook();
				const worksheet = workbook.addWorksheet(sheetName);

				// Convert your data structure to Excel format
				const rows = new Map<number, Map<number, CellData>>();

				// Organize data by row and column
				Object.entries(data).forEach(([cellId, cellData]) => {
					const col = cellId.charCodeAt(0) - 65; // A=0, B=1, etc.
					const row = parseInt(cellId.slice(1)) - 1;

					if (!rows.has(row)) {
						rows.set(row, new Map());
					}
					rows.get(row)!.set(col, cellData);
				});

				// Fill worksheet with data and styles
				rows.forEach((rowData, rowIndex) => {
					const excelRow = worksheet.getRow(rowIndex + 1);

					rowData.forEach((cellData, colIndex) => {
						const cell = excelRow.getCell(colIndex + 1);

						// Set value (handle formulas)
						if (cellData.formula?.startsWith("=")) {
							cell.value = { formula: cellData.formula.substring(1) };
						} else {
							cell.value = cellData.value || "";
						}

						// Apply styles
						if (cellData.style) {
							// Font styles
							if (
								cellData.style.bold ||
								cellData.style.italic ||
								cellData.style.underline ||
								cellData.style.color
							) {
								cell.font = {
									bold: cellData.style.bold,
									italic: cellData.style.italic,
									underline: cellData.style.underline,
									color: cellData.style.color
										? { argb: cellData.style.color.replace("#", "") }
										: undefined,
								};
							}

							// Fill/Background color
							if (cellData.style.backgroundColor) {
								cell.fill = {
									type: "pattern",
									pattern: "solid",
									fgColor: {
										argb: cellData.style.backgroundColor.replace("#", ""),
									},
								};
							}

							// Alignment
							if (cellData.style.align) {
								cell.alignment = {
									horizontal: cellData.style.align as "left" | "center" | "right",
								};
							}
						}
					});

					excelRow.commit();
				});

				// Auto-fit columns
				worksheet.columns.forEach((column) => {
					column.width = 15;
				});

				// Generate and download file
				const buffer = await workbook.xlsx.writeBuffer();
				const blob = new Blob([buffer], {
					type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				});
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `${sheetName || "spreadsheet"}.xlsx`;
				link.click();
				window.URL.revokeObjectURL(url);
			} else if (format === "ods") {
				// Header mapping
				const sheetArray: any[][] = [];
				const cells = Object.entries(data);

				// Find max bounds
				let maxCol = 0;
				let maxRow = 0;
				cells.forEach(([cellId]) => {
					const col = cellId.charCodeAt(0) - 65;
					const row = parseInt(cellId.slice(1)) - 1;
					maxCol = Math.max(maxCol, col);
					maxRow = Math.max(maxRow, row);
				});

				// Initialize array
				for (let r = 0; r <= maxRow; r++) {
					sheetArray[r] = new Array(maxCol + 1).fill("");
				}

				// Fill data (SheetJS handles simpler data structures better for ODS)
				cells.forEach(([cellId, cellData]) => {
					const col = cellId.charCodeAt(0) - 65;
					const row = parseInt(cellId.slice(1)) - 1;
					// For ODS output via xlsx, we use simple values for now
					sheetArray[row][col] = cellData.formula || cellData.value || "";
				});

				const wb = XLSX.utils.book_new();
				const ws = XLSX.utils.aoa_to_sheet(sheetArray);
				XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");

				const odsBuffer = XLSX.write(wb, { type: "array", bookType: "ods" });
				const blob = new Blob([odsBuffer], { type: "application/vnd.oasis.opendocument.spreadsheet" });
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `${sheetName || "spreadsheet"}.ods`;
				link.click();
				window.URL.revokeObjectURL(url);
			}
		},
		[],
	);

	const importFromFile = useCallback(
		async (file: File): Promise<{ data: SheetData; name: string }> => {
			const extension = file.name.split(".").pop()?.toLowerCase();

			if (extension === "ods") {
				const arrayBuffer = await file.arrayBuffer();
				const workbook = XLSX.read(arrayBuffer, { type: "array" });
				const sheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[sheetName];
				const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

				const data: SheetData = {};
				jsonData.forEach((row, rowIdx) => {
					row.forEach((value, colIdx) => {
						if (value !== undefined && value !== null && value !== "") {
							const colLetter = String.fromCharCode(65 + colIdx);
							const cellId = `${colLetter}${rowIdx + 1}`;
							data[cellId] = {
								value: String(value),
								style: {},
								formula: "",
							};
						}
					});
				});

				return { data, name: sheetName };
			}

			// XLSX fallback
			const workbook = new ExcelJS.Workbook();
			const fileBlob = (file as any).file instanceof Blob ? (file as any).file : file;
			const arrayBuffer = await fileBlob.arrayBuffer();
			await (workbook.xlsx as any).load(arrayBuffer);

			const worksheet = workbook.worksheets[0];
			if (!worksheet) {
				throw new Error("No worksheets found in the Excel file.");
			}

			const data: SheetData = {};
			const sheetName = worksheet.name;

			worksheet.eachRow((row, rowNumber) => {
				row.eachCell((cell, colNumber) => {
					const colLetter = String.fromCharCode(64 + colNumber);
					const cellId = `${colLetter}${rowNumber}`;

					const cellData: CellData = {
						value: cell.text || "",
						style: {},
						formula: "",
					};

					if (cell.formula) {
						cellData.formula = `=${cell.formula}`;
					}

					if (cell.font) {
						if (cell.font.bold) cellData.style!.bold = true;
						if (cell.font.italic) cellData.style!.italic = true;
						if (cell.font.underline) cellData.style!.underline = true;
						if (cell.font.color?.argb) {
							cellData.style!.color = `#${cell.font.color.argb}`;
						}
					}

					if (cell.fill && "fgColor" in cell.fill && cell.fill.fgColor?.argb) {
						cellData.style!.backgroundColor = `#${cell.fill.fgColor.argb}`;
					}

					if (cell.alignment?.horizontal) {
						cellData.style!.align = cell.alignment.horizontal as "left" | "center" | "right";
					}

					data[cellId] = cellData;
				});
			});

			return { data, name: sheetName };
		},
		[],
	);

	const addExcelFeatures = useCallback((workbook: ExcelJS.Workbook) => {
		// Add advanced Excel features
		const worksheet = workbook.worksheets[0];

		// Add data validation
		worksheet.getCell("A1").dataValidation = {
			type: "list",
			allowBlank: true,
			formulae: ['"Option1,Option2,Option3"'],
		};

		// Add formulas
		worksheet.getCell("B1").value = { formula: "SUM(A1:A10)" };

		// Add tables
		worksheet.addTable({
			name: "MyTable",
			ref: "A1",
			columns: [{ name: "Column1" }, { name: "Column2" }],
			rows: [
				["Value1", "Value2"],
				["Value3", "Value4"],
			],
		});

		return workbook;
	}, []);

	return {
		exportToFile,
		importFromFile,
		addExcelFeatures,
	};
};
