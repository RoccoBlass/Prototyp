import { fail, redirect } from '@sveltejs/kit';
import { updateUserProfile } from '$lib/server/db.js';

export async function load({ locals }) {
	return { user: locals.user };
}

const NUMERIC_FIELDS = [
	{ name: 'calorieGoal', label: 'Kalorienziel', min: 500, max: 10000 },
	{ name: 'proteinGoal', label: 'Protein-Ziel', min: 10, max: 500 },
	{ name: 'carbsGoal', label: 'Kohlenhydrate-Ziel', min: 10, max: 1000 },
	{ name: 'fatGoal', label: 'Fett-Ziel', min: 5, max: 400 }
];

export const actions = {
	updateProfile: async ({ request, locals }) => {
		const data = await request.formData();

		const name = String(data.get('name') ?? '')
			.trim()
			.slice(0, 60);

		const rawValues = {
			name,
			...Object.fromEntries(NUMERIC_FIELDS.map((f) => [f.name, data.get(f.name)]))
		};

		const settings = { name };
		for (const field of NUMERIC_FIELDS) {
			const num = Number(data.get(field.name));
			if (!Number.isFinite(num) || num < field.min || num > field.max) {
				return fail(400, {
					error: `${field.label}: Bitte einen Wert zwischen ${field.min} und ${field.max} angeben.`,
					values: rawValues
				});
			}
			settings[field.name] = Math.round(num);
		}

		try {
			await updateUserProfile(locals.user.id, settings);
		} catch (error) {
			console.error('Fehler beim Speichern der Einstellungen:', error);
			return fail(500, {
				error: 'Einstellungen konnten nicht gespeichert werden. Bitte erneut versuchen.',
				values: rawValues
			});
		}

		redirect(303, '/profile?success=1');
	}
};
