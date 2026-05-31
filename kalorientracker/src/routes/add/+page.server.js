import { getTemplates, addEntryFromTemplate } from '$lib/server/db.js';
import { redirect, fail } from '@sveltejs/kit';

function getLocalDateStr() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function load({ locals }) {
	const templates = await getTemplates(locals.user.id);
	return { templates };
}

export const actions = {
	log: async ({ request, locals }) => {
		const data = await request.formData();
		const templateId = data.get('templateId');
		const mealType = data.get('mealType');

		if (!templateId) {
			return fail(400, { error: 'Bitte eine Vorlage auswählen.' });
		}
		if (!mealType) {
			return fail(400, { error: 'Bitte einen Mahlzeitentyp wählen.' });
		}

		try {
			await addEntryFromTemplate(locals.user.id, {
				templateId,
				mealType,
				date: getLocalDateStr()
			});
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'Fehler beim Erfassen. Bitte erneut versuchen.' });
		}

		redirect(303, '/?success=1');
	}
};
