// hooks/use-excel-service.ts
import { useCallback } from 'react';
import ExcelJS from 'exceljs';
import { SheetData, CellData } from './use-spreadsheet';

export const useExcelService = () => {
  const exportToExcel = useCallback(async (data: SheetData, sheetName: string) => {
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
        if (cellData.formula?.startsWith('=')) {
          cell.value = { formula: cellData.formula.substring(1) };
        } else {
          cell.value = cellData.value || '';
        }

        // Apply styles
        if (cellData.style) {
          // Font styles
          if (cellData.style.bold || cellData.style.italic || cellData.style.underline || cellData.style.color) {
            cell.font = {
              bold: cellData.style.bold,
              italic: cellData.style.italic,
              underline: cellData.style.underline,
              color: cellData.style.color ? { argb: cellData.style.color.replace('#', '') } : undefined
            };
          }
          
          // Fill/Background color
          if (cellData.style.backgroundColor) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: cellData.style.backgroundColor.replace('#', '') }
            };
          }
          
          // Alignment
          if (cellData.style.align) {
            cell.alignment = {
              horizontal: cellData.style.align as 'left' | 'center' | 'right'
            };
          }
        }
      });
      
      excelRow.commit();
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sheetName || 'spreadsheet'}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, []);

  const importFromExcel = useCallback(async (file: File): Promise<{data: SheetData, name: string}> => {
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.worksheets[0];
    const data: SheetData = {};
    const sheetName = worksheet.name;

    // Iterate through all rows
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        const colLetter = String.fromCharCode(64 + colNumber); // 1=A, 2=B, etc.
        const cellId = `${colLetter}${rowNumber}`;
        
        const cellData: CellData = {
          value: cell.text || '',
          style: {},
          formula: ""
        };

        // Handle formula
        if (cell.formula) {
          cellData.formula = `=${cell.formula}`;
        }

        // Extract font styles
        if (cell.font) {
          if (cell.font.bold) cellData.style!.bold = true;
          if (cell.font.italic) cellData.style!.italic = true;
          if (cell.font.underline) cellData.style!.underline = true;
          if (cell.font.color?.argb) {
            cellData.style!.color = `#${cell.font.color.argb}`;
          }
        }

        // Extract fill/background color
        if (cell.fill) {
          // Check if it's a pattern fill with solid pattern
          if ('fgColor' in cell.fill && cell.fill.fgColor?.argb) {
            cellData.style!.backgroundColor = `#${cell.fill.fgColor.argb}`;
          }
        }

        // Extract alignment
        if (cell.alignment?.horizontal) {
          cellData.style!.align = cell.alignment.horizontal as 'left' | 'center' | 'right';
        }

        data[cellId] = cellData;
      });
    });

    return { data, name: sheetName };
  }, []);

  const addExcelFeatures = useCallback((workbook: ExcelJS.Workbook) => {
    // Add advanced Excel features
    const worksheet = workbook.worksheets[0];

    // Add data validation
    worksheet.getCell('A1').dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Option1,Option2,Option3"']
    };

    // Add formulas
    worksheet.getCell('B1').value = { formula: 'SUM(A1:A10)' };

    // Add tables
    worksheet.addTable({
      name: 'MyTable',
      ref: 'A1',
      columns: [
        { name: 'Column1' },
        { name: 'Column2' }
      ],
      rows: [
        ['Value1', 'Value2'],
        ['Value3', 'Value4']
      ]
    });

    return workbook;
  }, []);

  return {
    exportToExcel,
    importFromExcel,
    addExcelFeatures
  };
};