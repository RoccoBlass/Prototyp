import { getEntriesByDate, deleteEntry, getDailyCalorieTotals } from '$lib/server/db.js';

function dateStr(daysAgo) {
	const d = new Date();
	d.setDate(d.getDate() - daysAgo);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function load({ locals }) {
	const today = dateStr(0);
	// Letzte 7 Tage für den Mini-Trend (ältester zuerst, heute zuletzt).
	const trendDates = Array.from({ length: 7 }, (_, i) => dateStr(6 - i));
	const [meals, trend] = await Promise.all([
		getEntriesByDate(locals.user.id, today),
		getDailyCalorieTotals(locals.user.id, trendDates)
	]);
	return { meals, today, trend };
}

export const actions = {
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)) {
			await deleteEntry(locals.user.id, id);
		}
		return { success: true };
	}
};
