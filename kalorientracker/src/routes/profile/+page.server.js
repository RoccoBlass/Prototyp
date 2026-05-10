import { fail, redirect } from '@sveltejs/kit';
import { getCalorieGoal, setCalorieGoal } from '$lib/server/db.js';

export async function load() {
	const calorieGoal = await getCalorieGoal();
	return { calorieGoal };
}

export const actions = {
	updateGoal: async ({ request }) => {
		const data = await request.formData();
		const raw = data.get('calorieGoal');
		const goal = Number(raw);

		if (!Number.isFinite(goal) || goal < 500 || goal > 10000) {
			return fail(400, {
				error: 'Bitte einen Wert zwischen 500 und 10000 kcal angeben.',
				value: raw
			});
		}

		await setCalorieGoal(Math.round(goal));
		redirect(303, '/profile?success=1');
	}
};
