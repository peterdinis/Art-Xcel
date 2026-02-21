"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
    Palette,
    Table as TableIcon,
    PlusSquare,
    MinusSquare,
    Search,
    RotateCcw,
    RotateCw,
    Save,
    Download,
    Upload,
    Trash2,
    PieChart,
    Sigma,
    Filter,
    ArrowUpDown,
    CheckSquare
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RibbonProps {
    sheetName: string;
    onSheetNameChange: (name: string) => void;
    onStyleChange: (style: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        align?: "left" | "center" | "right";
        color?: string;
        backgroundColor?: string;
    }) => void;
    onAlignChange: (align: "left" | "center" | "right") => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onExport: () => void;
    onImport: (file: File) => void;
    onClear: () => void;
    onInsertRow: () => void;
    onDeleteRow: () => void;
    onInsertColumn: () => void;
    onDeleteColumn: () => void;
    onSort: () => void;
    onFilter: () => void;
    onFind: () => void;
    onDataValidation: () => void;
    onRemoveDuplicates?: () => void;
    onTextToColumns?: () => void;
    onInsertChart?: () => void;
    onInsertImage?: () => void;
}

const RibbonGroup = ({ children, label }: { children: React.ReactNode; label: string }) => (
    <div className="flex flex-col items-center px-2 border-r border-muted last:border-0 h-full justify-between py-1">
        <div className="flex items-center gap-1 flex-1">{children}</div>
        <span className="text-[10px] text-muted-foreground mt-1 select-none">{label}</span>
    </div>
);

const RibbonButton = ({
    icon: Icon,
    label,
    onClick,
    tooltip,
    shortcut,
    variant = "ghost",
    size = "sm"
}: {
    icon: any;
    label?: string;
    onClick?: () => void;
    tooltip: string;
    shortcut?: string;
    variant?: "ghost" | "outline" | "secondary";
    size?: "sm" | "icon";
}) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={variant}
                    size={label ? "sm" : "icon"}
                    className={label ? "h-8 flex flex-col gap-0 px-2 min-w-[40px]" : "h-8 w-8"}
                    onClick={onClick}
                >
                    <Icon className="h-4 w-4" />
                    {label && <span className="text-[10px]">{label}</span>}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                <p>{tooltip} {shortcut && <span className="text-muted-foreground ml-1">({shortcut})</span>}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export const Ribbon = ({
    sheetName,
    onSheetNameChange,
    onStyleChange,
    onAlignChange,
    onUndo,
    onRedo,
    onSave,
    onExport,
    onImport,
    onClear,
    onInsertRow,
    onDeleteRow,
    onInsertColumn,
    onDeleteColumn,
    onSort,
    onFilter,
    onFind,
    onDataValidation,
    onRemoveDuplicates,
    onTextToColumns,
    onInsertChart,
    onInsertImage
}: RibbonProps) => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
    };

    return (
        <div className="border-b bg-background select-none">
            <Tabs defaultValue="home" className="w-full">
                <div className="flex items-center bg-muted/30 px-4 pt-1">
                    <TabsList className="bg-transparent h-8 space-x-1 p-0">
                        <TabsTrigger value="file" className="px-3 h-7 data-[state=active]:bg-background data-[state=active]:border-b-0 rounded-t-sm rounded-b-none text-xs">File</TabsTrigger>
                        <TabsTrigger value="home" className="px-3 h-7 data-[state=active]:bg-background data-[state=active]:border-b-0 rounded-t-sm rounded-b-none text-xs">Home</TabsTrigger>
                        <TabsTrigger value="insert" className="px-4 h-7 data-[state=active]:bg-background data-[state=active]:border-b-0 rounded-t-sm rounded-b-none text-xs">Insert</TabsTrigger>
                        <TabsTrigger value="formulas" className="px-3 h-7 data-[state=active]:bg-background data-[state=active]:border-b-0 rounded-t-sm rounded-b-none text-xs">Formulas</TabsTrigger>
                        <TabsTrigger value="data" className="px-3 h-7 data-[state=active]:bg-background data-[state=active]:border-b-0 rounded-t-sm rounded-b-none text-xs">Data</TabsTrigger>
                    </TabsList>
                    <div className="ml-auto flex items-center gap-2 pb-1">
                        <input
                            className="text-xs font-medium bg-transparent hover:bg-muted/50 rounded px-2 h-6 w-32 outline-none border-b border-transparent focus:border-primary transition-colors"
                            value={sheetName}
                            onChange={(e) => onSheetNameChange(e.target.value)}
                        />
                        <Separator orientation="vertical" className="h-4" />
                        <RibbonButton icon={Save} tooltip="Save" shortcut="Ctrl+S" onClick={onSave} />
                        <RibbonButton icon={RotateCcw} tooltip="Undo" shortcut="Ctrl+Z" onClick={onUndo} />
                        <RibbonButton icon={RotateCw} tooltip="Redo" shortcut="Ctrl+Y" onClick={onRedo} />
                    </div>
                </div>

                <div className="h-20 bg-background px-4 py-1 flex overflow-x-auto">
                    <TabsContent value="file" className="m-0 h-full flex items-center gap-2">
                        <RibbonGroup label="Actions">
                            <RibbonButton icon={Save} label="Save" tooltip="Save current work" shortcut="Ctrl+S" onClick={onSave} />
                            <RibbonButton icon={Download} label="Export" tooltip="Export to Excel" onClick={onExport} />
                            <div className="relative">
                                <RibbonButton icon={Upload} label="Import" tooltip="Import from Excel" onClick={() => { }} />
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept=".xlsx,.xls,.csv" />
                            </div>
                            <RibbonButton icon={Trash2} label="Clear" tooltip="Clear entire sheet" onClick={onClear} />
                        </RibbonGroup>
                    </TabsContent>

                    <TabsContent value="home" className="m-0 h-full flex items-center gap-2">
                        <RibbonGroup label="Undo">
                            <RibbonButton icon={RotateCcw} tooltip="Undo" shortcut="Ctrl+Z" onClick={onUndo} />
                            <RibbonButton icon={RotateCw} tooltip="Redo" shortcut="Ctrl+Y" onClick={onRedo} />
                        </RibbonGroup>

                        <RibbonGroup label="Font">
                            <div className="grid grid-cols-3 gap-1">
                                <RibbonButton icon={Bold} tooltip="Bold" shortcut="Ctrl+B" onClick={() => onStyleChange({ bold: true })} />
                                <RibbonButton icon={Italic} tooltip="Italic" shortcut="Ctrl+I" onClick={() => onStyleChange({ italic: true })} />
                                <RibbonButton icon={Underline} tooltip="Underline" shortcut="Ctrl+U" onClick={() => onStyleChange({ underline: true })} />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <RibbonButton icon={Type} tooltip="Font Color" onClick={() => { }} />
                                <RibbonButton icon={Palette} tooltip="Fill Color" onClick={() => { }} />
                            </div>
                        </RibbonGroup>

                        <RibbonGroup label="Alignment">
                            <div className="grid grid-cols-3 gap-1">
                                <RibbonButton icon={AlignLeft} tooltip="Align Left" onClick={() => onAlignChange("left")} />
                                <RibbonButton icon={AlignCenter} tooltip="Align Center" onClick={() => onAlignChange("center")} />
                                <RibbonButton icon={AlignRight} tooltip="Align Right" onClick={() => onAlignChange("right")} />
                            </div>
                        </RibbonGroup>

                        <RibbonGroup label="Cells">
                            <div className="grid grid-cols-2 gap-1">
                                <RibbonButton icon={PlusSquare} label="Insert" tooltip="Insert row/column" onClick={onInsertRow} />
                                <RibbonButton icon={MinusSquare} label="Delete" tooltip="Delete row/column" onClick={onDeleteRow} />
                            </div>
                        </RibbonGroup>

                        <RibbonGroup label="Editing">
                            <RibbonButton icon={Search} label="Find" tooltip="Find and replace" onClick={onFind} />
                            <RibbonButton icon={CheckSquare} label="Validate" tooltip="Data validation" onClick={onDataValidation} />
                        </RibbonGroup>
                    </TabsContent>

                    <TabsContent value="insert" className="m-0 h-full flex items-center gap-2">
                        <RibbonGroup label="Tables">
                            <RibbonButton icon={TableIcon} label="Table" tooltip="Create table" onClick={() => { }} />
                        </RibbonGroup>
                        <RibbonGroup label="Charts">
                            <RibbonButton icon={PieChart} label="Chart" tooltip="Insert chart" onClick={onInsertChart} />
                        </RibbonGroup>
                        <RibbonGroup label="Illustrations">
                            <div className="relative">
                                <RibbonButton icon={Palette} label="Pictures" tooltip="Insert Picture" onClick={() => { }} />
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onInsertImage} accept="image/*" />
                            </div>
                        </RibbonGroup>
                    </TabsContent>

                    <TabsContent value="formulas" className="m-0 h-full flex items-center gap-2">
                        <RibbonGroup label="Function Library">
                            <RibbonButton icon={Sigma} label="AutoSum" tooltip="Sum of selected cells" onClick={() => { }} />
                        </RibbonGroup>
                    </TabsContent>

                    <TabsContent value="data" className="m-0 h-full flex items-center gap-2">
                        <RibbonGroup label="Sort & Filter">
                            <RibbonButton icon={ArrowUpDown} label="Sort" tooltip="Sort selection" onClick={onSort} />
                            <RibbonButton icon={Filter} label="Filter" tooltip="Filter data" onClick={onFilter} />
                        </RibbonGroup>
                        <RibbonGroup label="Data Tools">
                            <RibbonButton icon={Trash2} label="Remove Duplicates" tooltip="Remove Duplicates" onClick={onRemoveDuplicates} />
                            <RibbonButton icon={Type} label="Text to Columns" tooltip="Text to Columns" onClick={onTextToColumns} />
                        </RibbonGroup>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};
