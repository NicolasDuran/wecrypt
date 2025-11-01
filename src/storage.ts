// -----------------------------
// Minimal IndexedDB helpers
// -----------------------------
const DB_NAME = "wecrypt-db";
const DB_STORE = "kv";

async function idbOpen() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(DB_STORE)) {
				db.createObjectStore(DB_STORE);
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
	return idbOpen().then(
		(db) =>
			new Promise((resolve, reject) => {
				const tx = db.transaction(DB_STORE, "readonly");
				const store = tx.objectStore(DB_STORE);
				const req = store.get(key);
				req.onsuccess = () => resolve(req.result as T | undefined);
				req.onerror = () => reject(req.error);
			}),
	);
}

export async function idbSet<T = unknown>(
	key: string,
	value: T,
): Promise<void> {
	return idbOpen().then(
		(db) =>
			new Promise((resolve, reject) => {
				const tx = db.transaction(DB_STORE, "readwrite");
				const store = tx.objectStore(DB_STORE);
				const req = store.put(value, key);
				req.onsuccess = () => resolve();
				req.onerror = () => reject(req.error);
			}),
	);
}
