import { indexToColLetter } from "@/lib/excel-utils";

export type RowSelectionResult = {
	anchorCell: string;
	range: string;
};

function getRowFromCellId(cellId: string): number {
	const m = cellId.match(/\d+/)?.[0];
	const n = m ? parseInt(m, 10) : 1;
	return Number.isFinite(n) && n > 0 ? n : 1;
}

export function getRowSelection(
	row: number,
	totalCols: number,
	opts?: { extendFromCell?: string },
): RowSelectionResult {
	const safeRow = Number.isFinite(row) && row > 0 ? row : 1;
	const lastColIndex = Math.max((Number.isFinite(totalCols) ? totalCols : 1) - 1, 0);
	const lastCol = indexToColLetter(lastColIndex);

	const anchorRow = opts?.extendFromCell ? getRowFromCellId(opts.extendFromCell) : safeRow;
	const startRow = Math.min(anchorRow, safeRow);
	const endRow = Math.max(anchorRow, safeRow);

	const start = `A${startRow}`;
	const end = `${lastCol}${endRow}`;
	return { anchorCell: start, range: `${start}:${end}` };
}

