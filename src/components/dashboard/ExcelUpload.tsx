"use client";

import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { Spreadsheet } from "@/app/(dashboard)/page";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parseExcelAction } from "@/app/editor/[id]/actions";
import "filepond/dist/filepond.min.css";

// Register the plugin
registerPlugin(FilePondPluginFileValidateType);

interface SpreadsheetData {
	[cellId: string]: {
		value: string;
		formula: string;
		style?: Record<string, unknown>;
	};
}

interface ParseExcelResult {
	name: string;
	data: SpreadsheetData;
}

type LocalStorageSpreadsheet = Spreadsheet & {
	data?: SpreadsheetData;
};

interface ExcelUploadProps {
	onUploadComplete: (newFile: Spreadsheet & { data?: SpreadsheetData }) => void;
}

export const ExcelUpload = ({ onUploadComplete }: ExcelUploadProps) => {
	const [files, setFiles] = useState<(string | Blob)[]>([]);
	const router = useRouter();

	const handleProcessFile = async (
		_fieldName: string,
		file: File | Blob,
		_metadata: Record<string, unknown>,
		load: (id: string) => void,
		error: (errorText: string) => void,
		_progress: (
			isLengthComputable: boolean,
			progress: number,
			total: number,
		) => void,
		_abort: () => void,
	) => {
		if (!(file instanceof Blob)) {
			console.error("Invalid file object received from FilePond:", file);
			error("Invalid file object");
			toast.error("An error occurred during upload. Please try again.");
			return;
		}

		try {
			const formData = new FormData();
			formData.append("file", file);

			const result = (await parseExcelAction(formData)) as ParseExcelResult;

			// Get filename from file if it's a File object
			let fileName = "Uploaded Sheet";
			if (file instanceof File && file.name) {
				fileName = file.name.replace(/\.[^/.]+$/, "");
			}

			const newId = crypto.randomUUID();
			const newFile: Spreadsheet & { data?: SpreadsheetData } = {
				id: newId,
				name: result.name || fileName,
				lastModified: Date.now(),
				data: result.data, // Include data in the new file
			};

			// Add the data directly to the new file record so the editor can load it
			const stored = localStorage.getItem("excel-editor-files");
			const allFiles: LocalStorageSpreadsheet[] = stored
				? JSON.parse(stored)
				: [];
			const updated = [newFile, ...allFiles];
			localStorage.setItem("excel-editor-files", JSON.stringify(updated));

			// Notify parent immediately with complete file including data
			onUploadComplete(newFile);

			// Clear FilePond UI
			setFiles([]);

			// Show success toast
			toast.success("✅ Workbook uploaded successfully!", {
				description: `"${newFile.name}" has been added to your spreadsheets.`,
				duration: 4000,
			});

			// Success callback for FilePond
			load(newId);

			// Redirect after short delay
			setTimeout(() => {
				router.push(`/editor/${newId}`);
			}, 800);
		} catch (err) {
			console.error("Failed to parse Excel file:", err);
			error("Error parsing file");

			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			let friendlyMessage =
				"Failed to parse Excel file. Please make sure it's a valid .xlsx file.";

			if (
				errorMessage.includes("central directory") ||
				errorMessage.includes("Invalid file format")
			) {
				friendlyMessage =
					"Unsupported file format. Please use a modern .xlsx file (Legacy .xls are not supported).";
			}

			toast.error(friendlyMessage, {
				duration: 5000,
			});
		}
	};

	const serverConfig = {
		process: handleProcessFile,
	};

	return (
		<div className="w-full max-w-xl mx-auto mb-10">
			<FilePond
				files={files}
				onupdatefiles={(fileItems) => {
					setFiles(fileItems as unknown as (string | Blob)[]);
				}}
				allowMultiple={false}
				maxFiles={1}
				server={serverConfig}
				name="excel-file"
				labelIdle='Drag & Drop your Excel file (.xlsx) or <span class="filepond--label-action">Browse</span>'
				acceptedFileTypes={[
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					"application/vnd.ms-excel",
					"application/vnd.oasis.opendocument.spreadsheet",
					"text/csv",
				]}
				className="shadow-md rounded-lg"
			/>
		</div>
	);
};
