// use-spreadsheet-db.ts
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { localStorageCollectionOptions } from "@tanstack/db";
import type { SheetData, CommentData } from "@/hooks/use-spreadsheet";
import type { ShareSettings } from "@/components/shared/share-dialog";

export interface SpreadsheetRecord {
	id: string;
	name: string;
	data: SheetData;
	comments?: CommentData[];
	shareSettings?: ShareSettings;
	lastModified: number;
	createdAt: number;
}

// ── TanStack DB Collection (module-level, singleton) ────────────────────────

const spreadsheetsCollection = createCollection(
	localStorageCollectionOptions<SpreadsheetRecord, string>({
		storageKey: "art-xcel-spreadsheets",
		getKey: (item) => item.id,
	}),
);

// ── One-time migration z IndexedDB ──────────────────────────────────────────

const LS_MIGRATED_KEY = "art-xcel-idb-migrated";
const DB_NAME = "art-xcel-db";
const STORE_NAME = "spreadsheets";

async function migrateFromIndexedDB(): Promise<void> {
	if (typeof window === "undefined") return;
	if (localStorage.getItem(LS_MIGRATED_KEY) === "true") return;

	try {
		const records = await new Promise<SpreadsheetRecord[]>(
			(resolve, reject) => {
				const request = indexedDB.open(DB_NAME, 1);
				request.onsuccess = () => {
					const db = request.result;
					if (!db.objectStoreNames.contains(STORE_NAME)) {
						resolve([]);
						return;
					}
					const tx = db.transaction(STORE_NAME, "readonly");
					const req = tx.objectStore(STORE_NAME).getAll();
					req.onsuccess = () => resolve(req.result as SpreadsheetRecord[]);
					req.onerror = () => reject(req.error);
				};
				request.onerror = () => resolve([]); // IDB neexistuje, nič na migráciu
			},
		);

		for (const record of records) {
			spreadsheetsCollection.insert(record);
		}

		localStorage.setItem(LS_MIGRATED_KEY, "true");
	} catch {
		// Migrácia je best-effort, potichu zlyháme
	}
}

// ── React hook ───────────────────────────────────────────────────────────────

export function useSpreadsheetDB() {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		migrateFromIndexedDB().finally(() => setIsReady(true));
	}, []);

	// Live query — reaktívne sa aktualizuje pri každej zmene v kolekcii
	const { data: spreadsheets } = useLiveQuery((q) =>
		q.from({ s: spreadsheetsCollection }),
	);

	const saveSpreadsheet = useCallback(
		async (
			record: Omit<SpreadsheetRecord, "createdAt"> & { createdAt?: number },
		) => {
			const existing = spreadsheetsCollection.get(record.id);
			const full: SpreadsheetRecord = {
				...record,
				createdAt: existing?.createdAt ?? record.createdAt ?? Date.now(),
				lastModified: Date.now(),
			};

			if (existing) {
				spreadsheetsCollection.update(record.id, (draft) => {
					Object.assign(draft, full);
				});
			} else {
				spreadsheetsCollection.insert(full);
			}
		},
		[],
	);

	const loadSpreadsheet = useCallback(
		async (id: string): Promise<SpreadsheetRecord | undefined> => {
			return spreadsheetsCollection.get(id);
		},
		[],
	);

	const getAllSpreadsheets = useCallback(async (): Promise<
		SpreadsheetRecord[]
	> => {
		return spreadsheets ?? [];
	}, [spreadsheets]);

	const deleteSpreadsheet = useCallback(async (id: string): Promise<void> => {
		spreadsheetsCollection.delete(id);
	}, []);

	return useMemo(
		() => ({
			isReady,
			spreadsheets,
			saveSpreadsheet,
			loadSpreadsheet,
			getAllSpreadsheets,
			deleteSpreadsheet,
		}),
		[
			isReady,
			spreadsheets,
			saveSpreadsheet,
			loadSpreadsheet,
			getAllSpreadsheets,
			deleteSpreadsheet,
		],
	);
}
