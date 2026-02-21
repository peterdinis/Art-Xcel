"use server";

import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";

interface CellData {
    value: string;
    formula?: string;
    style?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        color?: string;
        backgroundColor?: string;
        align?: "left" | "center" | "right";
    };
}

type SheetData = Record<string, CellData>;

export async function saveSpreadsheetAction(id: string, data: any) {
    // In a real app, you would save to a database here
    console.log(`Saving spreadsheet ${id} with ${Object.keys(data).length} cells`);

    // Simulate a database delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Trigger revalidation for this editor page
    revalidatePath(`/editor/${id}`);

    return { success: true, timestamp: new Date().toISOString() };
}

export async function clearSpreadsheetCache(id: string) {
    revalidatePath(`/editor/${id}`);
}

export async function parseExcelAction(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file provided");
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        throw new Error("No worksheets found");
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
                    cellData.style!.color = `#${cell.font.color.argb.replace(/^FF/, "")}`;
                }
            }

            if (cell.fill && "fgColor" in cell.fill && cell.fill.fgColor?.argb) {
                cellData.style!.backgroundColor = `#${cell.fill.fgColor.argb.replace(/^FF/, "")}`;
            }

            if (cell.alignment?.horizontal) {
                cellData.style!.align = cell.alignment.horizontal as "left" | "center" | "right";
            }

            data[cellId] = cellData;
        });
    });

    return { data, name: sheetName };
}
