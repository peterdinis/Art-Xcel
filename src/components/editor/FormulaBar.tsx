import { Input } from "@/components/ui/input";

interface FormulaBarProps {
	selectedCell: string | null;
	value: string;
	onChange: (value: string) => void;
}

export const FormulaBar = ({
	selectedCell,
	value,
	onChange,
}: FormulaBarProps) => {
	return (
		<div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-muted/30 dark:bg-zinc-900/80">
			<div className="w-10 font-mono text-sm font-bold text-muted-foreground flex items-center justify-center border-r border-border">
				{selectedCell || ""}
			</div>
			<div className="font-serif italic text-muted-foreground px-2">fx</div>
			<Input
				className="h-7 border-none shadow-none focus-visible:ring-0 rounded-none"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
};
