"use client";

import { useCallback, useEffect, useState } from "react";
import type { SheetData } from "@/hooks/use-spreadsheet";
import type { ShareSettings } from "@/components/shared/share-dialog";

const DB_NAME = "art-xcel-db";
const DB_VERSION = 1;
const STORE_NAME = "spreadsheets";
const LS_FILES_KEY = "excel-editor-files";
const LS_MIGRATED_KEY = "art-xcel-idb-migrated";

export interface SpreadsheetRecord {
	id: string;
	name: string;
	data: SheetData;
	shareSettings?: ShareSettings;
	lastModified: number;
	createdAt: number;
}

// ── Low-level IndexedDB helpers ─────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
				store.createIndex("lastModified", "lastModified", { unique: false });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function idbPut(record: SpreadsheetRecord): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).put(record);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

async function idbGet(id: string): Promise<SpreadsheetRecord | undefined> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const req = tx.objectStore(STORE_NAME).get(id);
		req.onsuccess = () => resolve(req.result as SpreadsheetRecord | undefined);
		req.onerror = () => reject(req.error);
	});
}

async function idbGetAll(): Promise<SpreadsheetRecord[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const req = tx.objectStore(STORE_NAME).getAll();
		req.onsuccess = () => resolve(req.result as SpreadsheetRecord[]);
		req.onerror = () => reject(req.error);
	});
}

async function idbDelete(id: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).delete(id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

// ── One-time migration from localStorage ────────────────────────────────────

async function migrateFromLocalStorage(): Promise<void> {
	if (typeof window === "undefined") return;
	if (localStorage.getItem(LS_MIGRATED_KEY) === "true") return;

	try {
		const stored = localStorage.getItem(LS_FILES_KEY);
		if (stored) {
			const records: SpreadsheetRecord[] = JSON.parse(stored);
			for (const record of records) {
				await idbPut({
					...record,
					createdAt: record.lastModified ?? Date.now(),
				});
			}
		}
		localStorage.setItem(LS_MIGRATED_KEY, "true");
	} catch {
		// Silently fail – migration is best-effort
	}
}

// ── React hook ───────────────────────────────────────────────────────────────

export function useSpreadsheetDB() {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		migrateFromLocalStorage().finally(() => setIsReady(true));
	}, []);

	const saveSpreadsheet = useCallback(
		async (
			record: Omit<SpreadsheetRecord, "createdAt"> & { createdAt?: number },
		) => {
			const existing = await idbGet(record.id);
			await idbPut({
				...record,
				createdAt: existing?.createdAt ?? record.createdAt ?? Date.now(),
				lastModified: Date.now(),
			});
		},
		[],
	);

	const loadSpreadsheet = useCallback(
		async (id: string): Promise<SpreadsheetRecord | undefined> => {
			return idbGet(id);
		},
		[],
	);

	const getAllSpreadsheets = useCallback(
		async (): Promise<SpreadsheetRecord[]> => {
			return idbGetAll();
		},
		[],
	);

	const deleteSpreadsheet = useCallback(async (id: string): Promise<void> => {
		return idbDelete(id);
	}, []);

	return {
		isReady,
		saveSpreadsheet,
		loadSpreadsheet,
		getAllSpreadsheets,
		deleteSpreadsheet,
	};
}
