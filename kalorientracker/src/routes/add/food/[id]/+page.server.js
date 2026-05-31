import { fail, redirect, error } from '@sveltejs/kit';
import { getFood, updateFood, deleteFood } from '$lib/server/db.js';
import { readFood } from '$lib/server/foodInput.js';

export async function load({ params, locals }) {
	const food = await getFood(locals.user.id, params.id);
	if (!food) {
		error(404, 'Lebensmittel nicht gefunden');
	}
	return { food };
}

export const actions = {
	save: async ({ request, params, locals }) => {
		const data = await request.formData();
		const parsed = readFood(data);
		if (parsed.error) {
			return fail(400, { error: parsed.error, values: parsed.values });
		}
		try {
			await updateFood(locals.user.id, params.id, parsed.value);
		} catch (error) {
			console.error('Lebensmittel aktualisieren fehlgeschlagen:', error);
			return fail(500, { error: 'Aktualisieren fehlgeschlagen. Bitte erneut versuchen.', values: parsed.values });
		}
		redirect(303, '/add?tab=foods');
	},

	delete: async ({ params, locals }) => {
		try {
			await deleteFood(locals.user.id, params.id);
		} catch (error) {
			console.error('Lebensmittel löschen fehlgeschlagen:', error);
			return fail(500, { error: 'Löschen fehlgeschlagen.' });
		}
		redirect(303, '/add?tab=foods');
	}
};
