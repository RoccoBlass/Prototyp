import { json } from '@sveltejs/kit';
import { getEntriesByDate } from '$lib/server/db.js';
import { getCoachFeedback } from '$lib/server/coach.js';

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function getLocalDateStr() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Liefert ein kurzes KI-Coach-Feedback zum heutigen Tag.
 * Wird bewusst nur auf Klick aufgerufen (keine KI-Kosten im Hintergrund).
 * Die Tageswerte werden serverseitig aus der DB berechnet (nicht dem Client vertraut).
 */
export async function POST({ locals }) {
	if (!locals.user) {
		return json({ error: 'Nicht angemeldet.' }, { status: 401 });
	}

	const entries = await getEntriesByDate(locals.user.id, getLocalDateStr());
	const totals = entries.reduce(
		(acc, e) => ({
			calories: acc.calories + (e.calories || 0),
			protein: acc.protein + (e.protein || 0),
			carbs: acc.carbs + (e.carbs || 0),
			fat: acc.fat + (e.fat || 0)
		}),
		{ calories: 0, protein: 0, carbs: 0, fat: 0 }
	);

	try {
		const feedback = await getCoachFeedback({
			weekday: WEEKDAYS[new Date().getDay()],
			goal: {
				calorieGoal: locals.user.calorieGoal,
				proteinGoal: locals.user.proteinGoal,
				carbsGoal: locals.user.carbsGoal,
				fatGoal: locals.user.fatGoal
			},
			totals,
			mealCount: entries.length
		});
		return json({ feedback });
	} catch (error) {
		return json({ error: error.message }, { status: 502 });
	}
}
