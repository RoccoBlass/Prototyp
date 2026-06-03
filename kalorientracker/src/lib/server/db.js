import { MongoClient, ObjectId } from 'mongodb';
import { AsyncLocalStorage } from 'node:async_hooks';
import { env } from '$env/dynamic/private';
import { scaleNutrition, mealTotals } from '$lib/food.js';

let nodeDb;
let nodeConnectPromise;
let indexesEnsured = false;

// Cloudflare Workers: eine DB-Verbindung darf NICHT über Requests hinweg
// wiederverwendet werden – sonst hängt sich der nächste Request auf ("Worker
// hung"). Gleichzeitig ist es teuer (CPU/Speicher), pro DB-Abfrage neu zu
// verbinden – mehrere Verbindungen pro Request sprengen auf dem Free-Plan das
// Limit ("Worker exceeded resource limits", Error 1102).
//
// Lösung: pro Request genau EINE Verbindung. Sie wird beim ersten getDb()
// geöffnet, über den AsyncLocalStorage an alle weiteren getDb()-Aufrufe
// desselben Requests weitergereicht und am Request-Ende (withRequestDb)
// geschlossen. So entsteht nur ein TLS-Handshake pro Request und der
// Worker-Speicher läuft nicht voll. Auf Node (lokaler Dev / Node-Hosting)
// bleibt die Verbindung global gecacht (performant).
const IS_WORKERS =
	typeof globalThis.WebSocketPair !== 'undefined' ||
	globalThis.navigator?.userAgent === 'Cloudflare-Workers';

// Hält pro Request die geöffnete Verbindung (nur auf Workers genutzt).
const requestStore = new AsyncLocalStorage();

async function ensureIndexes(database) {
	if (indexesEnsured) return;
	try {
		await Promise.all([
			database.collection('users').createIndex({ email: 1 }, { unique: true }),
			database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
			database.collection('foods').createIndex({ userId: 1, updatedAt: -1 }),
			database.collection('foods').createIndex({ userId: 1, name: 1 }),
			database.collection('meals').createIndex({ userId: 1, updatedAt: -1 }),
			database.collection('meals').createIndex({ userId: 1, name: 1 }),
			database.collection('entries').createIndex({ userId: 1, date: 1 }),
			database.collection('entries').createIndex({ userId: 1, createdAt: -1 }),
			database.collection('weightEntries').createIndex({ userId: 1, date: 1 }, { unique: true })
		]);
		indexesEnsured = true;
	} catch (error) {
		console.error('Index-Erstellung fehlgeschlagen:', error);
	}
}

async function createConnection() {
	const uri = env.DB_URI;
	if (!uri) {
		throw new Error('DB_URI ist nicht gesetzt. Bitte die Umgebungsvariable im Hosting hinterlegen.');
	}
	const mongo = new MongoClient(uri);
	await mongo.connect();
	return { client: mongo, database: mongo.db('KalorienTrackerDB') };
}

// Node: eine global gecachte Verbindung für die gesamte Prozesslaufzeit.
// Indexe werden hier einmalig sichergestellt. Auf Workers existieren sie
// bereits (in früheren Deploys angelegt) – dort bleibt die Index-Erstellung
// bewusst aus dem Request-Pfad heraus, um CPU-Zeit zu sparen.
async function getNodeDb() {
	if (nodeDb) return nodeDb;
	if (!nodeConnectPromise) {
		nodeConnectPromise = createConnection()
			.then(async ({ database }) => {
				await ensureIndexes(database);
				nodeDb = database;
				return database;
			})
			.catch((error) => {
				nodeConnectPromise = undefined;
				throw error;
			});
	}
	return nodeConnectPromise;
}

/**
 * Liefert die Datenbank. Auf Node global gecacht; auf Cloudflare die eine
 * Verbindung des aktuellen Requests (geteilt über withRequestDb).
 */
export async function getDb() {
	if (!IS_WORKERS) return getNodeDb();

	const store = requestStore.getStore();
	if (!store) {
		// Außerhalb eines Requests (z. B. beim Build): Einzelverbindung.
		const { database } = await createConnection();
		return database;
	}
	if (!store.promise) {
		store.promise = createConnection().then((conn) => {
			store.conn = conn;
			return conn.database;
		});
	}
	return store.promise;
}

/**
 * Umschließt die Verarbeitung eines Requests (aus hooks.server.js aufgerufen).
 * Auf Cloudflare wird die in diesem Request geöffnete Verbindung am Ende
 * geschlossen, damit der Worker-Speicher nicht volläuft. Auf Node ein einfacher
 * Durchlauf ohne Schließen (Verbindung bleibt global gecacht).
 */
export async function withRequestDb(fn) {
	if (!IS_WORKERS) return fn();

	const store = {};
	return requestStore.run(store, async () => {
		try {
			return await fn();
		} finally {
			if (store.conn) {
				try {
					await store.conn.client.close();
				} catch (error) {
					console.error('DB-Verbindung schließen fehlgeschlagen:', error);
				}
			}
		}
	});
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

/** Summiert die Kalorien je Tag für die angegebenen Datumsstrings (eine Abfrage). */
export async function getDailyCalorieTotals(userId, dates) {
	try {
		const database = await getDb();
		const rows = await database
			.collection('entries')
			.aggregate([
				{ $match: { userId: new ObjectId(userId), date: { $in: dates } } },
				{ $group: { _id: '$date', calories: { $sum: '$calories' } } }
			])
			.toArray();
		const map = new Map(rows.map((r) => [r._id, r.calories]));
		return dates.map((d) => ({ date: d, calories: Math.round(map.get(d) || 0) }));
	} catch (error) {
		console.error('Fehler beim Laden der Tages-Kalorien:', error);
		return dates.map((d) => ({ date: d, calories: 0 }));
	}
}

// --- Profil / Einstellungen (am Benutzer-Dokument) ---

export const DEFAULT_SETTINGS = {
	name: '',
	calorieGoal: 2000,
	proteinGoal: 150,
	carbsGoal: 250,
	fatGoal: 70,
	theme: 'dark'
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
