// Serverseitiges Einlesen & Validieren eines Lebensmittel-Formulars.

const PHOTO_MAX = 720_000; // ~540 KB Base64
const FIELDS = [
	['caloriesPer100', 'Kalorien', 0, 900],
	['proteinPer100', 'Protein', 0, 100],
	['carbsPer100', 'Kohlenhydrate', 0, 100],
	['fatPer100', 'Fett', 0, 100]
];

export function readFood(data) {
	const name = String(data.get('name') ?? '')
		.trim()
		.slice(0, 120);
	const unit = data.get('unit') === 'ml' ? 'ml' : 'g';
	const photoRaw = data.get('photo');
	const photo = typeof photoRaw === 'string' && photoRaw.startsWith('data:image/') ? photoRaw : null;

	// Rohwerte für das erneute Befüllen des Formulars bei Fehlern
	const values = {
		name,
		unit,
		photo,
		caloriesPer100: data.get('caloriesPer100'),
		proteinPer100: data.get('proteinPer100'),
		carbsPer100: data.get('carbsPer100'),
		fatPer100: data.get('fatPer100')
	};

	if (!name) {
		return { error: 'Bitte einen Namen angeben.', values };
	}

	const nums = {};
	for (const [key, label, min, max] of FIELDS) {
		const n = Number(data.get(key));
		if (!Number.isFinite(n) || n < min || n > max) {
			return { error: `${label}: Bitte einen Wert zwischen ${min} und ${max} angeben.`, values };
		}
		nums[key] = n;
	}

	if (photo && photo.length > PHOTO_MAX) {
		return { error: 'Das Foto ist zu groß. Bitte ein kleineres wählen.', values };
	}

	return {
		value: {
			name,
			unit,
			photo,
			caloriesPer100: Math.round(nums.caloriesPer100),
			proteinPer100: Math.round(nums.proteinPer100 * 10) / 10,
			carbsPer100: Math.round(nums.carbsPer100 * 10) / 10,
			fatPer100: Math.round(nums.fatPer100 * 10) / 10
		},
		values
	};
}
