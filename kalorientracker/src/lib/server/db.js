import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

let client;
let db;
let connectPromise;

/**
 * Stellt die Verbindung zur Datenbank her (einmalig, danach gecacht) und legt
 * die benötigten Indizes an. Wird von db.js und auth.js gemeinsam genutzt.
 */
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
				// Accounts: E-Mail muss eindeutig sein
				db.collection('users').createIndex({ email: 1 }, { unique: true }),
				// Sessions laufen automatisch ab (TTL-Index auf expiresAt)
				db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
				// Daten werden immer pro Benutzer abgefragt
				db.collection('mealTemplates').createIndex({ userId: 1, updatedAt: -1 }),
				db.collection('mealTemplates').createIndex({ userId: 1, name: 1 }),
				db.collection('entries').createIndex({ userId: 1, date: 1 }),
				db.collection('entries').createIndex({ userId: 1, createdAt: -1 }),
				// Gewichts-Tracker: ein Eintrag pro Benutzer und Tag
				db.collection('weightEntries').createIndex({ userId: 1, date: 1 }, { unique: true })
			]);
			return db;
		})().catch((error) => {
			// Zurücksetzen, damit ein späterer Request es erneut versuchen kann
			// (z. B. nachdem DB_URI in Netlify ergänzt wurde) ohne Cold Start.
			connectPromise = undefined;
			throw error;
		});
	}
	return connectPromise;
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

// --- Templates (immer pro Benutzer) ---

export async function getTemplates(userId) {
	try {
		const database = await getDb();
		const docs = await database
			.collection('mealTemplates')
			.find({ userId: new ObjectId(userId) })
			.sort({ updatedAt: -1, name: 1 })
			.toArray();
		return docs.map(serializeTemplate);
	} catch (error) {
		console.error('Fehler beim Laden der Vorlagen:', error);
		return [];
	}
}

export async function getTemplate(userId, id) {
	try {
		const database = await getDb();
		const doc = await database
			.collection('mealTemplates')
			.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
		return doc ? serializeTemplate(doc) : null;
	} catch (error) {
		console.error('Fehler beim Laden der Vorlage:', error);
		return null;
	}
}

export async function addTemplate(userId, { name, calories, protein = 0, carbs = 0, fat = 0 }) {
	const database = await getDb();
	const now = new Date();
	const result = await database.collection('mealTemplates').insertOne({
		userId: new ObjectId(userId),
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

export async function updateTemplate(userId, id, { name, calories, protein = 0, carbs = 0, fat = 0 }) {
	const database = await getDb();
	await database.collection('mealTemplates').updateOne(
		{ _id: new ObjectId(id), userId: new ObjectId(userId) },
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

export async function deleteTemplate(userId, id) {
	const database = await getDb();
	await database
		.collection('mealTemplates')
		.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
}

// --- Entries (immer pro Benutzer) ---

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

export async function addEntryFromTemplate(userId, { templateId, mealType, date }) {
	const database = await getDb();
	const tpl = await database
		.collection('mealTemplates')
		.findOne({ _id: new ObjectId(templateId), userId: new ObjectId(userId) });
	if (!tpl) {
		throw new Error('Vorlage nicht gefunden');
	}
	await database.collection('entries').insertOne({
		userId: new ObjectId(userId),
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

/**
 * Schreibt die übergebenen Felder ans Benutzer-Dokument (z. B. Name, Körperdaten,
 * berechnete Ziele, onboardedAt). Die Felder werden vom Aufrufer serverseitig
 * validiert und explizit zusammengestellt.
 */
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

/** Jüngstes getracktes Gewicht (für „Ziel mit aktuellem Gewicht neu berechnen"). */
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
