import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

let client;
let db;
let connectPromise;

async function connect() {
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
				db.collection('mealTemplates').createIndex({ name: 1 }),
				db.collection('mealTemplates').createIndex({ updatedAt: -1 }),
				db.collection('entries').createIndex({ date: 1 }),
				db.collection('entries').createIndex({ createdAt: -1 })
			]);
			await migrateLegacyMealsIfNeeded();
			return db;
		})().catch((error) => {
			// Reset so a later request can retry once the cause is fixed
			// (e.g. DB_URI added in Netlify) without waiting for a cold start.
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

export const DEFAULT_SETTINGS = {
	name: '',
	calorieGoal: 2000,
	proteinGoal: 150,
	carbsGoal: 250,
	fatGoal: 70
};

function positiveNumber(value, fallback) {
	return typeof value === 'number' && value > 0 ? value : fallback;
}

export async function getSettings() {
	try {
		const database = await connect();
		const doc = await database.collection('settings').findOne({ _id: 'user' });
		return {
			name: typeof doc?.name === 'string' ? doc.name : DEFAULT_SETTINGS.name,
			calorieGoal: positiveNumber(doc?.calorieGoal, DEFAULT_SETTINGS.calorieGoal),
			proteinGoal: positiveNumber(doc?.proteinGoal, DEFAULT_SETTINGS.proteinGoal),
			carbsGoal: positiveNumber(doc?.carbsGoal, DEFAULT_SETTINGS.carbsGoal),
			fatGoal: positiveNumber(doc?.fatGoal, DEFAULT_SETTINGS.fatGoal)
		};
	} catch (error) {
		console.error('Fehler beim Laden der Einstellungen:', error);
		return { ...DEFAULT_SETTINGS };
	}
}

export async function saveSettings(settings) {
	const database = await connect();
	await database
		.collection('settings')
		.updateOne(
			{ _id: 'user' },
			{ $set: { ...settings, updatedAt: new Date() } },
			{ upsert: true }
		);
}
