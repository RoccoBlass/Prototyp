import { getEntriesForDates, deleteEntry } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';

function getDateStr(daysAgo) {
	const d = new Date();
	d.setDate(d.getDate() - daysAgo);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function load({ locals }) {
	const dates = Array.from({ length: 7 }, (_, i) => getDateStr(i));
	// Eine einzige DB-Abfrage für alle 7 Tage statt sieben einzelner.
	const entriesByDate = await getEntriesForDates(locals.user.id, dates);
	const days = entriesByDate.map(({ date, meals }) => ({
		date,
		meals,
		totalCalories: meals.reduce((sum, m) => sum + (m.calories || 0), 0),
		totalProtein: meals.reduce((sum, m) => sum + (m.protein || 0), 0),
		totalCarbs: meals.reduce((sum, m) => sum + (m.carbs || 0), 0),
		totalFat: meals.reduce((sum, m) => sum + (m.fat || 0), 0)
	}));
	return { days };
}

export const actions = {
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)) {
			await deleteEntry(locals.user.id, id);
		}
		redirect(303, '/history');
	}
};
