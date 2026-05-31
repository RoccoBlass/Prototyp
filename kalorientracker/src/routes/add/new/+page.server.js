import { addTemplate, addEntryFromTemplate } from '$lib/server/db.js';
import { redirect, fail } from '@sveltejs/kit';

function getLocalDateStr() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const name = data.get('name')?.trim();
		const calories = Number(data.get('calories'));
		const protein = Number(data.get('protein') || 0);
		const carbs = Number(data.get('carbs') || 0);
		const fat = Number(data.get('fat') || 0);
		const logToday = data.get('logToday') === 'on';
		const mealType = data.get('mealType');

		const values = { name, calories, protein, carbs, fat, mealType, logToday };

		if (!name) {
			return fail(400, { error: 'Bitte einen Namen für die Mahlzeit eingeben.', values });
		}
		if (!calories || isNaN(calories) || calories <= 0) {
			return fail(400, { error: 'Bitte eine gültige Kalorienzahl eingeben.', values });
		}
		if (logToday && !mealType) {
			return fail(400, {
				error: 'Bitte einen Mahlzeitentyp auswählen, wenn du sie heute eintragen möchtest.',
				values
			});
		}

		try {
			const templateId = await addTemplate(locals.user.id, { name, calories, protein, carbs, fat });
			if (logToday) {
				await addEntryFromTemplate(locals.user.id, {
					templateId,
					mealType,
					date: getLocalDateStr()
				});
			}
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'Fehler beim Speichern. Bitte erneut versuchen.', values });
		}

		redirect(303, logToday ? '/?success=1' : '/add');
	}
};
