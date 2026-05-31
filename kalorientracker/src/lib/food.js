// Gemeinsame Helfer rund um Lebensmittel & Mahlzeiten (rein, client + server).

/** Tagesabschnitte für Einträge. */
export const MEAL_TYPES = [
	{ value: 'fruehstueck', label: 'Frühstück', icon: 'sunrise' },
	{ value: 'mittagessen', label: 'Mittagessen', icon: 'sun' },
	{ value: 'abendessen', label: 'Abendessen', icon: 'moon' },
	{ value: 'snack', label: 'Snack', icon: 'cookie' }
];

export const MEAL_TYPE_VALUES = MEAL_TYPES.map((t) => t.value);

/** Einheiten für Lebensmittel (Nährwerte je 100). */
export const FOOD_UNITS = ['g', 'ml'];

export function mealTypeLabel(value) {
	return MEAL_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function defaultMealType(hour) {
	if (hour < 10) return 'fruehstueck';
	if (hour < 14) return 'mittagessen';
	if (hour < 17) return 'snack';
	return 'abendessen';
}

/** Skaliert Nährwerte (je 100 g/ml) auf eine konkrete Menge. */
export function scaleNutrition(per100, amount) {
	const factor = (Number(amount) || 0) / 100;
	return {
		calories: Math.round((Number(per100.caloriesPer100) || 0) * factor),
		protein: Math.round((Number(per100.proteinPer100) || 0) * factor),
		carbs: Math.round((Number(per100.carbsPer100) || 0) * factor),
		fat: Math.round((Number(per100.fatPer100) || 0) * factor)
	};
}

/** Summiert die Nährwerte einer Mahlzeit aus ihren Zutaten (je mit per-100 + amount). */
export function mealTotals(items) {
	return (items ?? []).reduce(
		(acc, item) => {
			const n = scaleNutrition(item, item.amount);
			acc.calories += n.calories;
			acc.protein += n.protein;
			acc.carbs += n.carbs;
			acc.fat += n.fat;
			return acc;
		},
		{ calories: 0, protein: 0, carbs: 0, fat: 0 }
	);
}
