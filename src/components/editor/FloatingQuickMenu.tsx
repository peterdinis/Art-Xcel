"use client";

import React from "react";
import {
    LayoutDashboard,
    Save,
    Undo,
    Redo,
    HelpCircle,
    Plus,
    X,
    Settings,
    Download,
    Upload,
    FileSpreadsheet,
    Trash2,
    Printer,
    Share2,
    Copy,
    Scissors,
    ClipboardPaste,
    ZoomIn,
    ZoomOut,
    Grid3x3,
    Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UrlObject } from "url";

// ============ TYPES ============

type MenuItem = {
    icon: React.ElementType;
    label: string;
    color: string;
    href?: string;
    onClick?: () => void;
    shortcut?: string;
};

interface FloatingQuickMenuProps {
    onSave: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onHelp: () => void;
    onSettings: () => void;
    onExport?: () => void;
    onImport?: () => void;
    onNew?: () => void;
    onDelete?: () => void;
    onPrint?: () => void;
    onShare?: () => void;
    onCopy?: () => void;
    onCut?: () => void;
    onPaste?: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onToggleGrid?: () => void;
    onSelectAll?: () => void;
    onDashboard?: () => void;
    showExtraOptions?: boolean;
}

// ============ COMPONENT ============

export const FloatingQuickMenu = ({
    onSave,
    onUndo,
    onRedo,
    onHelp,
    onSettings,
    onExport,
    onImport,
    onNew,
    onDelete,
    onPrint,
    onShare,
    onCopy,
    onCut,
    onPaste,
    onZoomIn,
    onZoomOut,
    onToggleGrid,
    onSelectAll,
    onDashboard,
    showExtraOptions = false,
}: FloatingQuickMenuProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Hlavné menu položky (vždy zobrazené)
    const mainMenuItems: MenuItem[] = [
        { 
            icon: LayoutDashboard, 
            label: "Dashboard", 
            href: "/", 
            color: "bg-blue-500",
            onClick: onDashboard,
        },
        { 
            icon: Save, 
            label: "Save", 
            onClick: onSave, 
            color: "bg-green-500",
            shortcut: "Ctrl+S",
        },
        { 
            icon: Undo, 
            label: "Undo", 
            onClick: onUndo, 
            color: "bg-orange-500",
            shortcut: "Ctrl+Z",
        },
        { 
            icon: Redo, 
            label: "Redo", 
            onClick: onRedo, 
            color: "bg-purple-500",
            shortcut: "Ctrl+Y",
        },
        { 
            icon: Settings, 
            label: "Settings", 
            onClick: onSettings, 
            color: "bg-zinc-600",
        },
        { 
            icon: HelpCircle, 
            label: "Help", 
            onClick: onHelp, 
            color: "bg-indigo-500",
            shortcut: "F1",
        },
    ];

    // Rozšírené menu položky (voliteľné)
    const extraMenuItems: MenuItem[] = [
        ...(onNew ? [{ 
            icon: FileSpreadsheet, 
            label: "New", 
            onClick: onNew, 
            color: "bg-emerald-500",
            shortcut: "Ctrl+N",
        }] : []),
        ...(onExport ? [{ 
            icon: Download, 
            label: "Export", 
            onClick: onExport, 
            color: "bg-cyan-500",
            shortcut: "Ctrl+E",
        }] : []),
        ...(onImport ? [{ 
            icon: Upload, 
            label: "Import", 
            onClick: onImport, 
            color: "bg-amber-500",
            shortcut: "Ctrl+I",
        }] : []),
        ...(onCopy ? [{ 
            icon: Copy, 
            label: "Copy", 
            onClick: onCopy, 
            color: "bg-sky-500",
            shortcut: "Ctrl+C",
        }] : []),
        ...(onCut ? [{ 
            icon: Scissors, 
            label: "Cut", 
            onClick: onCut, 
            color: "bg-rose-500",
            shortcut: "Ctrl+X",
        }] : []),
        ...(onPaste ? [{ 
            icon: ClipboardPaste, 
            label: "Paste", 
            onClick: onPaste, 
            color: "bg-teal-500",
            shortcut: "Ctrl+V",
        }] : []),
        ...(onDelete ? [{ 
            icon: Trash2, 
            label: "Delete", 
            onClick: onDelete, 
            color: "bg-red-500",
            shortcut: "Del",
        }] : []),
        ...(onPrint ? [{ 
            icon: Printer, 
            label: "Print", 
            onClick: onPrint, 
            color: "bg-gray-500",
            shortcut: "Ctrl+P",
        }] : []),
        ...(onShare ? [{ 
            icon: Share2, 
            label: "Share", 
            onClick: onShare, 
            color: "bg-violet-500",
        }] : []),
        ...(onZoomIn ? [{ 
            icon: ZoomIn, 
            label: "Zoom In", 
            onClick: onZoomIn, 
            color: "bg-lime-500",
            shortcut: "Ctrl+Plus",
        }] : []),
        ...(onZoomOut ? [{ 
            icon: ZoomOut, 
            label: "Zoom Out", 
            onClick: onZoomOut, 
            color: "bg-yellow-500",
            shortcut: "Ctrl+Minus",
        }] : []),
        ...(onToggleGrid ? [{ 
            icon: Grid3x3, 
            label: "Toggle Grid", 
            onClick: onToggleGrid, 
            color: "bg-stone-500",
        }] : []),
        ...(onSelectAll ? [{ 
            icon: Table, 
            label: "Select All", 
            onClick: onSelectAll, 
            color: "bg-fuchsia-500",
            shortcut: "Ctrl+A",
        }] : []),
    ];

    // Kombinované menu podľa nastavenia
    const menuItems = showExtraOptions 
        ? [...mainMenuItems, ...extraMenuItems]
        : mainMenuItems;

    const handleItemClick = (item: MenuItem) => {
        if (item.onClick) {
            item.onClick();
        }
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-12 right-6 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-2"
                    >
                        {menuItems.map((item, index) => (
                            <TooltipProvider key={item.label} delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {item.href ? (
                                            <Link 
                                                href={item.href as unknown as UrlObject}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Button
                                                    size="icon"
                                                    className={cn(
                                                        "h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform text-white",
                                                        item.color
                                                    )}
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button
                                                size="icon"
                                                className={cn(
                                                    "h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform text-white",
                                                    item.color
                                                )}
                                                onClick={() => handleItemClick(item)}
                                            >
                                                <item.icon className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="flex items-center gap-2">
                                        <span>{item.label}</span>
                                        {item.shortcut && (
                                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                {item.shortcut}
                                            </span>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
                    isOpen 
                        ? "bg-muted hover:bg-muted/80 dark:bg-zinc-700 rotate-45 text-foreground" 
                        : "bg-primary text-primary-foreground hover:scale-105"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
        </div>
    );
};