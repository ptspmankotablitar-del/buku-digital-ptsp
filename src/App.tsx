import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GuestbookForm } from './components/GuestbookForm';
import { QueueDisplay } from './components/QueueDisplay';
import { TicketStatusChecker } from './components/TicketStatusChecker';
import { ServicesCatalog } from './components/ServicesCatalog';
import { SatisfactionSurvey } from './components/SatisfactionSurvey';
import { AdminDashboard } from './components/AdminDashboard';
import { DigitalCardModal } from './components/DigitalCardModal';
import { Footer } from './components/Footer';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { useOfflineSync } from './hooks/useOfflineSync';
import { getCachedGuestsFromIndexedDB } from './utils/offlineStorage';

import { GuestEntry, LoketInfo, SurveyResponse, TicketStatus, ServiceType } from './types/ptsp';
import { INITIAL_GUESTS, INITIAL_LOKETS, INITIAL_SURVEYS } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('guestbook');

  // Local storage persistence
  const [guests, setGuests] = useState<GuestEntry[]>(() => {
    try {
      const saved = localStorage.getItem('ptsp_blitar_guests');
      return saved ? JSON.parse(saved) : INITIAL_GUESTS;
    } catch {
      return INITIAL_GUESTS;
    }
  });

  const [lokets, setLokets] = useState<LoketInfo[]>(() => {
    try {
      const saved = localStorage.getItem('ptsp_blitar_lokets');
      return saved ? JSON.parse(saved) : INITIAL_LOKETS;
    } catch {
      return INITIAL_LOKETS;
    }
  });

  const [surveys, setSurveys] = useState<SurveyResponse[]>(() => {
    try {
      const saved = localStorage.getItem('ptsp_blitar_surveys');
      return saved ? JSON.parse(saved) : INITIAL_SURVEYS;
    } catch {
      return INITIAL_SURVEYS;
    }
  });

  const [activeModalGuest, setActiveModalGuest] = useState<GuestEntry | null>(null);
  const [surveyTargetGuest, setSurveyTargetGuest] = useState<GuestEntry | null>(null);
  const [preselectedService, setPreselectedService] = useState<ServiceType | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ptsp_blitar_guests', JSON.stringify(guests));
    } catch {
      // Ignore if localStorage unavailable
    }
  }, [guests]);

  useEffect(() => {
    try {
      localStorage.setItem('ptsp_blitar_lokets', JSON.stringify(lokets));
    } catch {
      // Ignore
    }
  }, [lokets]);

  useEffect(() => {
    try {
      localStorage.setItem('ptsp_blitar_surveys', JSON.stringify(surveys));
    } catch {
      // Ignore
    }
  }, [surveys]);

  // Fast QR Scan URL Auto-Detection: When someone scans the QR code, it opens ?ticket=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scannedTicket = params.get('ticket');
    if (scannedTicket) {
      const match = guests.find(
        (g) => g.ticketNumber.toUpperCase() === scannedTicket.trim().toUpperCase()
      );
      if (match) {
        setActiveModalGuest(match);
      }
    }
  }, [guests]);

  // Offline Sync and IndexedDB Management
  const {
    isOnline,
    pendingCount,
    isSyncing,
    syncToast,
    triggerManualSync,
    dismissSyncToast
  } = useOfflineSync(guests, (syncedGuests) => {
    setGuests((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newItems = syncedGuests.filter((g) => !existingIds.has(g.id));
      return [...newItems, ...prev];
    });
  });

  // On initial load, verify and restore any offline cached guests from IndexedDB
  useEffect(() => {
    getCachedGuestsFromIndexedDB()
      .then((cached) => {
        if (cached && cached.length > 0) {
          setGuests((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const missing = cached.filter((c) => !existingIds.has(c.id));
            if (missing.length > 0) {
              return [...missing, ...prev];
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Handlers
  const handleAddNewGuest = (newGuest: GuestEntry) => {
    setGuests((prev) => [newGuest, ...prev]);
  };

  const handleUpdateGuestStatus = (
    guestId: string,
    status: TicketStatus,
    loketId?: number,
    notes?: string
  ) => {
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id === guestId) {
          return {
            ...g,
            status,
            loketId: loketId !== undefined ? loketId : g.loketId,
            notes: notes !== undefined ? notes : g.notes
          };
        }
        return g;
      })
    );
  };

  const handleUpdateLoket = (loketId: number, currentTicket: string | undefined) => {
    setLokets((prev) =>
      prev.map((l) => {
        if (l.id === loketId) {
          return { ...l, currentTicket };
        }
        return l;
      })
    );
  };

  const handleAddSurvey = (newSurvey: SurveyResponse) => {
    setSurveys((prev) => [newSurvey, ...prev]);
  };

  const handleSelectServiceFromCatalog = (serviceTitle: ServiceType) => {
    setPreselectedService(serviceTitle);
    setActiveTab('guestbook');
  };

  const waitingCount = guests.filter((g) => g.status === 'Menunggu').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Official Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        waitingCount={waitingCount}
        isOnline={isOnline}
        pendingCount={pendingCount}
      />

      {/* Offline Connectivity & IndexedDB Auto-Sync Banner */}
      <OfflineSyncBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        syncToast={syncToast}
        onTriggerSync={triggerManualSync}
        onDismissToast={dismissSyncToast}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'guestbook' && (
          <GuestbookForm
            onSuccessSubmit={handleAddNewGuest}
            openDigitalCard={(guest) => setActiveModalGuest(guest)}
            initialService={preselectedService}
            clearInitialService={() => setPreselectedService(null)}
          />
        )}

        {activeTab === 'queue' && (
          <QueueDisplay
            lokets={lokets}
            guests={guests}
            onCallTicket={(ticketNumber, loket, guestName) => {
              handleUpdateLoket(loket.id, ticketNumber);
            }}
            openDigitalCard={(guest) => setActiveModalGuest(guest)}
          />
        )}

        {activeTab === 'check-status' && (
          <TicketStatusChecker
            guests={guests}
            openDigitalCard={(guest) => setActiveModalGuest(guest)}
            openSurveyWithGuest={(guest) => {
              setSurveyTargetGuest(guest);
              setActiveTab('survey');
            }}
          />
        )}

        {activeTab === 'services' && (
          <ServicesCatalog onSelectServiceToBook={handleSelectServiceFromCatalog} />
        )}

        {activeTab === 'survey' && (
          <SatisfactionSurvey
            surveys={surveys}
            onAddSurvey={handleAddSurvey}
            targetGuest={surveyTargetGuest}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            guests={guests}
            lokets={lokets}
            onUpdateGuestStatus={handleUpdateGuestStatus}
            onUpdateLoket={handleUpdateLoket}
            openDigitalCard={(guest) => setActiveModalGuest(guest)}
          />
        )}
      </main>

      {/* Official Footer */}
      <Footer />

      {/* Digital Card / Visitor Pass Modal */}
      <DigitalCardModal
        guest={activeModalGuest}
        onClose={() => setActiveModalGuest(null)}
        onGoToQueue={() => setActiveTab('queue')}
        onGoToSurvey={() => {
          setSurveyTargetGuest(activeModalGuest);
          setActiveTab('survey');
        }}
      />
    </div>
  );
}
