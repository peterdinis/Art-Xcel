import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save, Download } from "lucide-react";
import { ShortcutsDropdown } from "@/components/shortcuts-dropdown";

interface ToolbarProps {
    onStyleChange: (style: { bold?: boolean; italic?: boolean; underline?: boolean; align?: 'left' | 'center' | 'right' }) => void;
}

export const Toolbar = ({ onStyleChange }: ToolbarProps) => {
    return (
        <div className="h-12 border-b flex items-center px-4 gap-2 bg-background">
            <div className="flex items-center gap-1 border-r pr-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Save className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-1 border-r pr-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStyleChange({ bold: true })}>
                    <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStyleChange({ italic: true })}>
                    <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Underline className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStyleChange({ align: 'left' })}>
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStyleChange({ align: 'center' })}>
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStyleChange({ align: 'right' })}>
                    <AlignRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-1 ml-auto">
                <ShortcutsDropdown />
            </div>
        </div>
    );
};
