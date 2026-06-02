import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

let db;
let connectPromise;
let indexesEnsured = false;

// Cloudflare Workers: eine DB-Verbindung darf NICHT über Requests hinweg
// wiederverwendet werden – sonst hängt sich der nächste Request auf. Dort
// deshalb pro Aufruf frisch verbinden; auf Node (Netlify) bleibt sie gecacht.
const IS_WORKERS =
	typeof globalThis.WebSocketPair !== 'undefined' ||
	globalThis.navigator?.userAgent === 'Cloudflare-Workers';

async function ensureIndexes(database) {
	if (indexesEnsured) return;
	try {
		await Promise.all([
			database.collection('mealTemplates').createIndex({ name: 1 }),
			database.collection('mealTemplates').createIndex({ updatedAt: -1 }),
			database.collection('entries').createIndex({ date: 1 }),
			database.collection('entries').createIndex({ createdAt: -1 })
		]);
		indexesEnsured = true;
	} catch (error) {
		console.error('Index-Erstellung fehlgeschlagen:', error);
	}
}

async function openDb() {
	const uri = env.DB_URI;
	if (!uri) {
		throw new Error('DB_URI ist nicht gesetzt. Bitte die Umgebungsvariable im Hosting hinterlegen.');
	}
	const mongo = new MongoClient(uri);
	await mongo.connect();
	// Eigene DB für den Prototyp-Deploy – trennt die Demo-Daten von der
	// Produktiv-App (gleicher Connection-String, anderer DB-Name).
	const database = mongo.db('KalorienTrackerProto');
	await ensureIndexes(database);
	return database;
}

async function connect() {
	if (IS_WORKERS) return openDb();
	if (db) return db;
	if (!connectPromise) {
		connectPromise = openDb()
			.then((d) => {
				db = d;
				return d;
			})
			.catch((error) => {
				connectPromise = undefined;
				throw error;
			});
	}
	return connectPromise;
}

async function migrateLegacyMealsIfNeeded() {
	const existingEntry = await db
		.collection('entries')
		.findOne({}, { projection: { _id: 1 } });
	if (existingEntry) return;

	const legacyMeals = await db
		.collection('meals')
		.find({})
		.sort({ createdAt: 1 })
		.toArray();
	if (legacyMeals.length === 0) return;

	const now = new Date();
	const templateByName = new Map();
	for (const meal of legacyMeals) {
		const key = (meal.name ?? '').trim();
		if (!key) continue;
		templateByName.set(key, {
			name: key,
			calories: meal.calories ?? 0,
			protein: meal.protein ?? 0,
			carbs: meal.carbs ?? 0,
			fat: meal.fat ?? 0,
			createdAt: meal.createdAt ?? now,
			updatedAt: meal.createdAt ?? now
		});
	}

	const templateDocs = Array.from(templateByName.values());
	const nameToId = new Map();
	if (templateDocs.length > 0) {
		const insertResult = await db.collection('mealTemplates').insertMany(templateDocs);
		Array.from(templateByName.keys()).forEach((name, idx) => {
			nameToId.set(name, insertResult.insertedIds[idx]);
		});
	}

	const entryDocs = legacyMeals
		.filter((m) => (m.name ?? '').trim())
		.map((m) => ({
			templateId: nameToId.get((m.name ?? '').trim()) ?? null,
			name: m.name,
			calories: m.calories ?? 0,
			protein: m.protein ?? 0,
			carbs: m.carbs ?? 0,
			fat: m.fat ?? 0,
			mealType: m.mealType,
			date: m.date,
			createdAt: m.createdAt ?? now
		}));

	if (entryDocs.length > 0) {
		await db.collection('entries').insertMany(entryDocs);
	}
}

function serializeTemplate(t) {
	return {
		_id: t._id.toString(),
		name: t.name,
		calories: t.calories ?? 0,
		protein: t.protein ?? 0,
		carbs: t.carbs ?? 0,
		fat: t.fat ?? 0,
		createdAt: t.createdAt ?? null,
		updatedAt: t.updatedAt ?? null
	};
}

function serializeEntry(e) {
	return {
		_id: e._id.toString(),
		templateId: e.templateId ? e.templateId.toString() : null,
		name: e.name,
		calories: e.calories ?? 0,
		protein: e.protein ?? 0,
		carbs: e.carbs ?? 0,
		fat: e.fat ?? 0,
		mealType: e.mealType,
		date: e.date,
		createdAt: e.createdAt ?? null
	};
}

// --- Templates ---

export async function getTemplates() {
	try {
		const database = await connect();
		const docs = await database
			.collection('mealTemplates')
			.find({})
			.sort({ updatedAt: -1, name: 1 })
			.toArray();
		return docs.map(serializeTemplate);
	} catch (error) {
		console.error('Fehler beim Laden der Vorlagen:', error);
		return [];
	}
}

export async function getTemplate(id) {
	try {
		const database = await connect();
		const doc = await database
			.collection('mealTemplates')
			.findOne({ _id: new ObjectId(id) });
		return doc ? serializeTemplate(doc) : null;
	} catch (error) {
		console.error('Fehler beim Laden der Vorlage:', error);
		return null;
	}
}

export async function addTemplate({ name, calories, protein = 0, carbs = 0, fat = 0 }) {
	const database = await connect();
	const now = new Date();
	const result = await database.collection('mealTemplates').insertOne({
		name,
		calories,
		protein,
		carbs,
		fat,
		createdAt: now,
		updatedAt: now
	});
	return result.insertedId.toString();
}

export async function updateTemplate(id, { name, calories, protein = 0, carbs = 0, fat = 0 }) {
	const database = await connect();
	await database.collection('mealTemplates').updateOne(
		{ _id: new ObjectId(id) },
		{
			$set: {
				name,
				calories,
				protein,
				carbs,
				fat,
				updatedAt: new Date()
			}
		}
	);
}

export async function deleteTemplate(id) {
	const database = await connect();
	await database.collection('mealTemplates').deleteOne({ _id: new ObjectId(id) });
}

// --- Entries ---

export async function getEntriesByDate(date) {
	try {
		const database = await connect();
		const entries = await database
			.collection('entries')
			.find({ date })
			.sort({ createdAt: -1 })
			.toArray();
		return entries.map(serializeEntry);
	} catch (error) {
		console.error('Fehler beim Laden der Einträge:', error);
		return [];
	}
}

export async function addEntryFromTemplate({ templateId, mealType, date }) {
	const database = await connect();
	const tpl = await database
		.collection('mealTemplates')
		.findOne({ _id: new ObjectId(templateId) });
	if (!tpl) {
		throw new Error('Vorlage nicht gefunden');
	}
	await database.collection('entries').insertOne({
		templateId: tpl._id,
		name: tpl.name,
		calories: tpl.calories ?? 0,
		protein: tpl.protein ?? 0,
		carbs: tpl.carbs ?? 0,
		fat: tpl.fat ?? 0,
		mealType,
		date,
		createdAt: new Date()
	});
	await database
		.collection('mealTemplates')
		.updateOne({ _id: tpl._id }, { $set: { updatedAt: new Date() } });
}

export async function deleteEntry(id) {
	const database = await connect();
	await database.collection('entries').deleteOne({ _id: new ObjectId(id) });
}

// --- Settings ---

const DEFAULT_CALORIE_GOAL = 2000;

export async function getCalorieGoal() {
	try {
		const database = await connect();
		const doc = await database.collection('settings').findOne({ _id: 'user' });
		const value = doc?.calorieGoal;
		if (typeof value === 'number' && value > 0) return value;
		return DEFAULT_CALORIE_GOAL;
	} catch (error) {
		console.error('Fehler beim Laden des Kalorienziels:', error);
		return DEFAULT_CALORIE_GOAL;
	}
}

export async function setCalorieGoal(goal) {
	const database = await connect();
	await database
		.collection('settings')
		.updateOne(
			{ _id: 'user' },
			{ $set: { calorieGoal: goal, updatedAt: new Date() } },
			{ upsert: true }
		);
}
