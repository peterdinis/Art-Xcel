"use client";

import React, { useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export type FormulaCategory =
	| "All"
	| "Math & Trig"
	| "Text"
	| "Logical"
	| "Lookup & Reference"
	| "Date & Time"
	| "Financial"
	| "Statistical"
	| "Information";

export interface FormulaItem {
	name: string;
	syntax: string;
	description: string;
	category: FormulaCategory;
	example?: string;
}

export const FORMULA_LIST: FormulaItem[] = [
	// Math & Trig
	{
		name: "SUM",
		syntax: "SUM(range)",
		description: "Adds all numbers in a range",
		category: "Math & Trig",
		example: "=SUM(A1:A10)",
	},
	{
		name: "AVERAGE",
		syntax: "AVERAGE(range)",
		description: "Returns the average of the arguments",
		category: "Math & Trig",
		example: "=AVERAGE(A1:A10)",
	},
	{
		name: "MIN",
		syntax: "MIN(range)",
		description: "Returns the smallest number",
		category: "Math & Trig",
	},
	{
		name: "MAX",
		syntax: "MAX(range)",
		description: "Returns the largest number",
		category: "Math & Trig",
	},
	{
		name: "ROUND",
		syntax: "ROUND(number, digits)",
		description: "Rounds a number to a specified number of digits",
		category: "Math & Trig",
	},
	{
		name: "ROUNDUP",
		syntax: "ROUNDUP(number, digits)",
		description: "Rounds a number up",
		category: "Math & Trig",
	},
	{
		name: "ROUNDDOWN",
		syntax: "ROUNDDOWN(number, digits)",
		description: "Rounds a number down",
		category: "Math & Trig",
	},
	{
		name: "MROUND",
		syntax: "MROUND(number, multiple)",
		description: "Rounds to the nearest multiple",
		category: "Math & Trig",
	},
	{
		name: "INT",
		syntax: "INT(number)",
		description: "Rounds a number down to the nearest integer",
		category: "Math & Trig",
	},
	{
		name: "ABS",
		syntax: "ABS(number)",
		description: "Returns the absolute value",
		category: "Math & Trig",
	},
	{
		name: "MOD",
		syntax: "MOD(number, divisor)",
		description: "Returns the remainder after division",
		category: "Math & Trig",
	},
	{
		name: "POWER",
		syntax: "POWER(number, power)",
		description: "Returns a number raised to a power",
		category: "Math & Trig",
	},
	{
		name: "SQRT",
		syntax: "SQRT(number)",
		description: "Returns the square root",
		category: "Math & Trig",
	},
	// Text
	{
		name: "CONCAT",
		syntax: "CONCAT(text1, ...)",
		description: "Joins text from multiple cells",
		category: "Text",
	},
	{
		name: "CONCATENATE",
		syntax: "CONCATENATE(text1, ...)",
		description: "Joins text items together",
		category: "Text",
	},
	{
		name: "LEFT",
		syntax: "LEFT(text, num_chars)",
		description: "Returns the leftmost characters",
		category: "Text",
	},
	{
		name: "RIGHT",
		syntax: "RIGHT(text, num_chars)",
		description: "Returns the rightmost characters",
		category: "Text",
	},
	{
		name: "MID",
		syntax: "MID(text, start, num_chars)",
		description: "Returns characters from the middle",
		category: "Text",
	},
	{
		name: "LEN",
		syntax: "LEN(text)",
		description: "Returns the number of characters",
		category: "Text",
	},
	{
		name: "UPPER",
		syntax: "UPPER(text)",
		description: "Converts text to uppercase",
		category: "Text",
	},
	{
		name: "LOWER",
		syntax: "LOWER(text)",
		description: "Converts text to lowercase",
		category: "Text",
	},
	{
		name: "TRIM",
		syntax: "TRIM(text)",
		description: "Removes extra spaces",
		category: "Text",
	},
	{
		name: "TEXT",
		syntax: "TEXT(value, format)",
		description: "Formats a value as text",
		category: "Text",
	},
	{
		name: "FIND",
		syntax: "FIND(find_text, within_text, start?)",
		description: "Finds one text within another",
		category: "Text",
	},
	{
		name: "SUBSTITUTE",
		syntax: "SUBSTITUTE(text, old, new, instance?)",
		description: "Replaces text in a string",
		category: "Text",
	},
	{
		name: "REPT",
		syntax: "REPT(text, count)",
		description: "Repeats text a given number of times",
		category: "Text",
	},
	// Logical
	{
		name: "IF",
		syntax: "IF(condition, value_if_true, value_if_false)",
		description: "Returns one value if condition is true, another if false",
		category: "Logical",
		example: '=IF(A1>0,"Yes","No")',
	},
	{
		name: "IFS",
		syntax: "IFS(cond1, value1, cond2, value2, ...)",
		description: "Checks multiple conditions",
		category: "Logical",
	},
	{
		name: "SWITCH",
		syntax: "SWITCH(expr, case1, value1, ...)",
		description: "Evaluates an expression against a list of values",
		category: "Logical",
	},
	{
		name: "AND",
		syntax: "AND(logical1, ...)",
		description: "Returns TRUE if all arguments are TRUE",
		category: "Logical",
	},
	{
		name: "OR",
		syntax: "OR(logical1, ...)",
		description: "Returns TRUE if any argument is TRUE",
		category: "Logical",
	},
	{
		name: "NOT",
		syntax: "NOT(logical)",
		description: "Reverses the logic of its argument",
		category: "Logical",
	},
	// Lookup & Reference
	{
		name: "VLOOKUP",
		syntax: "VLOOKUP(lookup_value, table, col_index, exact?)",
		description:
			"Looks up a value in the first column and returns a value in the same row",
		category: "Lookup & Reference",
		example: "=VLOOKUP(A1,A1:C10,2,FALSE)",
	},
	{
		name: "INDEX",
		syntax: "INDEX(array, row, column?)",
		description: "Returns a value from a table by row and column",
		category: "Lookup & Reference",
	},
	{
		name: "MATCH",
		syntax: "MATCH(lookup_value, lookup_array, match_type?)",
		description: "Returns the position of a value in a range",
		category: "Lookup & Reference",
	},
	// Date & Time
	{
		name: "TODAY",
		syntax: "TODAY()",
		description: "Returns the current date",
		category: "Date & Time",
	},
	{
		name: "NOW",
		syntax: "NOW()",
		description: "Returns the current date and time",
		category: "Date & Time",
	},
	{
		name: "YEAR",
		syntax: "YEAR(date)",
		description: "Returns the year of a date",
		category: "Date & Time",
	},
	{
		name: "MONTH",
		syntax: "MONTH(date)",
		description: "Returns the month of a date",
		category: "Date & Time",
	},
	{
		name: "DAY",
		syntax: "DAY(date)",
		description: "Returns the day of a date",
		category: "Date & Time",
	},
	// Financial
	{
		name: "PMT",
		syntax: "PMT(rate, nper, pv)",
		description: "Calculates the payment for a loan",
		category: "Financial",
	},
	{
		name: "PV",
		syntax: "PV(rate, nper, pmt, fv?)",
		description: "Returns the present value of an investment",
		category: "Financial",
	},
	{
		name: "FV",
		syntax: "FV(rate, nper, pmt, pv?)",
		description: "Returns the future value of an investment",
		category: "Financial",
	},
	// Statistical
	{
		name: "COUNT",
		syntax: "COUNT(range)",
		description: "Counts numbers in a range",
		category: "Statistical",
	},
	{
		name: "COUNTIF",
		syntax: "COUNTIF(range, criteria)",
		description: "Counts cells that meet a condition",
		category: "Statistical",
	},
	{
		name: "COUNTIFS",
		syntax: "COUNTIFS(range1, criteria1, ...)",
		description: "Counts cells that meet multiple conditions",
		category: "Statistical",
	},
	{
		name: "SUMIF",
		syntax: "SUMIF(range, criteria, sum_range?)",
		description: "Adds cells that meet a condition",
		category: "Statistical",
	},
	{
		name: "SUMIFS",
		syntax: "SUMIFS(sum_range, range1, criteria1, ...)",
		description: "Adds cells that meet multiple conditions",
		category: "Statistical",
	},
	{
		name: "AVERAGEIF",
		syntax: "AVERAGEIF(range, criteria, average_range?)",
		description: "Average of cells that meet a condition",
		category: "Statistical",
	},
	{
		name: "AVERAGEIFS",
		syntax: "AVERAGEIFS(avg_range, range1, criteria1, ...)",
		description: "Average of cells that meet multiple conditions",
		category: "Statistical",
	},
	{
		name: "MEDIAN",
		syntax: "MEDIAN(range)",
		description: "Returns the median of the numbers",
		category: "Statistical",
	},
	{
		name: "STDEV",
		syntax: "STDEV(range)",
		description: "Estimates standard deviation",
		category: "Statistical",
	},
	{
		name: "VAR",
		syntax: "VAR(range)",
		description: "Estimates variance",
		category: "Statistical",
	},
	// Information
	{
		name: "ISNUMBER",
		syntax: "ISNUMBER(value)",
		description: "Returns TRUE if the value is a number",
		category: "Information",
	},
	{
		name: "ISTEXT",
		syntax: "ISTEXT(value)",
		description: "Returns TRUE if the value is text",
		category: "Information",
	},
	{
		name: "ISBLANK",
		syntax: "ISBLANK(value)",
		description: "Returns TRUE if the value is blank",
		category: "Information",
	},
];

const CATEGORIES: FormulaCategory[] = [
	"All",
	"Math & Trig",
	"Text",
	"Logical",
	"Lookup & Reference",
	"Date & Time",
	"Financial",
	"Statistical",
	"Information",
];

interface InsertFunctionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onInsert: (formula: string, template: string) => void;
	currentFormula?: string;
}

export function InsertFunctionDialog({
	open,
	onOpenChange,
	onInsert,
	currentFormula = "",
}: InsertFunctionDialogProps) {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<FormulaCategory>("All");
	const [selected, setSelected] = useState<FormulaItem | null>(null);

	const filtered = useMemo(() => {
		let list =
			category === "All"
				? FORMULA_LIST
				: FORMULA_LIST.filter((f) => f.category === category);
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter(
				(f) =>
					f.name.toLowerCase().includes(q) ||
					f.description.toLowerCase().includes(q),
			);
		}
		return list;
	}, [category, search]);

	const handleInsert = () => {
		if (!selected) return;
		// Build template: =NAME( ) with cursor between parens
		const template = `=${selected.name}( )`;
		onInsert(selected.name, template);
		onOpenChange(false);
		setSelected(null);
		setSearch("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Insert Function</DialogTitle>
					<DialogDescription>
						Select a function to insert into the formula bar. Search by name or
						description.
					</DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-[140px_1fr] gap-4 flex-1 min-h-0">
					<div className="flex flex-col gap-2">
						<Label className="text-xs text-muted-foreground">Category</Label>
						<div className="border rounded-md h-[280px] overflow-y-auto">
							<div className="p-1 space-y-0.5">
								{CATEGORIES.map((cat) => (
									<button
										key={cat}
										type="button"
										onClick={() => setCategory(cat)}
										className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-muted ${
											category === cat ? "bg-muted font-medium" : ""
										}`}
									>
										{cat}
									</button>
								))}
							</div>
						</div>
					</div>
					<div className="flex flex-col gap-2 min-h-0">
						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search functions..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-8"
							/>
						</div>
						<div className="border rounded-md flex-1 h-[280px] overflow-y-auto">
							<div className="p-1">
								{filtered.map((item) => (
									<button
										key={item.name}
										type="button"
										onClick={() => setSelected(item)}
										className={`w-full text-left px-3 py-2 rounded text-sm flex flex-col gap-0.5 hover:bg-muted ${
											selected?.name === item.name
												? "bg-muted ring-1 ring-primary/20"
												: ""
										}`}
									>
										<span className="font-medium">{item.name}</span>
										<span className="text-xs text-muted-foreground truncate">
											{item.description}
										</span>
									</button>
								))}
								{filtered.length === 0 && (
									<div className="px-3 py-6 text-center text-sm text-muted-foreground">
										No functions match your search.
									</div>
								)}
							</div>
						</div>
						{selected && (
							<div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
								<div className="font-medium">{selected.name}</div>
								<div className="text-muted-foreground">
									{selected.description}
								</div>
								<div className="font-mono text-xs text-primary">
									{selected.syntax}
								</div>
								{selected.example && (
									<div className="text-xs text-muted-foreground">
										e.g. {selected.example}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleInsert} disabled={!selected}>
						Insert Function
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
