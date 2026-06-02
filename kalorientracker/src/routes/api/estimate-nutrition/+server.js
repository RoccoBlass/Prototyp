import { json, error } from '@sveltejs/kit';
import { estimateNutritionFromImage } from '$lib/server/vision.js';

// Grobe Obergrenze für das Bild (data-URL als Base64). Das Frontend verkleinert
// das Foto bereits auf ~max. 768px, daher reichen wenige hundert KB locker.
const MAX_IMAGE_CHARS = 3_000_000;

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

	const image = body?.image;
	if (typeof image !== 'string' || image.length > MAX_IMAGE_CHARS) {
		throw error(400, 'Kein gültiges Bild übermittelt.');
	}

	try {
		const result = await estimateNutritionFromImage(image);
		return json(result);
	} catch (err) {
		// estimateNutritionFromImage wirft Errors mit anzeigbarer Meldung.
		throw error(502, err instanceof Error ? err.message : 'Schätzung fehlgeschlagen.');
	}
}
