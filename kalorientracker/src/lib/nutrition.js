// Berechnung von Kalorien- und Makronährstoff-Zielen.
// Reines Modul (keine DB, kein Server) – wird sowohl serverseitig (verbindliche
// Speicherung) als auch clientseitig (Live-Vorschau im Onboarding) verwendet.
//
// Methode: Grundumsatz nach Mifflin-St Jeor → Gesamtbedarf via Aktivitätsfaktor
// → Ziel-Anpassung (Defizit/Überschuss) → Makros (Protein nach Körpergewicht,
// Fett ~27,5 % der Kalorien, Kohlenhydrate als Rest; 4/4/9 kcal pro Gramm).

export const SEXES = [
	{ key: 'female', label: 'Weiblich' },
	{ key: 'male', label: 'Männlich' }
];

export const ACTIVITY_LEVELS = [
	{ key: 'sedentary', label: 'Sitzend', hint: 'Kaum Bewegung, Bürojob', factor: 1.2 },
	{ key: 'light', label: 'Leicht aktiv', hint: '1–3× Sport pro Woche', factor: 1.375 },
	{ key: 'moderate', label: 'Mäßig aktiv', hint: '3–5× Sport pro Woche', factor: 1.55 },
	{ key: 'active', label: 'Sehr aktiv', hint: '6–7× Sport pro Woche', factor: 1.725 },
	{ key: 'veryActive', label: 'Extrem aktiv', hint: 'Sport + körperliche Arbeit', factor: 1.9 }
];

export const GOALS = [
	{ key: 'lose', label: 'Abnehmen', hint: 'Moderates Defizit (−500 kcal)', adjustment: -500, proteinPerKg: 2.0 },
	{ key: 'maintain', label: 'Gewicht halten', hint: 'Bedarf decken', adjustment: 0, proteinPerKg: 1.8 },
	{ key: 'gain', label: 'Muskelaufbau', hint: 'Leichter Überschuss (+300 kcal)', adjustment: 300, proteinPerKg: 1.8 }
];

// Anteil der Kalorien aus Fett (Mitte von 25–30 %).
const FAT_PERCENT = 0.275;
// Sicherheits-Untergrenzen, damit das Ziel nicht ungesund niedrig wird.
const MIN_CALORIES = { male: 1500, female: 1200 };

export const LIMITS = {
	age: { min: 14, max: 100 },
	height: { min: 100, max: 250 },
	weight: { min: 30, max: 300 }
};

export function getActivityLevel(key) {
	return ACTIVITY_LEVELS.find((a) => a.key === key) ?? null;
}

export function getGoal(key) {
	return GOALS.find((g) => g.key === key) ?? null;
}

/** Grundumsatz (BMR) nach Mifflin-St Jeor in kcal/Tag. */
export function calculateBmr({ sex, age, height, weight }) {
	const base = 10 * weight + 6.25 * height - 5 * age;
	return sex === 'female' ? base - 161 : base + 5;
}

/** Kalorien aus den Makros (4 kcal/g Protein & KH, 9 kcal/g Fett). */
export function caloriesFromMacros({ proteinGoal, carbsGoal, fatGoal }) {
	return Math.round((proteinGoal ?? 0) * 4 + (carbsGoal ?? 0) * 4 + (fatGoal ?? 0) * 9);
}

/**
 * Berechnet aus den Körperdaten + Ziel die Makros und das Kalorienziel.
 * Das Kalorienziel ist immer die Summe der (gerundeten) Makros, damit Ring und
 * Makro-Anzeige in der App konsistent zusammenpassen.
 */
export function calculateTargets({ sex, age, height, weight, activityLevel, goal }) {
	const activity = getActivityLevel(activityLevel) ?? ACTIVITY_LEVELS[0];
	const goalDef = getGoal(goal) ?? GOALS[1];

	const bmr = calculateBmr({ sex, age, height, weight });
	const tdee = bmr * activity.factor;

	const floor = MIN_CALORIES[sex === 'male' ? 'male' : 'female'];
	const calorieTarget = Math.max(floor, Math.round((tdee + goalDef.adjustment) / 10) * 10);

	const proteinGoal = Math.round(weight * goalDef.proteinPerKg);
	const fatGoal = Math.round((calorieTarget * FAT_PERCENT) / 9);
	const carbsGoal = Math.max(0, Math.round((calorieTarget - proteinGoal * 4 - fatGoal * 9) / 4));

	return {
		bmr: Math.round(bmr),
		tdee: Math.round(tdee),
		calorieGoal: caloriesFromMacros({ proteinGoal, carbsGoal, fatGoal }),
		proteinGoal,
		carbsGoal,
		fatGoal
	};
}
