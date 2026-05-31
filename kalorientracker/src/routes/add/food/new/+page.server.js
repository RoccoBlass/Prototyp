import { fail, redirect } from '@sveltejs/kit';
import { addFood } from '$lib/server/db.js';
import { readFood } from '$lib/server/foodInput.js';

export const actions = {
	save: async ({ request, locals }) => {
		const data = await request.formData();
		const parsed = readFood(data);
		if (parsed.error) {
			return fail(400, { error: parsed.error, values: parsed.values });
		}
		try {
			await addFood(locals.user.id, parsed.value);
		} catch (error) {
			console.error('Lebensmittel speichern fehlgeschlagen:', error);
			return fail(500, { error: 'Speichern fehlgeschlagen. Bitte erneut versuchen.', values: parsed.values });
		}
		redirect(303, '/add?tab=foods');
	}
};
