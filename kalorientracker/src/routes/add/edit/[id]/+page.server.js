import { getTemplate, updateTemplate, deleteTemplate } from '$lib/server/db.js';
import { error, redirect, fail } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const template = await getTemplate(locals.user.id, params.id);
	if (!template) {
		error(404, 'Vorlage nicht gefunden');
	}
	return { template };
}

export const actions = {
	update: async ({ request, params, locals }) => {
		const data = await request.formData();

		const name = data.get('name')?.trim();
		const calories = Number(data.get('calories'));
		const protein = Number(data.get('protein') || 0);
		const carbs = Number(data.get('carbs') || 0);
		const fat = Number(data.get('fat') || 0);

		const values = { name, calories, protein, carbs, fat };

		if (!name) {
			return fail(400, { error: 'Bitte einen Namen angeben.', values });
		}
		if (!calories || isNaN(calories) || calories <= 0) {
			return fail(400, { error: 'Bitte eine gültige Kalorienzahl eingeben.', values });
		}

		try {
			await updateTemplate(locals.user.id, params.id, { name, calories, protein, carbs, fat });
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Fehler beim Aktualisieren. Bitte erneut versuchen.', values });
		}

		redirect(303, '/add');
	},

	delete: async ({ params, locals }) => {
		try {
			await deleteTemplate(locals.user.id, params.id);
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Fehler beim Löschen.' });
		}
		redirect(303, '/add');
	}
};
