import { env } from '$env/dynamic/private';

// OpenRouter spricht die OpenAI-kompatible Chat-Completions-API.
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Fallback-Modell, falls OPENROUTER_MODEL in der .env nicht gesetzt ist.
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT =
	'Du bist ein freundlicher, motivierender Ernährungs-Coach in einer Kalorientracker-App. ' +
	'Antworte auf Deutsch, per Du, in höchstens 3 kurzen Sätzen. ' +
	'Gib genau einen konkreten, umsetzbaren Tipp für den Rest des Tages. ' +
	'Bewerte nicht moralisch und mach keine medizinischen Aussagen oder Diagnosen. ' +
	'Wenn noch fast nichts gegessen wurde, motiviere freundlich zum Loslegen.';

function buildUserPrompt({ weekday, goal, totals, mealCount }) {
	return [
		weekday ? `Mein Tag (${weekday}):` : 'Mein heutiger Tag:',
		`Ziel: ${goal.calorieGoal} kcal, ${goal.proteinGoal} g Protein, ${goal.carbsGoal} g Kohlenhydrate, ${goal.fatGoal} g Fett.`,
		`Bisher gegessen: ${totals.calories} kcal, ${totals.protein} g Protein, ${totals.carbs} g Kohlenhydrate, ${totals.fat} g Fett (${mealCount} ${mealCount === 1 ? 'Eintrag' : 'Einträge'}).`,
		'Gib mir ein kurzes, motivierendes Feedback und einen konkreten Tipp.'
	].join('\n');
}

/**
 * Holt ein kurzes Coach-Feedback von OpenRouter.
 * Wirft einen Error mit sprechender (anzeigbarer) Meldung, wenn die
 * Konfiguration fehlt oder der Aufruf scheitert – der Aufrufer fängt das ab.
 */
export async function getCoachFeedback(input) {
	const apiKey = env.OPENROUTER_API_KEY;
	if (!apiKey) {
		throw new Error('KI ist nicht konfiguriert (OPENROUTER_API_KEY fehlt in der .env).');
	}
	const model = env.OPENROUTER_MODEL || DEFAULT_MODEL;

	let response;
	try {
		response = await fetch(OPENROUTER_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				// Von OpenRouter empfohlen (App-Kennung), optional:
				'X-Title': 'Kalorientracker'
			},
			body: JSON.stringify({
				model,
				messages: [
					{ role: 'system', content: SYSTEM_PROMPT },
					{ role: 'user', content: buildUserPrompt(input) }
				],
				max_tokens: 200,
				temperature: 0.6
			})
		});
	} catch {
		throw new Error('KI-Dienst ist nicht erreichbar.');
	}

	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		console.error('OpenRouter-Fehler:', response.status, detail);
		throw new Error('KI-Dienst hat einen Fehler gemeldet. Bitte später erneut versuchen.');
	}

	const data = await response.json().catch(() => null);
	const text = data?.choices?.[0]?.message?.content?.trim();
	if (!text) {
		throw new Error('KI hat keine Antwort geliefert.');
	}
	return text;
}
