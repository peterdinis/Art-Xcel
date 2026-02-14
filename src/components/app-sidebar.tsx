"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Trash2, Settings, Home } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function AppSidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "All Files", icon: Home },
        { href: "/trash", label: "Trash", icon: Trash2 },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="w-64 border-r bg-muted/40 h-screen flex flex-col">
            <div className="h-16 flex items-center px-6 border-b font-semibold text-lg text-primary gap-2">
                <FileSpreadsheet className="h-6 w-6" />
                <span>Excel Editor</span>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link key={link.href} href={link.href} className="block">
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-2", isActive && "bg-secondary")}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Button>
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t">
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium">Theme</span>
                    <ModeToggle />
                </div>
            </div>
        </div>
    );
}
