import { env } from '$env/dynamic/private';

// OpenRouter spricht die OpenAI-kompatible Chat-Completions-API (wie der KI-Coach).
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Fallback-Modell, falls OPENROUTER_MODEL in der .env nicht gesetzt ist.
// Hinweis: Das Modell muss Bildeingabe (Vision) unterstützen.
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

const SYSTEM_PROMPT =
	'Du bist ein Ernährungs-Assistent. Du schätzt aus einem Foto die Nährwerte eines ' +
	'Lebensmittels oder Gerichts. Antworte AUSSCHLIESSLICH mit einem einzelnen JSON-Objekt ' +
	'(kein Markdown, kein Text drumherum) mit genau diesen Feldern: ' +
	'name (string, kurz, deutsch), einheit ("g" oder "ml"), ' +
	'caloriesPer100 (number), proteinPer100 (number), carbsPer100 (number), fatPer100 (number), ' +
	'confidence ("niedrig"|"mittel"|"hoch"), hinweis (string, max. 1 kurzer Satz). ' +
	'Alle Nährwerte beziehen sich auf 100 g bzw. 100 ml. Wenn kein Lebensmittel erkennbar ist, ' +
	'setze name auf "" und confidence auf "niedrig".';

function clampNum(value, max) {
	const n = Number(value);
	if (!Number.isFinite(n) || n < 0) return 0;
	return Math.round(Math.min(n, max) * 10) / 10;
}

/** Schneidet ein JSON-Objekt aus der Modell-Antwort (toleriert Code-Fences/Text). */
function parseJsonObject(text) {
	if (typeof text !== 'string') return null;
	const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
	const start = cleaned.indexOf('{');
	const end = cleaned.lastIndexOf('}');
	if (start === -1 || end === -1 || end < start) return null;
	try {
		return JSON.parse(cleaned.slice(start, end + 1));
	} catch {
		return null;
	}
}

/**
 * Schätzt aus einem Bild (data-URL) die Nährwerte je 100 g/ml.
 * Gibt ein validiertes Objekt zurück oder wirft einen Error mit anzeigbarer Meldung.
 */
export async function estimateNutritionFromImage(imageDataUrl) {
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
							{ type: 'text', text: 'Schätze die Nährwerte des abgebildeten Lebensmittels/Gerichts.' },
							{ type: 'image_url', image_url: { url: imageDataUrl } }
						]
					}
				],
				max_tokens: 400,
				temperature: 0.2
			})
		});
	} catch {
		throw new Error('KI-Dienst ist nicht erreichbar.');
	}

	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		console.error('OpenRouter-Vision-Fehler:', response.status, detail);
		throw new Error('KI-Dienst hat einen Fehler gemeldet. Bitte später erneut versuchen.');
	}

	const data = await response.json().catch(() => null);
	const raw = parseJsonObject(data?.choices?.[0]?.message?.content);
	if (!raw) {
		throw new Error('KI hat keine auswertbare Schätzung geliefert.');
	}

	const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 120) : '';
	if (!name) {
		throw new Error('Auf dem Foto wurde kein Lebensmittel erkannt. Bitte ein anderes Foto versuchen.');
	}

	return {
		name,
		unit: raw.einheit === 'ml' ? 'ml' : 'g',
		caloriesPer100: clampNum(raw.caloriesPer100, 900),
		proteinPer100: clampNum(raw.proteinPer100, 100),
		carbsPer100: clampNum(raw.carbsPer100, 100),
		fatPer100: clampNum(raw.fatPer100, 100),
		confidence: ['niedrig', 'mittel', 'hoch'].includes(raw.confidence) ? raw.confidence : 'mittel',
		hinweis: typeof raw.hinweis === 'string' ? raw.hinweis.trim().slice(0, 200) : ''
	};
}
