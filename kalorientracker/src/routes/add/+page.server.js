import { fail, redirect } from '@sveltejs/kit';
import { getMeals, getFoods, addMealEntry, addFoodEntry } from '$lib/server/db.js';
import { MEAL_TYPE_VALUES } from '$lib/food.js';

function getLocalDateStr() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function load({ locals }) {
	const [meals, foods] = await Promise.all([
		getMeals(locals.user.id),
		getFoods(locals.user.id)
	]);
	return { meals, foods };
}

export const actions = {
	logMeal: async ({ request, locals }) => {
		const data = await request.formData();
		const mealId = String(data.get('mealId') ?? '');
		const mealType = String(data.get('mealType') ?? '');

		if (!/^[a-f0-9]{24}$/i.test(mealId)) {
			return fail(400, { error: 'Bitte eine Mahlzeit wählen.' });
		}
		if (!MEAL_TYPE_VALUES.includes(mealType)) {
			return fail(400, { error: 'Bitte einen Mahlzeitentyp wählen.' });
		}

		try {
			await addMealEntry(locals.user.id, { date: getLocalDateStr(), mealType, mealId });
		} catch (error) {
			console.error('Mahlzeit erfassen fehlgeschlagen:', error);
			return fail(500, { error: 'Fehler beim Erfassen. Bitte erneut versuchen.' });
		}
		redirect(303, '/?success=1');
	},

	logFood: async ({ request, locals }) => {
		const data = await request.formData();
		const mealType = String(data.get('mealType') ?? '');
		const name = String(data.get('name') ?? '')
			.trim()
			.slice(0, 120);
		const unit = data.get('unit') === 'ml' ? 'ml' : 'g';
		const amount = Number(data.get('amount'));
		const foodId = data.get('foodId');
		const caloriesPer100 = Number(data.get('caloriesPer100'));
		const proteinPer100 = Number(data.get('proteinPer100'));
		const carbsPer100 = Number(data.get('carbsPer100'));
		const fatPer100 = Number(data.get('fatPer100'));

		if (!name) {
			return fail(400, { error: 'Lebensmittel fehlt.' });
		}
		if (!MEAL_TYPE_VALUES.includes(mealType)) {
			return fail(400, { error: 'Bitte einen Mahlzeitentyp wählen.' });
		}
		if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) {
			return fail(400, { error: 'Bitte eine gültige Menge angeben.' });
		}
		if (![caloriesPer100, proteinPer100, carbsPer100, fatPer100].every(Number.isFinite)) {
			return fail(400, { error: 'Nährwerte fehlen.' });
		}

		try {
			await addFoodEntry(locals.user.id, {
				date: getLocalDateStr(),
				mealType,
				foodId: typeof foodId === 'string' ? foodId : null,
				name,
				unit,
				amount,
				caloriesPer100,
				proteinPer100,
				carbsPer100,
				fatPer100
			});
		} catch (error) {
			console.error('Lebensmittel erfassen fehlgeschlagen:', error);
			return fail(500, { error: 'Fehler beim Erfassen. Bitte erneut versuchen.' });
		}
		redirect(303, '/?success=1');
	}
};
