import { json, error } from '@sveltejs/kit';
import { estimateNutritionFromText } from '$lib/server/foodText.js';

const MAX_TEXT_CHARS = 500;

export async function POST({ request, locals }) {
	if (!locals.user) {
		throw error(401, 'Nicht angemeldet.');
	}

	let body;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Ungültige Anfrage.');
	}

	const text = body?.text;
	if (typeof text !== 'string' || text.trim().length < 2 || text.length > MAX_TEXT_CHARS) {
		throw error(400, 'Bitte beschreibe in ein paar Worten, was du gegessen hast.');
	}

	try {
		const result = await estimateNutritionFromText(text);
		return json(result);
	} catch (err) {
		throw error(502, err instanceof Error ? err.message : 'Schätzung fehlgeschlagen.');
	}
}
