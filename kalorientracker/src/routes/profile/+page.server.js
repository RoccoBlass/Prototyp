import { fail, redirect } from '@sveltejs/kit';
import { getSettings, saveSettings } from '$lib/server/db.js';

export async function load() {
	const settings = await getSettings();
	return { settings };
}

const NUMERIC_FIELDS = [
	{ name: 'calorieGoal', label: 'Kalorienziel', min: 500, max: 10000 },
	{ name: 'proteinGoal', label: 'Protein-Ziel', min: 10, max: 500 },
	{ name: 'carbsGoal', label: 'Kohlenhydrate-Ziel', min: 10, max: 1000 },
	{ name: 'fatGoal', label: 'Fett-Ziel', min: 5, max: 400 }
];

export const actions = {
	updateProfile: async ({ request }) => {
		const data = await request.formData();

		const name = String(data.get('name') ?? '').trim().slice(0, 60);
		const values = { name };

		for (const field of NUMERIC_FIELDS) {
			const raw = data.get(field.name);
			const num = Number(raw);
			if (!Number.isFinite(num) || num < field.min || num > field.max) {
				return fail(400, {
					error: `${field.label}: Bitte einen Wert zwischen ${field.min} und ${field.max} angeben.`,
					values: { name, ...Object.fromEntries(NUMERIC_FIELDS.map((f) => [f.name, data.get(f.name)])) }
				});
			}
			values[field.name] = Math.round(num);
		}

		await saveSettings(values);
		redirect(303, '/profile?success=1');
	}
};
