import { env } from '$env/dynamic/private';

// OpenRouter spricht die OpenAI-kompatible Chat-Completions-API (wie KI-Coach & Vision).
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Fallback-Modell, falls OPENROUTER_MODEL in der .env nicht gesetzt ist.
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

const SYSTEM_PROMPT =
	'Du bist ein Ernährungs-Assistent. Aus einer freien deutschen Beschreibung einer Mahlzeit ' +
	'oder eines Lebensmittels (z. B. "2 Eier und ein Toast mit Butter") schätzt du die Nährwerte. ' +
	'Antworte AUSSCHLIESSLICH mit einem einzelnen JSON-Objekt (kein Markdown, kein Text drumherum) ' +
	'mit genau diesen Feldern: ' +
	'name (string, kurze deutsche Zusammenfassung), einheit ("g" oder "ml"), ' +
	'menge (number, geschätzte Gesamtmenge der beschriebenen Portion in g bzw. ml), ' +
	'caloriesPer100 (number), proteinPer100 (number), carbsPer100 (number), fatPer100 (number), ' +
	'confidence ("niedrig"|"mittel"|"hoch"), hinweis (string, max. 1 kurzer Satz). ' +
	'Die Per-100-Werte beziehen sich auf 100 g bzw. 100 ml der Mischung; "menge" ist die gesamte ' +
	'beschriebene Portion. Wenn keine Nahrung erkennbar ist, setze name auf "" und confidence auf "niedrig".';

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
 * Schätzt aus einer Freitext-Beschreibung die Nährwerte je 100 g/ml plus die
 * geschätzte Gesamtmenge der Portion. Gibt ein validiertes Objekt zurück oder
 * wirft einen Error mit anzeigbarer Meldung.
 */
export async function estimateNutritionFromText(description) {
	const apiKey = env.OPENROUTER_API_KEY;
	if (!apiKey) {
		throw new Error('KI ist nicht konfiguriert (OPENROUTER_API_KEY fehlt).');
	}
	const text = typeof description === 'string' ? description.trim() : '';
	if (text.length < 2) {
		throw new Error('Bitte beschreibe, was du gegessen hast.');
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
					{ role: 'user', content: text.slice(0, 500) }
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
		console.error('OpenRouter-Freitext-Fehler:', response.status, detail);
		throw new Error('KI-Dienst hat einen Fehler gemeldet. Bitte später erneut versuchen.');
	}

	const data = await response.json().catch(() => null);
	const raw = parseJsonObject(data?.choices?.[0]?.message?.content);
	if (!raw) {
		throw new Error('KI hat keine auswertbare Schätzung geliefert.');
	}

	const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 120) : '';
	if (!name) {
		throw new Error('Daraus konnte kein Lebensmittel erkannt werden. Bitte genauer beschreiben.');
	}

	const amount = clampNum(raw.menge, 5000);
	return {
		name,
		unit: raw.einheit === 'ml' ? 'ml' : 'g',
		amount: amount > 0 ? amount : 100,
		caloriesPer100: clampNum(raw.caloriesPer100, 900),
		proteinPer100: clampNum(raw.proteinPer100, 100),
		carbsPer100: clampNum(raw.carbsPer100, 100),
		fatPer100: clampNum(raw.fatPer100, 100),
		confidence: ['niedrig', 'mittel', 'hoch'].includes(raw.confidence) ? raw.confidence : 'mittel',
		hinweis: typeof raw.hinweis === 'string' ? raw.hinweis.trim().slice(0, 200) : ''
	};
}
