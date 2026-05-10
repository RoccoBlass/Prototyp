import { getMealsByDate, deleteMeal } from '$lib/server/db.js';

function getLocalDateStr() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function load() {
	const today = getLocalDateStr();
	const meals = await getMealsByDate(today);
	return { meals, today };
}

export const actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (id) {
			await deleteMeal(id);
		}
		return { success: true };
	}
};
