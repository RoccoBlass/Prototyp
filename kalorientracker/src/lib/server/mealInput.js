// Serverseitiges Einlesen & Validieren eines Mahlzeiten-Formulars (Items als JSON).

function clamp(value, min, max) {
	const n = Number(value);
	if (!Number.isFinite(n)) return 0;
	return Math.min(max, Math.max(min, n));
}

export function readMeal(data) {
	const name = String(data.get('name') ?? '')
		.trim()
		.slice(0, 80);

	let items = [];
	try {
		const raw = JSON.parse(String(data.get('items') ?? '[]'));
		if (Array.isArray(raw)) items = raw;
	} catch {
		items = [];
	}

	if (!name) {
		return { error: 'Bitte einen Namen für die Mahlzeit angeben.' };
	}
	if (items.length === 0) {
		return { error: 'Bitte mindestens eine Zutat hinzufügen.' };
	}

	const clean = [];
	for (const it of items) {
		const itemName = String(it?.name ?? '')
			.trim()
			.slice(0, 120);
		const amount = Number(it?.amount);
		if (!itemName || !Number.isFinite(amount) || amount <= 0 || amount > 5000) {
			return { error: 'Eine Zutat hat ungültige Werte. Bitte prüfen.' };
		}
		clean.push({
			foodId: typeof it.foodId === 'string' ? it.foodId : null,
			name: itemName,
			unit: it.unit === 'ml' ? 'ml' : 'g',
			amount: Math.round(amount * 10) / 10,
			caloriesPer100: clamp(it.caloriesPer100, 0, 900),
			proteinPer100: clamp(it.proteinPer100, 0, 100),
			carbsPer100: clamp(it.carbsPer100, 0, 100),
			fatPer100: clamp(it.fatPer100, 0, 100)
		});
	}

	return { value: { name, items: clean } };
}
