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
    MessageSquare,
    Settings,
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

interface FloatingQuickMenuProps {
    onSave: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onHelp: () => void;
    onSettings: () => void;
}

export const FloatingQuickMenu = ({
    onSave,
    onUndo,
    onRedo,
    onHelp,
    onSettings,
}: FloatingQuickMenuProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/", color: "bg-blue-500" },
        { icon: Save, label: "Save", onClick: onSave, color: "bg-green-500" },
        { icon: Undo, label: "Undo", onClick: onUndo, color: "bg-orange-500" },
        { icon: Redo, label: "Redo", onClick: onRedo, color: "bg-purple-500" },
        { icon: Settings, label: "Settings", onClick: onSettings, color: "bg-zinc-600" },
        { icon: HelpCircle, label: "Help", onClick: onHelp, color: "bg-indigo-500" },
    ];

    return (
        <div className="fixed bottom-12 right-6 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="flex flex-col gap-3"
                    >
                        {menuItems.map((item, index) => (
                            <TooltipProvider key={item.label} delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {item.href ? (
                                            <Link href={item.href as unknown as UrlObject}>
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
                                                onClick={() => {
                                                    item.onClick?.();
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <item.icon className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        <p>{item.label}</p>
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
                    isOpen ? "bg-muted hover:bg-muted/80 dark:bg-zinc-700 rotate-45 text-foreground" : "bg-primary text-primary-foreground hover:scale-105"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
        </div>
    );
};
