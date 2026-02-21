"use client";

import React, { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { useExcelService } from "@/hooks/use-excel-service";
import { Spreadsheet } from "@/app/(dashboard)/page";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// Register the plugin
registerPlugin(FilePondPluginFileValidateType);

interface ExcelUploadProps {
    onUploadComplete: (newFile: Spreadsheet) => void;
}

export const ExcelUpload = ({ onUploadComplete }: ExcelUploadProps) => {
    const [files, setFiles] = useState<any[]>([]);
    const { importFromExcel } = useExcelService();
    const router = useRouter();

    const handleProcessFile = async (
        _fieldName: string,
        file: any,
        _metadata: any,
        load: any,
        error: any,
        _progress: any,
        _abort: any
    ) => {
        try {
            const result = await importFromExcel(file);

            const newId = crypto.randomUUID();
            const newFile: Spreadsheet = {
                id: newId,
                name: result.name || file.name.replace(/\.[^/.]+$/, ""),
                lastModified: Date.now(),
            };

            // Add the data directly to the new file record so the editor can load it
            const stored = localStorage.getItem("excel-editor-files");
            const allFiles = stored ? JSON.parse(stored) : [];
            const newFileWithData = { ...newFile, data: result.data };
            const updated = [newFileWithData, ...allFiles];
            localStorage.setItem("excel-editor-files", JSON.stringify(updated));

            // Notify parent
            onUploadComplete(newFile);

            // Success
            load(newId);
            toast.success("Excel file uploaded and parsed successfully!");

            // Redirect after a short delay
            setTimeout(() => {
                router.push(`/editor/${newId}`);
            }, 1000);

        } catch (err) {
            console.error("Failed to parse Excel file:", err);
            error("Error parsing file");
            toast.error("Failed to parse Excel file. Please make sure it's a valid .xlsx file.");
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto mb-10">
            <FilePond
                files={files}
                onupdatefiles={setFiles}
                allowMultiple={false}
                maxFiles={1}
                server={{
                    process: handleProcessFile
                }}
                name="excel-file"
                labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
                acceptedFileTypes={[
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel"
                ]}
                className="shadow-md rounded-lg"
            />
        </div>
    );
};
