import { getMealsByDate, deleteMeal } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';

function getDateStr(daysAgo) {
	const d = new Date();
	d.setDate(d.getDate() - daysAgo);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function load() {
	const days = await Promise.all(
		Array.from({ length: 7 }, (_, i) => i).map(async (i) => {
			const date = getDateStr(i);
			const meals = await getMealsByDate(date);
			return {
				date,
				meals,
				totalCalories: meals.reduce((sum, m) => sum + (m.calories || 0), 0),
				totalProtein: meals.reduce((sum, m) => sum + (m.protein || 0), 0),
				totalCarbs: meals.reduce((sum, m) => sum + (m.carbs || 0), 0),
				totalFat: meals.reduce((sum, m) => sum + (m.fat || 0), 0)
			};
		})
	);
	return { days };
}

export const actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (id) {
			await deleteMeal(id);
		}
		redirect(303, '/history');
	}
};
