"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    File,
    FolderOpen,
    Save,
    Download,
    Printer,
    FileSearch,
    Scissors,
    Copy,
    ClipboardPaste,
    Brush,
    Undo2,
    Redo2,
    Search,
    CheckCircle2,
    Grid3X3,
    Image as ImageIcon,
    BarChart3,
    Type,
    AtSign,
    Link as LinkIcon,
    MessageSquare,
    Lock,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    AlignStartVertical,
    AlignCenterVertical,
    AlignEndVertical,
    Grid,
    PaintBucket,
    Square,
    ChevronDown,
    Percent,
    DollarSign,
    Plus,
    Minus,
    ArrowLeftToLine,
    ArrowRightToLine,
    SortAsc,
    SortDesc,
    Filter,
    Pipette,
} from "lucide-react";

interface ClassicToolbarProps {
    onStyleChange: (style: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        align?: "left" | "center" | "right" | "justify";
        color?: string;
        backgroundColor?: string;
    }) => void;
    onSave: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onExport: () => void;
    onExportFormat?: (format: "xlsx" | "ods") => void;
    onImport: (file: File) => void;
    onClear: () => void;
    onInsertRow: () => void;
    onDeleteRow: () => void;
    onInsertColumn: () => void;
    onDeleteColumn: () => void;
    onSort: (direction: "asc" | "desc") => void;
    onFilter: () => void;
    onFind: () => void;
    onInsertChart?: () => void;
    onInsertImage?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDataValidation?: () => void;
    onRemoveDuplicates?: () => void;
    onTextToColumns?: () => void;
    onInsertShape?: (type: "rectangle" | "circle" | "line") => void;
    onInsertIcon?: () => void;
    onInsertFunction?: (formula: string) => void;
    onScrollToTop?: () => void;
    onNew?: () => void;
    onOpen?: () => void;
    onPrint?: () => void;
    onCut?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onSelectAll?: () => void;
    onToggleToolbars?: () => void;
    onToggleFormulaBar?: () => void;
    onToggleStatusBar?: () => void;
    onToggleFreezePanes?: () => void;
    onToggleFullScreen?: () => void;
    onFormatSpacing?: () => void;
    onFormatAlignment?: () => void;
    onConditionalFormatting?: () => void;
    onUserGuides?: () => void;
    onShortcuts?: () => void;
    onAbout?: () => void;
    onToggleGrid?: () => void;
}

const ToolbarButton = ({
    icon: Icon,
    tooltip,
    onClick,
    disabled = false,
}: {
    icon: any;
    tooltip: string;
    onClick?: () => void;
    disabled?: boolean;
}) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onClick}
                    disabled={disabled}
                >
                    <Icon className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export const ClassicToolbar = ({
    onStyleChange,
    onSave,
    onUndo,
    onRedo,
    onExport,
    onExportFormat,
    onImport,
    onClear,
    onInsertRow,
    onDeleteRow,
    onInsertColumn,
    onDeleteColumn,
    onSort,
    onFilter,
    onFind,
    onInsertChart,
    onInsertImage,
    onDataValidation,
    onRemoveDuplicates,
    onTextToColumns,
    onInsertShape,
    onInsertIcon,
    onInsertFunction,
    onScrollToTop,
    onNew,
    onOpen,
    onPrint,
    onCut,
    onCopy,
    onPaste,
    onSelectAll,
    onToggleToolbars,
    onToggleFormulaBar,
    onToggleStatusBar,
    onToggleFreezePanes,
    onToggleFullScreen,
    onFormatSpacing,
    onFormatAlignment,
    onConditionalFormatting,
    onUserGuides,
    onShortcuts,
    onAbout,
    onToggleGrid,
}: ClassicToolbarProps) => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
    };

    return (
        <div className="flex flex-col border-b bg-[#f0f0f0] dark:bg-zinc-900 select-none">
            {/* Row 1: Menu Bar */}
            <div className="flex items-center px-1 h-7 border-b">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 px-3 py-0 text-xs font-normal">File</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                        <DropdownMenuItem onClick={onNew}>New</DropdownMenuItem>
                        <DropdownMenuItem onClick={onOpen}>Open...</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onSave}>Save</DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Save As</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => onExportFormat?.("xlsx")}>Excel Spreadsheet (.xlsx)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onExportFormat?.("ods")}>LibreOffice Spreadsheet (.ods)</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onExport}>Export As...</DropdownMenuItem>
                        <DropdownMenuItem onClick={onPrint}>Print...</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 px-3 py-0 text-xs font-normal">Edit</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                        <DropdownMenuItem onClick={onUndo}>Undo</DropdownMenuItem>
                        <DropdownMenuItem onClick={onRedo}>Redo</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onCut}>Cut</DropdownMenuItem>
                        <DropdownMenuItem onClick={onCopy}>Copy</DropdownMenuItem>
                        <DropdownMenuItem onClick={onPaste}>Paste</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onSelectAll}>Select All</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onFind}>Find & Replace...</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 px-3 py-0 text-xs font-normal">View</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                        <DropdownMenuItem onClick={onToggleToolbars}>Toolbars</DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggleFormulaBar}>Formula Bar</DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggleStatusBar}>Status Bar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onToggleGrid}>Toggle Grid</DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggleFreezePanes}>Freeze Panes</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onToggleFullScreen}>Full Screen</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 px-3 py-0 text-xs font-normal">Insert</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                        <DropdownMenuItem onClick={onInsertImage ? () => { } : undefined}>Image...</DropdownMenuItem>
                        <DropdownMenuItem onClick={onInsertChart}>Chart...</DropdownMenuItem>
                        <DropdownMenuItem onClick={onInsertIcon}>Icon...</DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Shape</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => onInsertShape?.("rectangle")}>Rectangle</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onInsertShape?.("circle")}>Circle</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onInsertShape?.("line")}>Line</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onInsertRow}>Row Above</DropdownMenuItem>
                        <DropdownMenuItem onClick={onInsertColumn}>Column Before</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onInsertFunction?.("SUM")}>Function...</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 px-3 py-0 text-xs font-normal">Format</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                        <DropdownMenuItem onClick={() => onStyleChange({ bold: true })}>Text</DropdownMenuItem>
                        <DropdownMenuItem onClick={onFormatSpacing}>Spacing</DropdownMenuItem>
                        <DropdownMenuItem onClick={onFormatAlignment}>Alignment</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onConditionalFormatting}>Conditional Formatting...</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 px-3 py-0 text-xs font-normal">Sheet</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                        <DropdownMenuItem onClick={onInsertRow}>Insert Rows</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDeleteRow}>Delete Rows</DropdownMenuItem>
                        <DropdownMenuItem onClick={onInsertColumn}>Insert Columns</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDeleteColumn}>Delete Columns</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onClear}>Clear Sheet</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 px-3 py-0 text-xs font-normal">Data</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                        <DropdownMenuItem onClick={() => onSort("asc")}>Sort...</DropdownMenuItem>
                        <DropdownMenuItem onClick={onFilter}>AutoFilter</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDataValidation}>Validity...</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onRemoveDuplicates}>Remove Duplicates</DropdownMenuItem>
                        <DropdownMenuItem onClick={onTextToColumns}>Text to Columns...</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 px-3 py-0 text-xs font-normal">Help</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                        <DropdownMenuItem onClick={onUserGuides}>User Guides</DropdownMenuItem>
                        <DropdownMenuItem onClick={onShortcuts}>Shortcut Keys</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onAbout}>About Art-Xcel</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Row 2: Standard Toolbar */}
            <div className="flex items-center px-1 h-8 border-b gap-0.5 overflow-x-auto">
                <ToolbarButton icon={File} tooltip="New" onClick={onNew} />
                <div className="relative">
                    <ToolbarButton icon={FolderOpen} tooltip="Open" onClick={onOpen} />
                    <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        accept=".xlsx,.xls,.csv,.ods"
                    />
                </div>
                <ToolbarButton icon={Save} tooltip="Save" onClick={onSave} />
                <ToolbarButton icon={Download} tooltip="Export" onClick={onExport} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton icon={Printer} tooltip="Print" onClick={onPrint} />
                <ToolbarButton icon={FileSearch} tooltip="Print Preview" onClick={onPrint} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton icon={Scissors} tooltip="Cut" onClick={onCut} />
                <ToolbarButton icon={Copy} tooltip="Copy" onClick={onCopy} />
                <ToolbarButton icon={ClipboardPaste} tooltip="Paste" onClick={onPaste} />
                <ToolbarButton icon={Brush} tooltip="Format Painter" onClick={() => toast.info("Format Painter", { description: "Format painter logic coming soon" })} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton icon={Undo2} tooltip="Undo" onClick={onUndo} />
                <ToolbarButton icon={Redo2} tooltip="Redo" onClick={onRedo} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton icon={Search} tooltip="Find & Replace" onClick={onFind} />
                <ToolbarButton icon={CheckCircle2} tooltip="Spelling" onClick={() => toast.info("Spelling", { description: "Spell checker integration coming soon" })} />
                <ToolbarButton icon={Grid3X3} tooltip="Toggle Grid" onClick={onToggleGrid} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <div className="relative">
                    <ToolbarButton icon={ImageIcon} tooltip="Insert Image" />
                    <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={onInsertImage}
                        accept="image/*"
                    />
                </div>
                <ToolbarButton icon={BarChart3} tooltip="Insert Chart" onClick={onInsertChart} />
                <ToolbarButton icon={Type} tooltip="Insert Text Box" onClick={() => toast.info("Insert Text Box", { description: "Text box insertion coming soon" })} />
                <ToolbarButton icon={AtSign} tooltip="Special Character" onClick={() => toast.info("Special Character", { description: "Special character picker coming soon" })} />
                <ToolbarButton icon={LinkIcon} tooltip="Insert Hyperlink" onClick={() => toast.info("Insert Hyperlink", { description: "Hyperlink dialog coming soon" })} />
                <ToolbarButton icon={MessageSquare} tooltip="Insert Comment" onClick={() => toast.info("Insert Comment", { description: "Cell commenting coming soon" })} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton icon={Lock} tooltip="Freeze Panes" onClick={onToggleFreezePanes} />
            </div>

            {/* Row 3: Formatting Toolbar */}
            <div className="flex items-center px-1 h-10 gap-0.5 overflow-x-auto">
                <Select defaultValue="inter">
                    <SelectTrigger className="h-7 w-[150px] text-xs bg-white dark:bg-zinc-950">
                        <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="arial">Arial</SelectItem>
                        <SelectItem value="times">Times New Roman</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="10">
                    <SelectTrigger className="h-7 w-[60px] text-xs bg-white dark:bg-zinc-950">
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton
                    icon={Bold}
                    tooltip="Bold"
                    onClick={() => onStyleChange({ bold: true })}
                />
                <ToolbarButton
                    icon={Italic}
                    tooltip="Italic"
                    onClick={() => onStyleChange({ italic: true })}
                />
                <ToolbarButton
                    icon={Underline}
                    tooltip="Underline"
                    onClick={() => onStyleChange({ underline: true })}
                />
                <ToolbarButton icon={Pipette} tooltip="Font Color" onClick={() => toast.info("Font Color", { description: "Font color picker coming soon" })} />
                <ToolbarButton icon={PaintBucket} tooltip="Background Color" onClick={() => toast.info("Background Color", { description: "Background color picker coming soon" })} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton
                    icon={AlignLeft}
                    tooltip="Align Left"
                    onClick={() => onStyleChange({ align: "left" })}
                />
                <ToolbarButton
                    icon={AlignCenter}
                    tooltip="Align Center"
                    onClick={() => onStyleChange({ align: "center" })}
                />
                <ToolbarButton
                    icon={AlignRight}
                    tooltip="Align Right"
                    onClick={() => onStyleChange({ align: "right" })}
                />
                <ToolbarButton
                    icon={AlignJustify}
                    tooltip="Justified"
                    onClick={() => onStyleChange({ align: "justify" })}
                />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton icon={AlignStartVertical} tooltip="Align Top" onClick={() => toast.info("Align Top", { description: "Vertical alignment coming soon" })} />
                <ToolbarButton icon={AlignCenterVertical} tooltip="Center Vertically" onClick={() => toast.info("Center Vertically", { description: "Vertical alignment coming soon" })} />
                <ToolbarButton icon={AlignEndVertical} tooltip="Align Bottom" onClick={() => toast.info("Align Bottom", { description: "Vertical alignment coming soon" })} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <div className="flex items-center gap-0">
                    <ToolbarButton icon={Grid} tooltip="Borders" />
                    <Button variant="ghost" size="icon" className="h-7 w-4 px-0">
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </div>
                <ToolbarButton icon={Square} tooltip="Fill Color" onClick={() => toast.info("Fill Color", { description: "Cell fill options coming soon" })} />
                <ToolbarButton icon={Square} tooltip="Merge Cells" onClick={() => toast.info("Merge Cells", { description: "Merge cells functionality coming soon" })} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton icon={DollarSign} tooltip="Currency" onClick={() => toast.info("Currency", { description: "Currency formatting coming soon" })} />
                <ToolbarButton icon={Percent} tooltip="Percent" onClick={() => toast.info("Percent", { description: "Percent formatting coming soon" })} />
                <ToolbarButton icon={Plus} tooltip="Add Decimal Place" onClick={() => toast.info("Add Decimal Place", { description: "Decimal adjustment coming soon" })} />
                <ToolbarButton icon={Minus} tooltip="Delete Decimal Place" onClick={() => toast.info("Delete Decimal Place", { description: "Decimal adjustment coming soon" })} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton icon={ArrowLeftToLine} tooltip="Decrease Indent" onClick={() => toast.info("Decrease Indent", { description: "Indent adjustment coming soon" })} />
                <ToolbarButton icon={ArrowRightToLine} tooltip="Increase Indent" onClick={() => toast.info("Increase Indent", { description: "Indent adjustment coming soon" })} />
                <Separator orientation="vertical" className="h-5 mx-0.5" />
                <ToolbarButton icon={SortAsc} tooltip="Sort Ascending" onClick={() => onSort("asc")} />
                <ToolbarButton icon={SortDesc} tooltip="Sort Descending" onClick={() => onSort("desc")} />
                <ToolbarButton icon={Filter} tooltip="AutoFilter" onClick={onFilter} />
            </div>
        </div>
    );
};
