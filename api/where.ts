// "Where is Jake now?" endpoint. Vercel serves this file as /api/where; in local
// dev, vite.config.ts mounts handleWhere on the same path.
//
//   POST /api/where?key=…  Jake's phone checks in (a MacroDroid HTTP Request on Android). The request's
//                          IPv4 address is geolocated to province level and only the place is saved;
//                          the IP itself is never stored.
//   GET  /api/where        BMO reads the last check-in: { place, country, at } or { place: null }.
//
// Storage is Upstash Redis over its REST API (Vercel Marketplace sets KV_REST_API_URL / _TOKEN).

const KEY = 'jake:location';
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

type Location = { place: string; country: string; at: number };
type WhereResult = { status: number; body: unknown };
type Header = (name: string) => string | undefined;

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

// Coordinates for the phone's IP: Vercel already geolocates every request, ipinfo.io is the fallback.
const coordinates = async (ip: string, header: Header) => {
  const lat = header('x-vercel-ip-latitude');
  const lon = header('x-vercel-ip-longitude');
  if (lat && lon) return { lat, lon };
  const info = await fetch(`https://ipinfo.io/${ip}/json`).then((r) => r.json()) as { loc?: string };
  const [ipLat, ipLon] = info.loc?.split(',') ?? [];
  return ipLat && ipLon ? { lat: ipLat, lon: ipLon } : null;
};

// OpenStreetMap leaves the province off the Philippines' independent cities (Cebu City, Mandaue…),
// so those are mapped by hand. Anything not listed falls back to the city or region name.
const PH_CITY_PROVINCE: Record<string, string> = {
  'Cebu City': 'Cebu', 'Mandaue': 'Cebu', 'Lapu-Lapu': 'Cebu', 'Lapu-Lapu City': 'Cebu',
  'Bacolod': 'Negros Occidental', 'Iloilo City': 'Iloilo', 'Tacloban': 'Leyte', 'Ormoc': 'Leyte',
  'Davao City': 'Davao del Sur', 'Cagayan de Oro': 'Misamis Oriental', 'Baguio': 'Benguet',
};

// Coordinates → "Cebu Province" via OpenStreetMap. In the Philippines the province comes back as `state`;
// elsewhere the state itself is the right level (e.g. "Western Australia").
const province = async (lat: string, lon: string) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${lat}&lon=${lon}`, {
    headers: { 'User-Agent': 'jake-portfolio-bmo/1.0 (https://profilio-e26e.vercel.app)', 'Accept-Language': 'en' },
  });
  const { address = {} } = await res.json() as { address?: Record<string, string> };
  const city = address.city || address.town || address.municipality;
  const name = address.country_code === 'ph'
    ? ((address.state || (city && PH_CITY_PROVINCE[city])) ? `${address.state || PH_CITY_PROVINCE[city!]} Province` : city || address.region)
    : address.state || address.region || city;
  return name && address.country ? { place: name, country: address.country } : null;
};

export async function handleWhere(method: string, key: string | null, ip: string, header: Header): Promise<WhereResult> {
  try {
    if (method === 'GET') {
      const saved = await redis(['GET', KEY]);
      return { status: 200, body: typeof saved === 'string' ? JSON.parse(saved) : { place: null } };
    }
    if (method !== 'POST') return { status: 405, body: { error: 'Method not allowed' } };

    const secret = process.env.LOCATION_SECRET;
    if (!secret || key !== secret) return { status: 401, body: { error: 'Unauthorized' } };
    if (!IPV4.test(ip)) return { status: 400, body: { error: `Check-in needs an IPv4 address, got "${ip}"` } };

    const coords = await coordinates(ip, header);
    const found = coords && await province(coords.lat, coords.lon);
    if (!found) return { status: 502, body: { error: 'Could not place that IP' } };

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
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const result = await handleWhere(request.method, key, ip, (n) => request.headers.get(n) ?? undefined);
  return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
};

export const GET = respond;
export const POST = respond;
