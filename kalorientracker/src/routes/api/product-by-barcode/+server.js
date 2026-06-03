import { json, error } from '@sveltejs/kit';

// Open Food Facts: Produkt direkt über den Barcode (keine API-Key nötig).
const OFF_PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';
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

export async function GET({ url, locals }) {
	if (!locals.user) {
		throw error(401, 'Nicht angemeldet.');
	}

	const code = (url.searchParams.get('code') ?? '').trim();
	if (!/^\d{8,14}$/.test(code)) {
		throw error(400, 'Kein gültiger Barcode.');
	}

	let data;
	try {
		const res = await fetch(`${OFF_PRODUCT_URL}/${code}.json?fields=${FIELDS}`, {
			headers: { 'User-Agent': USER_AGENT }
		});
		if (!res.ok) throw new Error(`OFF antwortete mit ${res.status}`);
		data = await res.json();
	} catch (err) {
		console.error('Barcode-Lookup fehlgeschlagen:', err);
		throw error(502, 'Lebensmittel-Datenbank momentan nicht erreichbar.');
	}

	const p = data?.product;
	const name = p ? String(p.product_name_de || p.product_name || '').trim() : '';
	const kcal = p ? kcalFrom(p.nutriments) : null;

	// Produkt unbekannt oder ohne brauchbare Nährwerte → 404, der Client bietet
	// dann manuelle Eingabe an.
	if (data?.status !== 1 || !name || kcal == null) {
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
