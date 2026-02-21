"use server";

import { revalidatePath } from "next/cache";

export async function saveSpreadsheetAction(id: string, data: any) {
    // In a real app, you would save to a database here
    console.log(`Saving spreadsheet ${id} with ${Object.keys(data).length} cells`);

    // Simulate a database delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Trigger revalidation for this editor page
    revalidatePath(`/editor/${id}`);

    return { success: true, timestamp: new Date().toISOString() };
}

export async function clearSpreadsheetCache(id: string) {
    revalidatePath(`/editor/${id}`);
}
