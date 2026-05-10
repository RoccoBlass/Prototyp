import { addMeal } from '$lib/server/db.js';
import { redirect, fail } from '@sveltejs/kit';

function getLocalDateStr() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const name = data.get('name')?.trim();
		const calories = Number(data.get('calories'));
		const protein = Number(data.get('protein') || 0);
		const carbs = Number(data.get('carbs') || 0);
		const fat = Number(data.get('fat') || 0);
		const mealType = data.get('mealType');

		if (!name) {
			return fail(400, { error: 'Bitte einen Namen für die Mahlzeit eingeben.', values: { name, calories, protein, carbs, fat, mealType } });
		}
		if (!calories || isNaN(calories) || calories <= 0) {
			return fail(400, { error: 'Bitte eine gültige Kalorienzahl eingeben.', values: { name, calories, protein, carbs, fat, mealType } });
		}
		if (!mealType) {
			return fail(400, { error: 'Bitte einen Mahlzeitentyp auswählen.', values: { name, calories, protein, carbs, fat, mealType } });
		}

		try {
			await addMeal({ name, calories, protein, carbs, fat, mealType, date: getLocalDateStr() });
		} catch {
			return fail(500, { error: 'Fehler beim Speichern. Bitte erneut versuchen.', values: { name, calories, protein, carbs, fat, mealType } });
		}

		redirect(303, '/?success=1');
	}
};
