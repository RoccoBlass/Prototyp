import { fail, redirect } from '@sveltejs/kit';
import { getFoods, addMeal } from '$lib/server/db.js';
import { readMeal } from '$lib/server/mealInput.js';

export async function load({ locals }) {
	return { foods: await getFoods(locals.user.id) };
}

export const actions = {
	save: async ({ request, locals }) => {
		const data = await request.formData();
		const parsed = readMeal(data);
		if (parsed.error) {
			return fail(400, { error: parsed.error });
		}
		try {
			await addMeal(locals.user.id, parsed.value);
		} catch (error) {
			console.error('Mahlzeit speichern fehlgeschlagen:', error);
			return fail(500, { error: 'Speichern fehlgeschlagen. Bitte erneut versuchen.' });
		}
		redirect(303, '/add?tab=meals');
	}
};
