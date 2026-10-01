// "Where is Jake now?" endpoint. Vercel serves this file as /api/where; in local
// dev, vite.config.ts mounts handleWhere on the same path.
//
//   POST /api/where?key=…  Jake's phone checks in. With GPS ({ lat, lon } as JSON or query params, sent by
//                          the /?checkin= bookmark or MacroDroid) the place is resolved to barangay level;
//                          without GPS the request's IPv4 address is used, which is only good for the province.
//                          Only the place name is saved: never the coordinates or the IP.
//   GET  /api/where        BMO reads the last check-in: { place, country, at } or { place: null }.
//
// Storage is Upstash Redis over its REST API (Vercel Marketplace sets KV_REST_API_URL / _TOKEN).

const KEY = 'jake:location';
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

type Location = { place: string; country: string; at: number };
type WhereResult = { status: number; body: unknown };
type Header = (name: string) => string | undefined;
type Coords = { lat: number; lon: number };

const redis = async (command: string[]) => {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Location store is not configured (KV_REST_API_URL / KV_REST_API_TOKEN)');
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
};

const toCoords = (lat: unknown, lon: unknown): Coords | null => {
  const la = Number(lat), lo = Number(lon);
  return lat != null && lon != null && Number.isFinite(la) && Number.isFinite(lo) && Math.abs(la) <= 90 && Math.abs(lo) <= 180
    ? { lat: la, lon: lo } : null;
};

// Coordinates for the phone's IP: Vercel already geolocates every request, ipinfo.io is the fallback.
const ipCoordinates = async (ip: string, header: Header) => {
  const fromVercel = toCoords(header('x-vercel-ip-latitude'), header('x-vercel-ip-longitude'));
  if (fromVercel) return fromVercel;
  const info = await fetch(`https://ipinfo.io/${ip}/json`).then((r) => r.json()) as { loc?: string };
  const [lat, lon] = info.loc?.split(',') ?? [];
  return toCoords(lat, lon);
};

// OpenStreetMap leaves the province off the Philippines' independent cities (Cebu City, Mandaue…),
// so those are mapped by hand.
const PH_CITY_PROVINCE: Record<string, string> = {
  'Cebu City': 'Cebu', 'Mandaue': 'Cebu', 'Lapu-Lapu': 'Cebu', 'Lapu-Lapu City': 'Cebu',
  'Bacolod': 'Negros Occidental', 'Iloilo City': 'Iloilo', 'Tacloban': 'Leyte', 'Ormoc': 'Leyte',
  'Davao City': 'Davao del Sur', 'Cagayan de Oro': 'Misamis Oriental', 'Baguio': 'Benguet',
};

// Coordinates → place name via OpenStreetMap. In the Philippines the province comes back as `state` and the
// barangay as `suburb` (cities) or `village` (towns).
//   precise (GPS): "Brgy. Lahug, Cebu City, Cebu"     coarse (IP): "Cebu Province"
const placeName = async ({ lat, lon }: Coords, precise: boolean) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=${precise ? 18 : 10}&lat=${lat}&lon=${lon}`, {
    headers: { 'User-Agent': 'jake-portfolio-bmo/1.0 (https://profilio-e26e.vercel.app)', 'Accept-Language': 'en' },
  });
  const { address = {} } = await res.json() as { address?: Record<string, string> };
  const city = address.city || address.town || address.municipality;
  const ph = address.country_code === 'ph';
  const region = (ph ? address.state || (city && PH_CITY_PROVINCE[city]) : address.state) || address.region;

  let name: string | undefined;
  if (precise) {
    const barangay = address.suburb || address.village || address.quarter || address.neighbourhood;
    name = [barangay && (ph ? `Brgy. ${barangay}` : barangay), city, region].filter(Boolean).join(', ');
  } else {
    const province = ph && (address.state || (city && PH_CITY_PROVINCE[city]));
    name = province ? `${province} Province` : region || city;
  }
  return name && address.country ? { place: name, country: address.country } : null;
};

export async function handleWhere(method: string, key: string | null, gps: Coords | null, ip: string, header: Header): Promise<WhereResult> {
  try {
    if (method === 'GET') {
      const saved = await redis(['GET', KEY]);
      return { status: 200, body: typeof saved === 'string' ? JSON.parse(saved) : { place: null } };
    }
    if (method !== 'POST') return { status: 405, body: { error: 'Method not allowed' } };

    const secret = process.env.LOCATION_SECRET;
    if (!secret || key !== secret) return { status: 401, body: { error: 'Unauthorized' } };
    if (!gps && !IPV4.test(ip)) return { status: 400, body: { error: `Check-in without GPS needs an IPv4 address, got "${ip}"` } };

    const coords = gps ?? await ipCoordinates(ip, header);
    const found = coords && await placeName(coords, !!gps);
    if (!found) return { status: 502, body: { error: 'Could not find that place' } };

    const location: Location = { ...found, at: Date.now() };
    await redis(['SET', KEY, JSON.stringify(location)]);
    return { status: 200, body: location };
  } catch (err) {
    console.error('Where request failed', err);
    return { status: 500, body: { error: 'Location lookup failed' } };
  }
}

const respond = async (request: Request) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null;
  const body = request.method === 'POST' ? await request.json().catch(() => ({})) as { lat?: unknown; lon?: unknown } : {};
  const gps = toCoords(body.lat ?? url.searchParams.get('lat'), body.lon ?? url.searchParams.get('lon'));
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const result = await handleWhere(request.method, key, gps, ip, (n) => request.headers.get(n) ?? undefined);
  return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
};

export const GET = respond;
export const POST = respond;
