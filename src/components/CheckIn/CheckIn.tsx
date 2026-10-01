import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X } from 'lucide-react';

// Jake's home-screen bookmark: /?checkin=<LOCATION_SECRET>. Opening it sends the phone's GPS to
// api/where.ts so BMO can answer "where is Jake now?" down to the barangay. If location access is
// denied, it checks in by IP instead (province only). Visitors without the key never see this.

type Status = { state: 'working' | 'done' | 'failed'; text: string };

const gpsFix = () =>
  new Promise<{ lat: number; lon: number } | null>((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });

export default function CheckIn() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const key = url.searchParams.get('checkin');
    if (!key) return;
    // Drop the key from the address bar right away so it isn't copied or shared by accident.
    url.searchParams.delete('checkin');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);

    (async () => {
      setStatus({ state: 'working', text: 'Getting your GPS location…' });
      const gps = await gpsFix();
      setStatus({ state: 'working', text: gps ? 'Checking in…' : 'No GPS, checking in by IP…' });
      try {
        const res = await fetch(`/api/where?key=${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gps ?? {}),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) setStatus({ state: 'failed', text: 'Wrong check-in key.' });
        else if (!res.ok) setStatus({ state: 'failed', text: data.error || 'Check-in failed. Try again.' });
        else setStatus({
          state: 'done',
          text: `Checked in: ${data.place}, ${data.country}${gps ? '' : ' (IP only, allow location for your barangay)'}`,
        });
      } catch {
        setStatus({ state: 'failed', text: 'No connection. Try again.' });
      }
    })();
  }, []);

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          role="status"
          aria-live="polite"
          className={`fixed z-[70] top-4 left-1/2 -translate-x-1/2 w-[min(420px,calc(100vw-32px))] flex items-start gap-2.5 rounded-2xl border-[3px] border-bmo-ink px-4 py-3 text-sm font-semibold text-bmo-ink shadow-[4px_4px_0_rgba(23,4,20,0.35)] ${
            status.state === 'failed' ? 'bg-red-200' : status.state === 'done' ? 'bg-bmo' : 'bg-bmo-screen'
          }`}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
        >
          <MapPin size={18} className="shrink-0 mt-0.5" />
          <p className="flex-1 min-w-0 break-words">{status.text}</p>
          {status.state !== 'working' && (
            <button type="button" onClick={() => setStatus(null)} aria-label="Dismiss" className="shrink-0">
              <X size={18} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
