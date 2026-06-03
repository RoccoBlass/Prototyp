import { env } from '$env/dynamic/private';

// OpenRouter (OpenAI-kompatibel) – wie Coach/Vision/Freitext.
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-3-flash-preview';

const SYSTEM_PROMPT =
	'Du liest Strichcodes (Barcodes) von Produktfotos. Gib AUSSCHLIESSLICH die Ziffernfolge ' +
	'des EAN-/UPC-Barcodes zurück (die Zahl, die unter dem Strichcode steht) – nur die Ziffern, ' +
	'ohne Leerzeichen, ohne weiteren Text. Ist kein Barcode lesbar, antworte mit einer leeren Zeile.';

/**
 * Liest aus einem Foto (data-URL) die Barcode-Ziffern. Gibt die Ziffernfolge
 * (8–14 Stellen) zurück oder null, wenn nichts Brauchbares erkannt wurde.
 */
export async function readBarcodeFromImage(imageDataUrl) {
	const apiKey = env.OPENROUTER_API_KEY;
	if (!apiKey) {
		throw new Error('KI ist nicht konfiguriert (OPENROUTER_API_KEY fehlt).');
	}
	if (typeof imageDataUrl !== 'string' || !/^data:image\/(jpe?g|png|webp);base64,/.test(imageDataUrl)) {
		throw new Error('Kein gültiges Bild übermittelt.');
	}
	const model = env.OPENROUTER_MODEL || DEFAULT_MODEL;

	let response;
	try {
		response = await fetch(OPENROUTER_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				'X-Title': 'Kalorientracker'
			},
			body: JSON.stringify({
				model,
				messages: [
					{ role: 'system', content: SYSTEM_PROMPT },
					{
						role: 'user',
						content: [
							{ type: 'text', text: 'Lies die Barcode-Nummer auf diesem Foto.' },
							{ type: 'image_url', image_url: { url: imageDataUrl } }
						]
					}
				],
				max_tokens: 40,
				temperature: 0
			})
		});
	} catch {
		throw new Error('KI-Dienst ist nicht erreichbar.');
	}

	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		console.error('OpenRouter-Barcode-Fehler:', response.status, detail);
		throw new Error('KI-Dienst hat einen Fehler gemeldet. Bitte später erneut versuchen.');
	}

	const data = await response.json().catch(() => null);
	const text = data?.choices?.[0]?.message?.content ?? '';
	const digits = String(text).replace(/\D/g, '');
	return /^\d{8,14}$/.test(digits) ? digits : null;
}
