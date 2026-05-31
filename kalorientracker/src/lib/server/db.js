import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';
import { scaleNutrition, mealTotals } from '$lib/food.js';

let client;
let db;
let connectPromise;

/** Verbindung herstellen (gecacht) und Indizes anlegen. */
export async function getDb() {
	if (db) return db;
	if (!connectPromise) {
		connectPromise = (async () => {
			const uri = env.DB_URI;
			if (!uri) {
				throw new Error(
					'DB_URI ist nicht gesetzt. Bitte die Umgebungsvariable in Netlify (Site configuration → Environment variables) hinterlegen.'
				);
			}
			client = new MongoClient(uri);
			await client.connect();
			db = client.db('KalorienTrackerDB');
			await Promise.all([
				db.collection('users').createIndex({ email: 1 }, { unique: true }),
				db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
				db.collection('foods').createIndex({ userId: 1, updatedAt: -1 }),
				db.collection('foods').createIndex({ userId: 1, name: 1 }),
				db.collection('meals').createIndex({ userId: 1, updatedAt: -1 }),
				db.collection('meals').createIndex({ userId: 1, name: 1 }),
				db.collection('entries').createIndex({ userId: 1, date: 1 }),
				db.collection('entries').createIndex({ userId: 1, createdAt: -1 }),
				db.collection('weightEntries').createIndex({ userId: 1, date: 1 }, { unique: true })
			]);
			return db;
		})().catch((error) => {
			connectPromise = undefined;
			throw error;
		});
	}
	return connectPromise;
}

// --- Serialisierung ---

function num(v) {
	return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function serializeFood(f) {
	return {
		_id: f._id.toString(),
		name: f.name,
		unit: f.unit === 'ml' ? 'ml' : 'g',
		caloriesPer100: num(f.caloriesPer100),
		proteinPer100: num(f.proteinPer100),
		carbsPer100: num(f.carbsPer100),
		fatPer100: num(f.fatPer100),
		photo: typeof f.photo === 'string' ? f.photo : null,
		source: f.source ?? 'custom'
	};
}

function serializeItem(it) {
	return {
		foodId: it.foodId ? it.foodId.toString() : null,
		name: it.name,
		unit: it.unit === 'ml' ? 'ml' : 'g',
		amount: num(it.amount),
		caloriesPer100: num(it.caloriesPer100),
		proteinPer100: num(it.proteinPer100),
		carbsPer100: num(it.carbsPer100),
		fatPer100: num(it.fatPer100)
	};
}

function serializeMeal(m) {
	return {
		_id: m._id.toString(),
		name: m.name,
		items: Array.isArray(m.items) ? m.items.map(serializeItem) : [],
		calories: num(m.calories),
		protein: num(m.protein),
		carbs: num(m.carbs),
		fat: num(m.fat),
		photo: typeof m.photo === 'string' ? m.photo : null
	};
}

function serializeEntry(e) {
	return {
		_id: e._id.toString(),
		kind: e.kind === 'meal' ? 'meal' : 'food',
		name: e.name,
		mealType: e.mealType,
		amount: e.amount != null ? num(e.amount) : null,
		unit: e.unit ?? null,
		calories: num(e.calories),
		protein: num(e.protein),
		carbs: num(e.carbs),
		fat: num(e.fat),
		items: Array.isArray(e.items) ? e.items.map(serializeItem) : [],
		createdAt: e.createdAt ?? null
	};
}

// --- Lebensmittel (eigene, pro Benutzer) ---

export async function getFoods(userId) {
	try {
		const database = await getDb();
		const docs = await database
			.collection('foods')
			.find({ userId: new ObjectId(userId) })
			.sort({ updatedAt: -1, name: 1 })
			.toArray();
		return docs.map(serializeFood);
	} catch (error) {
		console.error('Fehler beim Laden der Lebensmittel:', error);
		return [];
	}
}

export async function getFood(userId, id) {
	try {
		const database = await getDb();
		const doc = await database
			.collection('foods')
			.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
		return doc ? serializeFood(doc) : null;
	} catch (error) {
		console.error('Fehler beim Laden des Lebensmittels:', error);
		return null;
	}
}

export async function addFood(userId, data) {
	const database = await getDb();
	const now = new Date();
	const result = await database.collection('foods').insertOne({
		userId: new ObjectId(userId),
		name: data.name,
		unit: data.unit === 'ml' ? 'ml' : 'g',
		caloriesPer100: num(data.caloriesPer100),
		proteinPer100: num(data.proteinPer100),
		carbsPer100: num(data.carbsPer100),
		fatPer100: num(data.fatPer100),
		photo: typeof data.photo === 'string' ? data.photo : null,
		source: 'custom',
		createdAt: now,
		updatedAt: now
	});
	return result.insertedId.toString();
}

export async function updateFood(userId, id, data) {
	const database = await getDb();
	const set = {
		name: data.name,
		unit: data.unit === 'ml' ? 'ml' : 'g',
		caloriesPer100: num(data.caloriesPer100),
		proteinPer100: num(data.proteinPer100),
		carbsPer100: num(data.carbsPer100),
		fatPer100: num(data.fatPer100),
		updatedAt: new Date()
	};
	// Foto nur überschreiben, wenn ein neues mitkommt (oder explizit entfernt wird)
	if (data.photo !== undefined) {
		set.photo = typeof data.photo === 'string' ? data.photo : null;
	}
	await database
		.collection('foods')
		.updateOne({ _id: new ObjectId(id), userId: new ObjectId(userId) }, { $set: set });
}

export async function deleteFood(userId, id) {
	const database = await getDb();
	await database
		.collection('foods')
		.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
}

// --- Mahlzeiten (eigene, pro Benutzer; aus mehreren Lebensmitteln) ---

function normalizeItems(items) {
	return (Array.isArray(items) ? items : []).map((it) => ({
		foodId: it.foodId && /^[a-f0-9]{24}$/i.test(String(it.foodId)) ? new ObjectId(it.foodId) : null,
		name: String(it.name ?? '').slice(0, 120),
		unit: it.unit === 'ml' ? 'ml' : 'g',
		amount: num(it.amount),
		caloriesPer100: num(it.caloriesPer100),
		proteinPer100: num(it.proteinPer100),
		carbsPer100: num(it.carbsPer100),
		fatPer100: num(it.fatPer100)
	}));
}

export async function getMeals(userId) {
	try {
		const database = await getDb();
		const docs = await database
			.collection('meals')
			.find({ userId: new ObjectId(userId) })
			.sort({ updatedAt: -1, name: 1 })
			.toArray();
		return docs.map(serializeMeal);
	} catch (error) {
		console.error('Fehler beim Laden der Mahlzeiten:', error);
		return [];
	}
}

export async function getMeal(userId, id) {
	try {
		const database = await getDb();
		const doc = await database
			.collection('meals')
			.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
		return doc ? serializeMeal(doc) : null;
	} catch (error) {
		console.error('Fehler beim Laden der Mahlzeit:', error);
		return null;
	}
}

export async function addMeal(userId, { name, items }) {
	const database = await getDb();
	const normalized = normalizeItems(items);
	const totals = mealTotals(normalized);
	const now = new Date();
	const result = await database.collection('meals').insertOne({
		userId: new ObjectId(userId),
		name,
		items: normalized,
		...totals,
		createdAt: now,
		updatedAt: now
	});
	return result.insertedId.toString();
}

export async function updateMeal(userId, id, { name, items }) {
	const database = await getDb();
	const normalized = normalizeItems(items);
	const totals = mealTotals(normalized);
	await database.collection('meals').updateOne(
		{ _id: new ObjectId(id), userId: new ObjectId(userId) },
		{ $set: { name, items: normalized, ...totals, updatedAt: new Date() } }
	);
}

export async function deleteMeal(userId, id) {
	const database = await getDb();
	await database
		.collection('meals')
		.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
}

// --- Tageseinträge (Lebensmittel oder Mahlzeit) ---

export async function getEntriesByDate(userId, date) {
	try {
		const database = await getDb();
		const entries = await database
			.collection('entries')
			.find({ userId: new ObjectId(userId), date })
			.sort({ createdAt: -1 })
			.toArray();
		return entries.map(serializeEntry);
	} catch (error) {
		console.error('Fehler beim Laden der Einträge:', error);
		return [];
	}
}

export async function addFoodEntry(userId, { date, mealType, foodId, name, unit, amount, caloriesPer100, proteinPer100, carbsPer100, fatPer100 }) {
	const database = await getDb();
	const per100 = { caloriesPer100, proteinPer100, carbsPer100, fatPer100 };
	const nutrition = scaleNutrition(per100, amount);
	await database.collection('entries').insertOne({
		userId: new ObjectId(userId),
		kind: 'food',
		foodId: foodId && /^[a-f0-9]{24}$/i.test(String(foodId)) ? new ObjectId(foodId) : null,
		name,
		unit: unit === 'ml' ? 'ml' : 'g',
		amount: num(amount),
		...nutrition,
		mealType,
		date,
		createdAt: new Date()
	});
}

export async function addMealEntry(userId, { date, mealType, mealId }) {
	const database = await getDb();
	const meal = await database
		.collection('meals')
		.findOne({ _id: new ObjectId(mealId), userId: new ObjectId(userId) });
	if (!meal) {
		throw new Error('Mahlzeit nicht gefunden');
	}
	await database.collection('entries').insertOne({
		userId: new ObjectId(userId),
		kind: 'meal',
		mealId: meal._id,
		name: meal.name,
		items: Array.isArray(meal.items) ? meal.items : [],
		calories: num(meal.calories),
		protein: num(meal.protein),
		carbs: num(meal.carbs),
		fat: num(meal.fat),
		mealType,
		date,
		createdAt: new Date()
	});
}

export async function deleteEntry(userId, id) {
	const database = await getDb();
	await database
		.collection('entries')
		.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
}

// --- Profil / Einstellungen (am Benutzer-Dokument) ---

export const DEFAULT_SETTINGS = {
	name: '',
	calorieGoal: 2000,
	proteinGoal: 150,
	carbsGoal: 250,
	fatGoal: 70
};

export async function saveProfile(userId, fields) {
	const database = await getDb();
	await database.collection('users').updateOne(
		{ _id: new ObjectId(userId) },
		{ $set: { ...fields, updatedAt: new Date() } }
	);
}

// --- Gewichts-Tracker (pro Benutzer, ein Eintrag pro Tag) ---

export async function getWeightEntries(userId) {
	try {
		const database = await getDb();
		const docs = await database
			.collection('weightEntries')
			.find({ userId: new ObjectId(userId) })
			.sort({ date: 1 })
			.toArray();
		return docs.map((d) => ({ date: d.date, weight: d.weight }));
	} catch (error) {
		console.error('Fehler beim Laden der Gewichtsdaten:', error);
		return [];
	}
}

export async function upsertWeight(userId, date, weight) {
	const database = await getDb();
	await database.collection('weightEntries').updateOne(
		{ userId: new ObjectId(userId), date },
		{ $set: { weight, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
		{ upsert: true }
	);
}

export async function deleteWeight(userId, date) {
	const database = await getDb();
	await database
		.collection('weightEntries')
		.deleteOne({ userId: new ObjectId(userId), date });
}

export async function getLatestWeight(userId) {
	try {
		const database = await getDb();
		const doc = await database
			.collection('weightEntries')
			.find({ userId: new ObjectId(userId) })
			.sort({ date: -1 })
			.limit(1)
			.next();
		return doc ? doc.weight : null;
	} catch (error) {
		console.error('Fehler beim Laden des aktuellen Gewichts:', error);
		return null;
	}
}
