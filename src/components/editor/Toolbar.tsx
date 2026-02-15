import { Button } from "@/components/ui/button";
import {
	Bold,
	Italic,
	Underline,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Save,
	Download,
	Upload,
	FileSpreadsheet,
	FileUp,
	Info,
} from "lucide-react";
import { ShortcutsDropdown } from "@/components/shortcuts-dropdown";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExcelService } from "@/hooks/use-excel-service";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ToolbarProps {
	onStyleChange: (style: {
		bold?: boolean;
		italic?: boolean;
		underline?: boolean;
		align?: "left" | "center" | "right";
	}) => void;
	onExport: () => void;
	onImport: (file: File) => void;
	onSave: () => void;
}

export const Toolbar = ({
	onStyleChange,
	onExport,
	onImport,
	onSave,
}: ToolbarProps) => {
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			toast.loading("Importing file...", {
				id: "import-toast",
				description: `${file.name} is being processed`,
			});
			
			try {
				onImport(file);
				toast.success("File imported successfully!", {
					id: "import-toast",
					description: `${file.name} has been imported`,
					duration: 3000,
				});
			} catch (error) {
				toast.error("Import failed", {
					id: "import-toast",
					description: "There was an error importing your file",
					duration: 5000,
				});
			}
		}
	};

	const handleExport = () => {
		toast.promise(
			new Promise((resolve) => {
				onExport();
				setTimeout(resolve, 1000);
			}),
			{
				loading: "Preparing export...",
				success: "File exported successfully!",
				error: "Export failed",
				duration: 2000,
			}
		);
	};

	const handleSave = () => {
		toast.promise(
			new Promise((resolve) => {
				onSave();
				setTimeout(resolve, 500);
			}),
			{
				loading: "Saving...",
				success: "Changes saved successfully!",
				error: "Save failed",
				duration: 2000,
			}
		);
	};

	const handleStyleChange = (style: { bold?: boolean; italic?: boolean; underline?: boolean }) => {
		onStyleChange(style);
		
		const styleName = style.bold ? "Bold" : style.italic ? "Italic" : style.underline ? "Underline" : "";
		if (styleName) {
			toast.info(`${styleName} style applied`, {
				description: `Text formatting updated`,
				duration: 1500,
				icon: style.bold ? <Bold className="h-4 w-4" /> : 
					  style.italic ? <Italic className="h-4 w-4" /> : 
					  <Underline className="h-4 w-4" />,
			});
		}
	};

	const handleAlignChange = (align: "left" | "center" | "right") => {
		onStyleChange({ align });
		
		const alignNames = {
			left: "Left",
			center: "Center",
			right: "Right"
		};
		
		toast.info(`Aligned to ${alignNames[align]}`, {
			description: `Text alignment updated`,
			duration: 1500,
		});
	};

	return (
		<TooltipProvider delayDuration={300}>
			<div className="h-12 border-b flex items-center px-4 gap-2 bg-background">
				<div className="flex items-center gap-1 border-r pr-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={handleSave}
							>
								<Save className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Save changes <span className="text-xs text-muted-foreground ml-1">(Ctrl+S)</span></p>
						</TooltipContent>
					</Tooltip>

					<DropdownMenu>
						<Tooltip>
							<TooltipTrigger asChild>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<FileSpreadsheet className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>Excel import/export</p>
							</TooltipContent>
						</Tooltip>
						<DropdownMenuContent>
							<DropdownMenuItem onClick={handleExport}>
								<Download className="h-4 w-4 mr-2" />
								Export to Excel
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<label className="cursor-pointer">
									<FileUp className="h-4 w-4 mr-2" />
									Import from Excel
									<input
										type="file"
										className="hidden"
										accept=".xlsx,.xls,.csv"
										onChange={handleFileUpload}
									/>
								</label>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="flex items-center gap-1 border-r pr-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleStyleChange({ bold: true })}
							>
								<Bold className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Bold <span className="text-xs text-muted-foreground ml-1">(Ctrl+B)</span></p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleStyleChange({ italic: true })}
							>
								<Italic className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Italic <span className="text-xs text-muted-foreground ml-1">(Ctrl+I)</span></p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleStyleChange({ underline: true })}
							>
								<Underline className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Underline <span className="text-xs text-muted-foreground ml-1">(Ctrl+U)</span></p>
						</TooltipContent>
					</Tooltip>
				</div>

				<div className="flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleAlignChange("left")}
							>
								<AlignLeft className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Align left</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleAlignChange("center")}
							>
								<AlignCenter className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Align center</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => handleAlignChange("right")}
							>
								<AlignRight className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Align right</p>
						</TooltipContent>
					</Tooltip>
				</div>

				<div className="flex items-center gap-1 ml-auto">
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<ShortcutsDropdown />
							</div>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Keyboard shortcuts</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 ml-1"
								onClick={() => {
									toast.info("Toolbar Help", {
										description: "Hover over buttons to see their functions. Use keyboard shortcuts for faster access.",
										duration: 5000,
										icon: <Info className="h-4 w-4" />,
									});
								}}
							>
								<Info className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Show help</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</TooltipProvider>
	);
};