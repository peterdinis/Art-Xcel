import { Button } from "@/components/ui/button";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Save, Download, Upload, FileSpreadsheet, FileUp 
} from "lucide-react";
import { ShortcutsDropdown } from "@/components/shortcuts-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExcelService } from "@/hooks/use-excel-service";

interface ToolbarProps {
  onStyleChange: (style: { bold?: boolean; italic?: boolean; underline?: boolean; align?: 'left' | 'center' | 'right' }) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onSave: () => void;
}

export const Toolbar = ({ onStyleChange, onExport, onImport, onSave }: ToolbarProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="h-12 border-b flex items-center px-4 gap-2 bg-background">
      <div className="flex items-center gap-1 border-r pr-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSave}>
          <Save className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onExport}>
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
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStyleChange({ bold: true })}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStyleChange({ italic: true })}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStyleChange({ underline: true })}>
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