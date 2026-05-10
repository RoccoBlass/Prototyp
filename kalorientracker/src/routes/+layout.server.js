import { getCalorieGoal } from '$lib/server/db.js';

export async function load() {
	const calorieGoal = await getCalorieGoal();
	return { calorieGoal };
}
