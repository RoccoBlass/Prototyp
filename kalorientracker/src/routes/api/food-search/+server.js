import { json, error } from '@sveltejs/kit';

// Primär die neue Such-Engine von Open Food Facts (bessere Relevanz, zuverlässiger),
// Fallback auf die ältere Such-API. Beides ohne API-Key.
const SAL_URL = 'https://search.openfoodfacts.org/search';
const LEGACY_URL = 'https://ch.openfoodfacts.org/cgi/search.pl';
const USER_AGENT = 'Kalorientracker/1.0 (Prototyping-Projekt; Kontakt via App)';
const OFF_FIELDS = 'code,product_name,product_name_de,brands,nutriments,countries_tags';
const PREFERRED_COUNTRIES = ['switzerland', 'germany', 'austria'];

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

/** Wandelt ein OFF-Produkt in unser Format (je 100 g); null wenn unbrauchbar. */
function mapProduct(p) {
	const name = String(p.product_name_de || p.product_name || '').trim();
	if (!name) return null;
	const kcal = kcalFrom(p.nutriments);
	if (kcal == null) return null;

	const n = p.nutriments ?? {};
	const countries = (p.countries_tags ?? []).map((c) => String(c).replace('en:', ''));
	const brand = p.brands ? String(p.brands).split(',')[0].trim() : '';
	const withBrand = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} · ${brand}` : name;

	return {
		offId: p.code ?? null,
		name: withBrand,
		unit: 'g',
		caloriesPer100: kcal,
		proteinPer100: round1(n.proteins_100g),
		carbsPer100: round1(n.carbohydrates_100g),
		fatPer100: round1(n.fat_100g),
		local: countries.some((c) => PREFERRED_COUNTRIES.includes(c))
	};
}

async function searchSaL(q) {
	const params = new URLSearchParams({ q, langs: 'de', page_size: '40', fields: OFF_FIELDS });
	const res = await fetch(`${SAL_URL}?${params.toString()}`, { headers: { 'User-Agent': USER_AGENT } });
	if (!res.ok) throw new Error(`search-a-licious antwortete mit ${res.status}`);
	const data = await res.json();
	return data.hits ?? [];
}

async function searchLegacy(q) {
	const params = new URLSearchParams({
		search_terms: q,
		search_simple: '1',
		action: 'process',
		json: '1',
		page_size: '40',
		lc: 'de',
		fields: OFF_FIELDS
	});
	const res = await fetch(`${LEGACY_URL}?${params.toString()}`, { headers: { 'User-Agent': USER_AGENT } });
	if (!res.ok) throw new Error(`Open Food Facts antwortete mit ${res.status}`);
	const data = await res.json();
	return data.products ?? [];
}

export async function GET({ url, locals }) {
	if (!locals.user) {
		return json({ results: [] });
	}

	const q = (url.searchParams.get('q') ?? '').trim();
	if (q.length < 2) {
		return json({ results: [] });
	}

	let raw;
	try {
		raw = await searchSaL(q);
	} catch (primaryError) {
		console.error('Lebensmittel-Suche (primär) fehlgeschlagen, nutze Fallback:', primaryError);
		try {
			raw = await searchLegacy(q);
		} catch (fallbackError) {
			console.error('Lebensmittel-Suche (Fallback) fehlgeschlagen:', fallbackError);
			error(502, 'Lebensmittel-Datenbank momentan nicht erreichbar.');
		}
	}

	const mapped = raw.map(mapProduct).filter(Boolean);

	// Stabil nach-ranken: Produkte aus DE/CH/AT zuerst, Relevanzreihenfolge sonst erhalten.
	const results = mapped
		.slice()
		.sort((a, b) => (a.local === b.local ? 0 : a.local ? -1 : 1))
		.slice(0, 20)
		.map(({ local, ...rest }) => rest);

	return json({ results });
}
