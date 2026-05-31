import { json, error } from '@sveltejs/kit';

// Schweizer Subdomain + lc=de liefert deutsche Produktnamen und europäische Produkte.
const OFF_URL = 'https://ch.openfoodfacts.org/cgi/search.pl';

/** Wandelt ein Open-Food-Facts-Produkt in unser Lebensmittel-Format (je 100 g). */
function mapProduct(p) {
	// deutschen Produktnamen bevorzugen, sonst den Standardnamen
	const name = String(p.product_name_de || p.product_name || '').trim();
	if (!name) return null;

	const n = p.nutriments ?? {};
	let kcal = Number(n['energy-kcal_100g']);
	if (!Number.isFinite(kcal) || kcal <= 0) {
		const kj = Number(n['energy-kj_100g'] ?? n['energy_100g']);
		if (Number.isFinite(kj) && kj > 0) kcal = kj / 4.184;
	}
	if (!Number.isFinite(kcal) || kcal <= 0) return null;

	const round1 = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v) * 10) / 10 : 0);
	const brand = p.brands ? String(p.brands).split(',')[0].trim() : '';

	return {
		offId: p.code ?? null,
		name: brand ? `${name} · ${brand}` : name,
		unit: 'g',
		caloriesPer100: Math.round(kcal),
		proteinPer100: round1(n.proteins_100g),
		carbsPer100: round1(n.carbohydrates_100g),
		fatPer100: round1(n.fat_100g)
	};
}

export async function GET({ url, locals }) {
	if (!locals.user) {
		return json({ results: [] });
	}

	const q = (url.searchParams.get('q') ?? '').trim();
	if (q.length < 2) {
		return json({ results: [] });
	}

	const params = new URLSearchParams({
		search_terms: q,
		search_simple: '1',
		action: 'process',
		json: '1',
		page_size: '20',
		lc: 'de',
		fields: 'code,product_name,product_name_de,brands,nutriments'
	});

	let data;
	try {
		const res = await fetch(`${OFF_URL}?${params.toString()}`, {
			headers: { 'User-Agent': 'Kalorientracker/1.0 (Prototyping-Projekt; Kontakt via App)' }
		});
		if (!res.ok) throw new Error(`Open Food Facts antwortete mit ${res.status}`);
		data = await res.json();
	} catch (err) {
		console.error('Open Food Facts Abfrage fehlgeschlagen:', err);
		error(502, 'Lebensmittel-Datenbank momentan nicht erreichbar.');
	}

	const results = (data.products ?? []).map(mapProduct).filter(Boolean).slice(0, 20);
	return json({ results });
}
