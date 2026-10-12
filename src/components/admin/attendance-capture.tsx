"use client";

import * as React from "react";
import { CheckIcon, WifiOffIcon, WifiIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------

const DB_NAME = "nimeche-attendance";
const STORE_MEMBERS = "members";
const STORE_QUEUE = "queue";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MEMBERS)) {
        db.createObjectStore(STORE_MEMBERS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, storeName: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

type QueueItemWithKey = QueueItem & { _key: number };

function idbGetAllWithKeys(
  db: IDBDatabase,
  storeName: string
): Promise<QueueItemWithKey[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const results: QueueItemWithKey[] = [];
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
      if (cursor) {
        results.push({ ...(cursor.value as QueueItem), _key: cursor.key as number });
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(db: IDBDatabase, storeName: string, key: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RegisteredMember = {
  id: string;
  fullName: string;
  email: string;
  matricNo: string | null;
};

type QueueItem = {
  memberId: string;
  clientEventId: string;
  checkedInAt: string;
  eventId: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AttendanceCapture({
  eventId,
  eventTitle,
  registeredMembers,
  initialAttended,
}: {
  eventId: string;
  eventTitle: string;
  registeredMembers: RegisteredMember[];
  initialAttended: string[];
}) {
  const [db, setDb] = React.useState<IDBDatabase | null>(null);
  const [checkedIn, setCheckedIn] = React.useState<Set<string>>(
    new Set(initialAttended)
  );
  const [queueCount, setQueueCount] = React.useState(0);
  const [syncing, setSyncing] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"registered" | "walkin">("registered");
  const [walkinSearch, setWalkinSearch] = React.useState("");
  const [walkinResult, setWalkinResult] = React.useState<{
    message: string;
    ok: boolean;
  } | null>(null);

  // ── Initialise DB and seed members store ─────────────────────────────────
  React.useEffect(() => {
    let isMounted = true;
    openDB().then(async (idb) => {
      if (!isMounted) return;
      setDb(idb);

      // Write all registered members to local store
      for (const m of registeredMembers) {
        await idbPut(idb, STORE_MEMBERS, m);
      }

      // Count any queued items from a previous session
      const queued = await idbGetAllWithKeys(idb, STORE_QUEUE);
      setQueueCount(queued.filter((q) => q.eventId === eventId).length);
    });

    return () => {
      isMounted = false;
    };
    // registeredMembers reference is stable (from server render); no deps needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // ── Online/offline detection ──────────────────────────────────────────────
  const isOnline = React.useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("online", onStoreChange);
      window.addEventListener("offline", onStoreChange);
      return () => {
        window.removeEventListener("online", onStoreChange);
        window.removeEventListener("offline", onStoreChange);
      };
    },
    () => navigator.onLine,
    () => true
  );

  // ── Sync function ─────────────────────────────────────────────────────────
  const sync = React.useCallback(async () => {
    if (!db || syncing) return;
    const allQueued = await idbGetAllWithKeys(db, STORE_QUEUE);
    const forThisEvent = allQueued.filter((q) => q.eventId === eventId);
    if (forThisEvent.length === 0) return;

    setSyncing(true);
    try {
      const response = await fetch(`/api/events/${eventId}/attendance/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: forThisEvent.map(({ memberId, clientEventId, checkedInAt }) => ({
            memberId,
            clientEventId,
            checkedInAt,
          })),
        }),
      });

      if (response.ok) {
        // Remove successfully synced items
        for (const item of forThisEvent) {
          await idbDelete(db, STORE_QUEUE, item._key);
        }
        setQueueCount(0);
      }
    } catch {
      // Network failed — will retry on next interval or online event
    } finally {
      setSyncing(false);
    }
  }, [db, syncing, eventId]);

  // ── Auto-sync: on online event + every 30s ────────────────────────────────
  React.useEffect(() => {
    const onOnline = () => {
      void sync();
    };
    window.addEventListener("online", onOnline);
    const interval = setInterval(() => {
      if (navigator.onLine) void sync();
    }, 30_000);
    return () => {
      window.removeEventListener("online", onOnline);
      clearInterval(interval);
    };
  }, [sync]);

  // ── Check-in handler ──────────────────────────────────────────────────────
  const handleCheckIn = React.useCallback(
    async (memberId: string) => {
      if (checkedIn.has(memberId)) return;

      // 1. Update UI immediately — no waiting for network
      setCheckedIn((prev) => new Set([...prev, memberId]));

      // 2. Write to IDB queue BEFORE any network call
      const item: QueueItem = {
        memberId,
        clientEventId: crypto.randomUUID(),
        checkedInAt: new Date().toISOString(),
        eventId,
      };

      if (db) {
        await idbPut(db, STORE_QUEUE, item);
        const allQueued = await idbGetAllWithKeys(db, STORE_QUEUE);
        setQueueCount(allQueued.filter((q) => q.eventId === eventId).length);
      }

      // 3. If online, attempt immediate sync — failure is silent
      if (navigator.onLine && db) {
        void sync();
      }
    },
    [checkedIn, db, eventId, sync]
  );

  // ── Filtered member list ──────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return registeredMembers;
    return registeredMembers.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.matricNo?.toLowerCase().includes(q) ?? false)
    );
  }, [registeredMembers, search]);

  // ── Walk-in check-in ─────────────────────────────────────────────────────
  const handleWalkin = React.useCallback(async () => {
    const q = walkinSearch.trim();
    if (!q) return;

    // Search from IDB members store (might include members from other events' syncs)
    if (db) {
      const allMembers = await idbGetAll<RegisteredMember>(db, STORE_MEMBERS);
      const match = allMembers.find(
        (m) =>
          m.fullName.toLowerCase().includes(q.toLowerCase()) ||
          (m.matricNo?.toLowerCase().includes(q.toLowerCase()) ?? false)
      );

      if (match) {
        await handleCheckIn(match.id);
        setWalkinResult({ message: `${match.fullName} checked in.`, ok: true });
        setWalkinSearch("");
      } else {
        setWalkinResult({
          message: "Member not found in local database. Try syncing or check the name.",
          ok: false,
        });
      }
    }
  }, [walkinSearch, db, handleCheckIn]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold">Attendance — {eventTitle}</h2>
          <p className="text-muted-foreground text-sm">
            {checkedIn.size} checked in of {registeredMembers.length} registered
          </p>
        </div>

        {/* Online / queue banner */}
        {queueCount > 0 ? (
          <div className="bg-accent-subtle text-accent-text flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium">
            <WifiOffIcon className="size-4 shrink-0" />
            {queueCount} check-in{queueCount !== 1 ? "s" : ""} queued, waiting for
            connection
          </div>
        ) : (
          <div className="bg-primary-subtle text-primary-text flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium">
            <WifiIcon className="size-4 shrink-0" />
            {isOnline ? "All synced" : "Offline — ready for check-ins"}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["registered", "walkin"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "min-h-[44px] px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-primary text-primary-text border-b-2 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "registered" ? "Registered members" : "Walk-in"}
          </button>
        ))}
      </div>

      {activeTab === "registered" && (
        <>
          {/* Search */}
          <Input
            type="search"
            placeholder="Filter by name or matric number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter members"
          />

          {/* Member list */}
          <ul className="divide-border divide-y rounded-lg border">
            {filtered.length === 0 && (
              <li className="text-muted-foreground px-4 py-6 text-center text-sm">
                No members match your search.
              </li>
            )}
            {filtered.map((member) => {
              const attended = checkedIn.has(member.id);
              return (
                <li
                  key={member.id}
                  className={cn(
                    "flex items-center justify-between gap-4 px-4 py-3",
                    attended && "bg-primary-subtle/30"
                  )}
                >
                  <div className="min-w-0">
                    <p className={cn("truncate text-sm font-medium", attended && "text-primary-text")}>
                      {member.fullName}
                    </p>
                    {member.matricNo && (
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {member.matricNo}
                      </p>
                    )}
                  </div>
                  {attended ? (
                    <span
                      className="bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-md"
                      aria-label="Checked in"
                    >
                      <CheckIcon className="size-5" />
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleCheckIn(member.id)}
                      className="min-h-[44px] shrink-0"
                    >
                      Check in
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {activeTab === "walkin" && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Search for a member not in the registered list to register and check them in.
          </p>
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Name or matric number…"
              value={walkinSearch}
              onChange={(e) => setWalkinSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleWalkin();
              }}
              className="flex-1"
              aria-label="Walk-in member search"
            />
            <Button
              type="button"
              onClick={() => void handleWalkin()}
              className="min-h-[44px] shrink-0"
            >
              Check in walk-in
            </Button>
          </div>
          {walkinResult && (
            <p
              className={cn(
                "text-sm font-medium",
                walkinResult.ok ? "text-primary-text" : "text-danger"
              )}
            >
              {walkinResult.message}
            </p>
          )}
        </div>
      )}

      {/* Manual sync button */}
      {queueCount > 0 && isOnline && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void sync()}
          disabled={syncing}
        >
          {syncing ? "Syncing…" : `Sync ${queueCount} queued check-in${queueCount !== 1 ? "s" : ""}`}
        </Button>
      )}
    </div>
  );
}
