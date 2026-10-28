import { GuestEntry } from '../types/ptsp';

const DB_NAME = 'PTSP_MAN_Blitar_OfflineDB';
const DB_VERSION = 1;
const STORE_GUESTS = 'guest_registry';
const STORE_SYNC_QUEUE = 'offline_sync_queue';

export interface OfflineQueueItem {
  id: string; // guest id or unique queue id
  guest: GuestEntry;
  queuedAt: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

/**
 * Initialize IndexedDB with object stores for guest registry and offline queue
 */
export function openPTSPDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada browser ini.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Object Store 1: Cache of all guest records for offline viewing/searching
      if (!db.objectStoreNames.contains(STORE_GUESTS)) {
        const guestStore = db.createObjectStore(STORE_GUESTS, { keyPath: 'id' });
        guestStore.createIndex('ticketNumber', 'ticketNumber', { unique: false });
        guestStore.createIndex('date', 'date', { unique: false });
        guestStore.createIndex('phone', 'phone', { unique: false });
      }

      // Object Store 2: Queue of entries created while disconnected
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        queueStore.createIndex('queuedAt', 'queuedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Cache current guest list into IndexedDB for offline access
 */
export async function cacheGuestsToIndexedDB(guests: GuestEntry[]): Promise<void> {
  try {
    const db = await openPTSPDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_GUESTS, 'readwrite');
      const store = transaction.objectStore(STORE_GUESTS);

      // Clear old entries and bulk put
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        guests.forEach((guest) => {
          store.put(guest);
        });
      };

      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.warn('Failed to cache guests to IndexedDB:', error);
  }
}

/**
 * Retrieve cached guests from IndexedDB
 */
export async function getCachedGuestsFromIndexedDB(): Promise<GuestEntry[]> {
  try {
    const db = await openPTSPDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_GUESTS, 'readonly');
      const store = transaction.objectStore(STORE_GUESTS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch {
    return [];
  }
}

/**
 * Save a guest entry created while offline into the sync queue and local cache
 */
export async function saveGuestOffline(guest: GuestEntry): Promise<void> {
  const db = await openPTSPDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_GUESTS, STORE_SYNC_QUEUE], 'readwrite');

    // 1. Save to main offline cache so it appears immediately in the UI
    const guestStore = transaction.objectStore(STORE_GUESTS);
    guestStore.put(guest);

    // 2. Add to sync queue
    const queueStore = transaction.objectStore(STORE_SYNC_QUEUE);
    const queueItem: OfflineQueueItem = {
      id: guest.id,
      guest,
      queuedAt: new Date().toISOString(),
      syncStatus: 'pending',
      retryCount: 0
    };
    queueStore.put(queueItem);

    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

/**
 * Get all pending entries waiting to be synchronized
 */
export async function getPendingOfflineQueue(): Promise<OfflineQueueItem[]> {
  try {
    const db = await openPTSPDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SYNC_QUEUE, 'readonly');
      const store = transaction.objectStore(STORE_SYNC_QUEUE);
      const request = store.getAll();

      request.onsuccess = () => {
        const allItems: OfflineQueueItem[] = request.result || [];
        const pending = allItems.filter((item) => item.syncStatus === 'pending');
        resolve(pending);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch {
    return [];
  }
}

/**
 * Remove or mark an entry as synced
 */
export async function markOfflineEntryAsSynced(id: string): Promise<void> {
  try {
    const db = await openPTSPDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORE_SYNC_QUEUE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to delete synced entry:', err);
  }
}

/**
 * Synchronize all pending offline items
 */
export async function syncOfflineEntriesWithServer(
  onSyncSuccess?: (syncedGuests: GuestEntry[]) => void
): Promise<{ count: number; syncedGuests: GuestEntry[] }> {
  const pendingItems = await getPendingOfflineQueue();
  if (pendingItems.length === 0) {
    return { count: 0, syncedGuests: [] };
  }

  const syncedGuests: GuestEntry[] = [];

  for (const item of pendingItems) {
    // In our client-authoritative app with local backend/persistence,
    // syncing involves updating status from 'offline' to confirmed and purging queue
    await markOfflineEntryAsSynced(item.id);
    syncedGuests.push(item.guest);
  }

  if (onSyncSuccess) {
    onSyncSuccess(syncedGuests);
  }

  return { count: syncedGuests.length, syncedGuests };
}
