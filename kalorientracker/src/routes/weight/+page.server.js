import { fail, redirect } from '@sveltejs/kit';
import {
	getWeightEntries,
	upsertWeight,
	deleteWeight,
	getLatestWeight,
	saveProfile
} from '$lib/server/db.js';
import { calculateTargets, LIMITS } from '$lib/nutrition.js';

function getLocalDateStr() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function load({ locals }) {
	const entries = await getWeightEntries(locals.user.id);
	return { entries, today: getLocalDateStr() };
}

export const actions = {
	log: async ({ request, locals }) => {
		const data = await request.formData();
		const weight = Number(data.get('weight'));
		const date = String(data.get('date') ?? '');

		if (!DATE_RE.test(date)) {
			return fail(400, { error: 'Bitte ein gültiges Datum wählen.' });
		}
		if (date > getLocalDateStr()) {
			return fail(400, { error: 'Das Datum darf nicht in der Zukunft liegen.' });
		}
		if (!Number.isFinite(weight) || weight < LIMITS.weight.min || weight > LIMITS.weight.max) {
			return fail(400, {
				error: `Bitte ein Gewicht zwischen ${LIMITS.weight.min} und ${LIMITS.weight.max} kg angeben.`
			});
		}

		try {
			await upsertWeight(locals.user.id, date, Math.round(weight * 10) / 10);
		} catch (error) {
			console.error('Gewicht speichern fehlgeschlagen:', error);
			return fail(500, { error: 'Speichern fehlgeschlagen. Bitte erneut versuchen.' });
		}

		redirect(303, '/weight?logged=1');
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const date = String(data.get('date') ?? '');
		if (DATE_RE.test(date)) {
			await deleteWeight(locals.user.id, date);
		}
		redirect(303, '/weight');
	},

	// Setzt das Profil-Gewicht auf das zuletzt getrackte und berechnet Kalorien/Makros neu.
	// Wird nur auf ausdrücklichen Wunsch ausgelöst – das normale Tracken ändert nichts.
	recalculate: async ({ locals }) => {
		const user = locals.user;
		if (!user.sex || !user.age || !user.height || !user.activityLevel || !user.goal) {
			return fail(400, { error: 'Bitte zuerst dein Profil vervollständigen.' });
		}

		const latest = await getLatestWeight(user.id);
		if (latest == null) {
			return fail(400, { error: 'Erfasse zuerst ein Gewicht.' });
		}

		const targets = calculateTargets({
			sex: user.sex,
			age: user.age,
			height: user.height,
			weight: latest,
			activityLevel: user.activityLevel,
			goal: user.goal
		});

		try {
			await saveProfile(user.id, {
				weight: latest,
				calorieGoal: targets.calorieGoal,
				proteinGoal: targets.proteinGoal,
				carbsGoal: targets.carbsGoal,
				fatGoal: targets.fatGoal
			});
		} catch (error) {
			console.error('Neuberechnung fehlgeschlagen:', error);
			return fail(500, { error: 'Neuberechnung fehlgeschlagen. Bitte erneut versuchen.' });
		}

		redirect(303, '/weight?recalculated=1');
	}
};
