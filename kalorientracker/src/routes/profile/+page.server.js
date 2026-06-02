import { fail, redirect } from '@sveltejs/kit';
import { saveProfile } from '$lib/server/db.js';
import { caloriesFromMacros, getActivityLevel, getGoal, SEXES, LIMITS } from '$lib/nutrition.js';

const SEX_KEYS = SEXES.map((s) => s.key);

const MACRO_LIMITS = {
	proteinGoal: { min: 20, max: 500, label: 'Protein' },
	carbsGoal: { min: 0, max: 1000, label: 'Kohlenhydrate' },
	fatGoal: { min: 10, max: 400, label: 'Fett' }
};

function inRange(value, { min, max }) {
	return Number.isFinite(value) && value >= min && value <= max;
}

export async function load({ locals }) {
	return { user: locals.user };
}

export const actions = {
	updateProfile: async ({ request, locals }) => {
		const data = await request.formData();

		const name = String(data.get('name') ?? '')
			.trim()
			.slice(0, 60);
		const sex = String(data.get('sex') ?? '');
		const age = Number(data.get('age'));
		const height = Number(data.get('height'));
		const weight = Number(data.get('weight'));
		const activityLevel = String(data.get('activityLevel') ?? '');
		const goal = String(data.get('goal') ?? '');
		const proteinGoal = Number(data.get('proteinGoal'));
		const carbsGoal = Number(data.get('carbsGoal'));
		const fatGoal = Number(data.get('fatGoal'));
		const theme = data.get('theme') === 'light' ? 'light' : 'dark';

		const values = { name, sex, age, height, weight, activityLevel, goal, proteinGoal, carbsGoal, fatGoal, theme };

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
		for (const [key, limit] of Object.entries(MACRO_LIMITS)) {
			if (!inRange(values[key], limit)) {
				return fail(400, {
					error: `${limit.label}: Bitte einen Wert zwischen ${limit.min} und ${limit.max} g angeben.`,
					values
				});
			}
		}

		const macros = {
			proteinGoal: Math.round(proteinGoal),
			carbsGoal: Math.round(carbsGoal),
			fatGoal: Math.round(fatGoal)
		};

		try {
			await saveProfile(locals.user.id, {
				name,
				sex,
				age: Math.round(age),
				height: Math.round(height),
				weight: Math.round(weight * 10) / 10,
				activityLevel,
				goal,
				theme,
				...macros,
				calorieGoal: caloriesFromMacros(macros)
			});
		} catch (error) {
			console.error('Fehler beim Speichern der Einstellungen:', error);
			return fail(500, {
				error: 'Einstellungen konnten nicht gespeichert werden. Bitte erneut versuchen.',
				values
			});
		}

		redirect(303, '/profile?success=1');
	}
};
