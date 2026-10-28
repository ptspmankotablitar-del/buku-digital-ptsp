import { useState, useEffect, useCallback } from 'react';
import { 
  getPendingOfflineQueue, 
  syncOfflineEntriesWithServer, 
  cacheGuestsToIndexedDB,
  OfflineQueueItem 
} from '../utils/offlineStorage';
import { GuestEntry } from '../types/ptsp';

export function useOfflineSync(
  guests: GuestEntry[], 
  onGuestsSynced?: (newGuests: GuestEntry[]) => void
) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingQueue, setPendingQueue] = useState<OfflineQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Refresh pending count from IndexedDB
  const refreshPendingCount = useCallback(async () => {
    try {
      const items = await getPendingOfflineQueue();
      setPendingQueue(items);
    } catch {
      // Ignore
    }
  }, []);

  // Cache guests whenever guests state updates
  useEffect(() => {
    if (guests && guests.length > 0) {
      cacheGuestsToIndexedDB(guests);
    }
  }, [guests]);

  // Execute sync
  const performSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncOfflineEntriesWithServer((syncedGuests) => {
        if (onGuestsSynced && syncedGuests.length > 0) {
          onGuestsSynced(syncedGuests);
        }
      });

      if (result.count > 0) {
        setSyncToast(`Sinkronisasi Berhasil: ${result.count} data tamu offline berhasil disinkronkan ke sistem.`);
        setTimeout(() => setSyncToast(null), 6000);
      }
      await refreshPendingCount();
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, onGuestsSynced, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      // Automatically sync when internet is restored
      performSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check for pending queue items
    const interval = setInterval(refreshPendingCount, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [performSync, refreshPendingCount]);

  return {
    isOnline,
    pendingCount: pendingQueue.length,
    pendingQueue,
    isSyncing,
    syncToast,
    triggerManualSync: performSync,
    refreshPendingCount,
    dismissSyncToast: () => setSyncToast(null)
  };
}
