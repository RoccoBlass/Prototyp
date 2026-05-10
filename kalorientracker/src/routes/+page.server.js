import { getEntriesByDate, deleteEntry } from '$lib/server/db.js';

function getLocalDateStr() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function load() {
	const today = getLocalDateStr();
	const meals = await getEntriesByDate(today);
	return { meals, today };
}

export const actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (id) {
			await deleteEntry(id);
		}
		return { success: true };
	}
};
