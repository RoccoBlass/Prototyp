import { json, error } from '@sveltejs/kit';

// Open Food Facts: Produkt über den Barcode (kein API-Key nötig).
// Primär die Such-Engine search-a-licious (`q=code:<barcode>`) – sie ist von der
// Cloudflare-Runtime aus erreichbar (wie die Lebensmittelsuche). Als Fallback der
// direkte Produkt-Endpunkt auf `world.` (klappt z. B. lokal/Node).
const SAL_URL = 'https://search.openfoodfacts.org/search';
const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';
const USER_AGENT = 'Kalorientracker/1.0 (Prototyping-Projekt; Kontakt via App)';
const FIELDS = 'code,product_name,product_name_de,brands,nutriments';

function kcalFrom(n = {}) {
	let kcal = Number(n['energy-kcal_100g']);
	if (!Number.isFinite(kcal) || kcal <= 0) {
		const kj = Number(n['energy-kj_100g'] ?? n['energy_100g']);
		if (Number.isFinite(kj) && kj > 0) kcal = kj / 4.184;
	}
	return Number.isFinite(kcal) && kcal > 0 ? Math.round(kcal) : null;
}

function round1(value) {
	return Number.isFinite(Number(value)) ? Math.round(Number(value) * 10) / 10 : 0;
}

// Hartes Timeout: der `world.`-Host hängt auf der Cloudflare-Runtime, statt
// schnell zu scheitern – ohne Timeout liefe der Request in den Worker-Timeout (502).
function fetchJson(url) {
	return fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(5000) });
}

/** Holt das Produkt zum Barcode – erst über die Suche, dann über den Produkt-Endpunkt. */
async function fetchProduct(code) {
	// 1) search-a-licious: exakte Code-Suche
	try {
		const params = new URLSearchParams({ q: `code:${code}`, page_size: '1', fields: FIELDS });
		const res = await fetchJson(`${SAL_URL}?${params.toString()}`);
		if (res.ok) {
			const data = await res.json();
			const hit = (data.hits ?? [])[0];
			if (hit) return hit;
		}
	} catch {
		// ignorieren – Fallback versuchen
	}
	// 2) Direkter Produkt-Endpunkt (Fallback, v. a. lokal/Node)
	try {
		const res = await fetchJson(`${PRODUCT_URL}/${code}.json?fields=${FIELDS}`);
		if (res.ok) {
			const data = await res.json();
			if (data?.status === 1 && data.product) return data.product;
		}
	} catch {
		// ignorieren
	}
	return null;
}

export async function GET({ url, locals }) {
	if (!locals.user) {
		throw error(401, 'Nicht angemeldet.');
	}

	const code = (url.searchParams.get('code') ?? '').trim();
	if (!/^\d{8,14}$/.test(code)) {
		throw error(400, 'Kein gültiger Barcode.');
	}

	const p = await fetchProduct(code);
	const name = p ? String(p.product_name_de || p.product_name || '').trim() : '';
	const kcal = p ? kcalFrom(p.nutriments) : null;

	// Produkt unbekannt oder ohne brauchbare Nährwerte → 404, der Client bietet
	// dann manuelle Eingabe an.
	if (!p || !name || kcal == null) {
		throw error(404, 'Produkt nicht in der Datenbank gefunden.');
	}

	const n = p.nutriments ?? {};
	const brand = p.brands ? String(p.brands).split(',')[0].trim() : '';
	const withBrand = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} · ${brand}` : name;

	return json({
		code,
		name: withBrand.slice(0, 120),
		unit: 'g',
		caloriesPer100: kcal,
		proteinPer100: round1(n.proteins_100g),
		carbsPer100: round1(n.carbohydrates_100g),
		fatPer100: round1(n.fat_100g)
	});
}
