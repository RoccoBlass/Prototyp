import { redirect, fail } from '@sveltejs/kit';
import { calculateTargets, getActivityLevel, getGoal, SEXES, LIMITS } from '$lib/nutrition.js';
import { saveProfile } from '$lib/server/db.js';

const SEX_KEYS = SEXES.map((s) => s.key);

function inRange(value, { min, max }) {
	return Number.isFinite(value) && value >= min && value <= max;
}

export async function load({ locals }) {
	if (locals.user?.onboarded) {
		redirect(303, '/');
	}
	return {};
}

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const sex = String(data.get('sex') ?? '');
		const age = Number(data.get('age'));
		const height = Number(data.get('height'));
		const weight = Number(data.get('weight'));
		const activityLevel = String(data.get('activityLevel') ?? '');
		const goal = String(data.get('goal') ?? '');

		const values = { sex, age, height, weight, activityLevel, goal };

		if (!SEX_KEYS.includes(sex)) {
			return fail(400, { error: 'Bitte ein Geschlecht wählen.', values });
		}
		if (!inRange(age, LIMITS.age)) {
			return fail(400, { error: `Bitte ein Alter zwischen ${LIMITS.age.min} und ${LIMITS.age.max} Jahren angeben.`, values });
		}
		if (!inRange(height, LIMITS.height)) {
			return fail(400, { error: `Bitte eine Größe zwischen ${LIMITS.height.min} und ${LIMITS.height.max} cm angeben.`, values });
		}
		if (!inRange(weight, LIMITS.weight)) {
			return fail(400, { error: `Bitte ein Gewicht zwischen ${LIMITS.weight.min} und ${LIMITS.weight.max} kg angeben.`, values });
		}
		if (!getActivityLevel(activityLevel)) {
			return fail(400, { error: 'Bitte ein Aktivitätsniveau wählen.', values });
		}
		if (!getGoal(goal)) {
			return fail(400, { error: 'Bitte ein Ziel wählen.', values });
		}

		const ageR = Math.round(age);
		const heightR = Math.round(height);
		const weightR = Math.round(weight * 10) / 10;
		const targets = calculateTargets({ sex, age: ageR, height: heightR, weight: weightR, activityLevel, goal });

		try {
			await saveProfile(locals.user.id, {
				sex,
				age: ageR,
				height: heightR,
				weight: weightR,
				activityLevel,
				goal,
				calorieGoal: targets.calorieGoal,
				proteinGoal: targets.proteinGoal,
				carbsGoal: targets.carbsGoal,
				fatGoal: targets.fatGoal,
				onboardedAt: new Date()
			});
		} catch (error) {
			console.error('Onboarding speichern fehlgeschlagen:', error);
			return fail(500, { error: 'Speichern fehlgeschlagen. Bitte erneut versuchen.', values });
		}

		redirect(303, '/?welcome=1');
	}
};
