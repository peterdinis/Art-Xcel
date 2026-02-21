"use client";

import React, { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { Spreadsheet } from "@/app/(dashboard)/page";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parseExcelAction } from "@/app/editor/[id]/actions";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// Register the plugin
registerPlugin(FilePondPluginFileValidateType);

interface ExcelUploadProps {
    onUploadComplete: (newFile: Spreadsheet) => void;
}

export const ExcelUpload = ({ onUploadComplete }: ExcelUploadProps) => {
    const [files, setFiles] = useState<any[]>([]);
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
        // FilePond can sometimes pass a FilePond item instead of a raw file/blob
        const actualFile = file instanceof Blob ? file : (file as any).file;

        if (!actualFile || !(actualFile instanceof Blob)) {
            console.error("Invalid file object received from FilePond:", file);
            error("Invalid file object");
            toast.error("An error occurred during upload. Please try again.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", actualFile);

            const result = await parseExcelAction(formData);

            const newId = crypto.randomUUID();
            const newFile: Spreadsheet = {
                id: newId,
                name: result.name || (actualFile as any).name?.replace(/\.[^/.]+$/, "") || "Uploaded Sheet",
                lastModified: Date.now(),
            };

            // Add the data directly to the new file record so the editor can load it
            const stored = localStorage.getItem("excel-editor-files");
            const allFiles = stored ? JSON.parse(stored) : [];
            const newFileWithData = { ...newFile, data: result.data };
            const updated = [newFileWithData, ...allFiles];
            localStorage.setItem("excel-editor-files", JSON.stringify(updated));

            // Notify parent immediately to show in grid
            onUploadComplete(newFile);

            // Clear FilePond UI
            setFiles([]);

            // Show toast
            toast.success("Workbook uploaded!", {
                description: `"${newFile.name}" is now available.`,
            });

            // Success callback for FilePond
            load(newId);

            // Redirect after shorter delay
            setTimeout(() => {
                router.push(`/editor/${newId}`);
            }, 800);

        } catch (err) {
            console.error("Failed to parse Excel file:", err);
            error("Error parsing file");

            const msg = (err as Error).message;
            let friendlyMessage = "Failed to parse Excel file. Please make sure it's a valid .xlsx file.";

            if (msg.includes("central directory") || msg.includes("Invalid file format")) {
                friendlyMessage = "Unsupported file format. Please use a modern .xlsx file (Legacy .xls are not supported).";
            }

            toast.error(friendlyMessage);
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
                labelIdle='Drag & Drop your Excel file (.xlsx) or <span class="filepond--label-action">Browse</span>'
                acceptedFileTypes={[
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ]}
                className="shadow-md rounded-lg"
            />
        </div>
    );
};
