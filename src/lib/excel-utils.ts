export const colLetterToIndex = (colLetter: string): number => {
	let index = 0;
	for (let i = 0; i < colLetter.length; i++) {
		index = index * 26 + (colLetter.charCodeAt(i) - 64);
	}
	return index - 1;
};

export const indexToColLetter = (index: number): string => {
	let temp = index;
	let letter = "";
	while (temp >= 0) {
		letter = String.fromCharCode((temp % 26) + 65) + letter;
		temp = Math.floor(temp / 26) - 1;
	}
	return letter;
};

export const parseCellId = (cellId: string): { col: number; row: number } => {
	const colMatch = cellId.match(/[A-Z]+/)?.[0] || "";
	const rowMatch = cellId.match(/\d+/)?.[0] || "1";

	const col = colLetterToIndex(colMatch);
	const row = parseInt(rowMatch, 10) - 1;

	return { col, row };
};

export const getRangeCells = (range: string): string[] => {
	if (!range.includes(":")) return [range];

	const [start, end] = range.split(":");
	const { col: startCol, row: startRow } = parseCellId(start);
	const { col: endCol, row: endRow } = parseCellId(end);

	const cells: string[] = [];
	for (
		let r = Math.min(startRow, endRow);
		r <= Math.max(startRow, endRow);
		r++
	) {
		for (
			let c = Math.min(startCol, endCol);
			c <= Math.max(startCol, endCol);
			c++
		) {
			cells.push(`${indexToColLetter(c)}${r + 1}`);
		}
	}
	return cells;
};

export const formatNumber = (value: unknown, format: string): string => {
	const num = Number(value);
	if (isNaN(num)) return String(value);

	switch (format) {
		case "currency":
			return new Intl.NumberFormat("sk-SK", {
				style: "currency",
				currency: "EUR",
			}).format(num);
		case "percentage":
			return new Intl.NumberFormat("sk-SK", {
				style: "percent",
				minimumFractionDigits: 2,
			}).format(num / 100);
		case "date":
			return new Date(num).toLocaleDateString("sk-SK");
		case "time":
			return new Date(num).toLocaleTimeString("sk-SK");
		case "number":
			return new Intl.NumberFormat("sk-SK").format(num);
		default:
			return String(value);
	}
};
