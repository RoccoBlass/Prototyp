import { MongoClient, ObjectId } from 'mongodb';
import { DB_URI } from '$env/static/private';

let client;
let db;

async function connect() {
	if (!client) {
		client = new MongoClient(DB_URI);
		await client.connect();
		db = client.db('KalorienTrackerDB');
		await db.collection('meals').createIndex({ date: 1 });
	}
	return db;
}

export async function getMealsByDate(date) {
	try {
		const database = await connect();
		const meals = await database
			.collection('meals')
			.find({ date })
			.sort({ createdAt: -1 })
			.toArray();
		return meals.map((meal) => ({ ...meal, _id: meal._id.toString() }));
	} catch (error) {
		console.error('Fehler beim Laden der Mahlzeiten:', error);
		return [];
	}
}

export async function addMeal(meal) {
	try {
		const database = await connect();
		const result = await database.collection('meals').insertOne({
			...meal,
			createdAt: new Date()
		});
		return result;
	} catch (error) {
		console.error('Fehler beim Hinzufügen der Mahlzeit:', error);
		throw error;
	}
}

export async function deleteMeal(id) {
	try {
		const database = await connect();
		const result = await database
			.collection('meals')
			.deleteOne({ _id: new ObjectId(id) });
		return result;
	} catch (error) {
		console.error('Fehler beim Löschen der Mahlzeit:', error);
		throw error;
	}
}
