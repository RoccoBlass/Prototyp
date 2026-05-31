import { fail, redirect, error } from '@sveltejs/kit';
import { getFoods, getMeal, updateMeal, deleteMeal } from '$lib/server/db.js';
import { readMeal } from '$lib/server/mealInput.js';

export async function load({ params, locals }) {
	const meal = await getMeal(locals.user.id, params.id);
	if (!meal) {
		error(404, 'Mahlzeit nicht gefunden');
	}
	const foods = await getFoods(locals.user.id);
	return { meal, foods };
}

export const actions = {
	save: async ({ request, params, locals }) => {
		const data = await request.formData();
		const parsed = readMeal(data);
		if (parsed.error) {
			return fail(400, { error: parsed.error });
		}
		try {
			await updateMeal(locals.user.id, params.id, parsed.value);
		} catch (error) {
			console.error('Mahlzeit aktualisieren fehlgeschlagen:', error);
			return fail(500, { error: 'Aktualisieren fehlgeschlagen. Bitte erneut versuchen.' });
		}
		redirect(303, '/add?tab=meals');
	},

	delete: async ({ params, locals }) => {
		try {
			await deleteMeal(locals.user.id, params.id);
		} catch (error) {
			console.error('Mahlzeit löschen fehlgeschlagen:', error);
			return fail(500, { error: 'Löschen fehlgeschlagen.' });
		}
		redirect(303, '/add?tab=meals');
	}
};
