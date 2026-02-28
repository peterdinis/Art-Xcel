import { useCallback } from "react";
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import { SheetData, CellData } from "./use-spreadsheet";

interface ExcelCellValue {
  formula?: string;
  result?: string | number;
}

interface RowDataMap {
  [rowIndex: number]: Map<number, CellData>;
}

interface ExcelPatternFill {
  type: 'pattern';
  pattern: string;
  fgColor?: { argb: string };
  bgColor?: { argb: string };
}

const colLetterToIndex = (colLetter: string): number => {
  return colLetter.charCodeAt(0) - 65;
};

const indexToColLetter = (index: number): string => {
  return String.fromCharCode(65 + index);
};

const parseCellId = (cellId: string): { col: number; row: number } => {
  const colMatch = cellId.match(/[A-Z]+/)?.[0] || "";
  const rowMatch = cellId.match(/\d+/)?.[0] || "1";
  
  const col = colLetterToIndex(colMatch);
  const row = parseInt(rowMatch, 10) - 1;
  
  return { col, row };
};

const formatColor = (color: string | undefined): string | undefined => {
  if (!color) return undefined;
  return color.replace("#", "");
};

const isPatternFill = (fill: ExcelJS.Fill): fill is ExcelJS.Fill & ExcelPatternFill => {
  return 'pattern' in fill && fill.type === 'pattern';
};

const applyCellStyle = (cell: ExcelJS.Cell, style: CellData['style']): void => {
  if (!style) return;

  if (style.bold || style.italic || style.underline || style.color) {
    const font: Partial<ExcelJS.Font> = {};
    
    if (style.bold) font.bold = true;
    if (style.italic) font.italic = true;
    if (style.underline) font.underline = true;
    if (style.color) {
      const colorValue = formatColor(style.color);
      if (colorValue) font.color = { argb: colorValue };
    }
    
    cell.font = font as ExcelJS.Font;
  }

  if (style.backgroundColor) {
    const bgColor = formatColor(style.backgroundColor);
    if (bgColor) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor }
      } as ExcelJS.Fill;
    }
  }

  if (style.align) {
    cell.alignment = {
      horizontal: style.align
    } as ExcelJS.Alignment;
  }
};

export const useExcelService = () => {
  const exportToFile = useCallback(
    async (data: SheetData, sheetName: string, format: "xlsx" | "ods"): Promise<void> => {
      if (format === "xlsx") {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        const rows: RowDataMap = {};

        Object.entries(data).forEach(([cellId, cellData]) => {
          const { col, row } = parseCellId(cellId);

          if (!rows[row]) {
            rows[row] = new Map();
          }
          rows[row].set(col, cellData);
        });

        const rowIndices = Object.keys(rows).map(Number).sort((a, b) => a - b);
        
        rowIndices.forEach((rowIndex) => {
          const rowData = rows[rowIndex];
          if (!rowData) return;
          
          const excelRow = worksheet.getRow(rowIndex + 1);
          const colIndices = Array.from(rowData.keys()).sort((a, b) => a - b);

          colIndices.forEach((colIndex) => {
            const cellData = rowData.get(colIndex);
            if (!cellData) return;

            const cell = excelRow.getCell(colIndex + 1);

            if (cellData.formula?.startsWith("=")) {
              cell.value = { formula: cellData.formula.substring(1) } as ExcelJS.CellValue;
            } else {
              cell.value = cellData.value || "";
            }

            applyCellStyle(cell, cellData.style);
          });

          excelRow.commit();
        });

        worksheet.columns.forEach((column) => {
          column.width = 15;
        });

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
        const cells = Object.entries(data);

        let maxCol = 0;
        let maxRow = 0;
        
        cells.forEach(([cellId]) => {
          const { col, row } = parseCellId(cellId);
          maxCol = Math.max(maxCol, col);
          maxRow = Math.max(maxRow, row);
        });

        const sheetArray: string[][] = [];
        for (let r = 0; r <= maxRow; r++) {
          sheetArray[r] = new Array(maxCol + 1).fill("");
        }

        cells.forEach(([cellId, cellData]) => {
          const { col, row } = parseCellId(cellId);
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        const data: SheetData = {};
        
        jsonData.forEach((row, rowIdx) => {
          if (!Array.isArray(row)) return;
          
          row.forEach((value, colIdx) => {
            if (value !== undefined && value !== null && value !== "") {
              const colLetter = indexToColLetter(colIdx);
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

      const workbook = new ExcelJS.Workbook();
      
      let fileToRead: File | Blob;
      if (file && typeof file === 'object' && 'file' in file && file.file instanceof Blob) {
        fileToRead = file.file;
      } else {
        fileToRead = file;
      }

      const arrayBuffer = await fileToRead.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("No worksheets found in the Excel file.");
      }

      const data: SheetData = {};
      const sheetName = worksheet.name;

      worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
        row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
          const colLetter = indexToColLetter(colNumber - 1);
          const cellId = `${colLetter}${rowNumber}`;

          const cellData: CellData = {
            value: cell.text || "",
            style: {},
            formula: "",
          };

          if (cell.type === ExcelJS.ValueType.Formula && cell.value && typeof cell.value === 'object' && 'formula' in cell.value) {
            const formulaValue = cell.value as ExcelCellValue;
            if (formulaValue.formula) {
              cellData.formula = `=${formulaValue.formula}`;
            }
          }

          if (cell.font) {
            if (cell.font.bold) cellData.style!.bold = true;
            if (cell.font.italic) cellData.style!.italic = true;
            if (cell.font.underline) cellData.style!.underline = true;
            if (cell.font.color?.argb) {
              cellData.style!.color = `#${cell.font.color.argb}`;
            }
          }

          if (cell.fill && isPatternFill(cell.fill) && cell.fill.fgColor?.argb) {
            cellData.style!.backgroundColor = `#${cell.fill.fgColor.argb}`;
          }

          if (cell.alignment?.horizontal) {
            const align = cell.alignment.horizontal;
            if (align === 'left' || align === 'center' || align === 'right') {
              cellData.style!.align = align;
            }
          }

          data[cellId] = cellData;
        });
      });

      return { data, name: sheetName };
    },
    [],
  );

  const addExcelFeatures = useCallback((workbook: ExcelJS.Workbook): ExcelJS.Workbook => {
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return workbook;

    const cellA1 = worksheet.getCell("A1");
    cellA1.dataValidation = {
      type: 'list' as const,
      allowBlank: true,
      formulae: ['"Option1,Option2,Option3"'],
    };

    const cellB1 = worksheet.getCell("B1");
    cellB1.value = { formula: "SUM(A1:A10)" } as ExcelJS.CellValue;

    worksheet.addTable({
      name: "MyTable",
      ref: "A1",
      columns: [
        { name: "Column1" },
        { name: "Column2" }
      ],
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