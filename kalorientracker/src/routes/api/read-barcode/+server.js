import { json, error } from '@sveltejs/kit';
import { readBarcodeFromImage } from '$lib/server/barcode.js';

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
		const code = await readBarcodeFromImage(image);
		return json({ code });
	} catch (err) {
		throw error(502, err instanceof Error ? err.message : 'Barcode konnte nicht gelesen werden.');
	}
}
