import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { ObjectId } from 'mongodb';
import { getDb, DEFAULT_SETTINGS } from './db.js';

const scrypt = promisify(scryptCb);

/** Name des Session-Cookies. */
export const SESSION_COOKIE = 'session';
/** Lebensdauer einer Session: 30 Tage (in Sekunden, passend für Cookie-maxAge). */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

const KEY_LENGTH = 64;

/**
 * Erzeugt aus einem Passwort einen Hash im Format "salt:hash" (beide hex).
 * Verwendet scrypt aus dem Node-Kern – keine externe Abhängigkeit nötig.
 */
async function hashPassword(password) {
	const salt = randomBytes(16).toString('hex');
	const derived = /** @type {Buffer} */ (await scrypt(password, salt, KEY_LENGTH));
	return `${salt}:${derived.toString('hex')}`;
}

/** Prüft ein Passwort gegen einen gespeicherten "salt:hash"-Wert (timing-safe). */
async function verifyPassword(password, stored) {
	if (typeof stored !== 'string') return false;
	const [salt, key] = stored.split(':');
	if (!salt || !key) return false;
	const keyBuffer = Buffer.from(key, 'hex');
	const derived = /** @type {Buffer} */ (await scrypt(password, salt, keyBuffer.length || KEY_LENGTH));
	return keyBuffer.length === derived.length && timingSafeEqual(keyBuffer, derived);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
	return EMAIL_REGEX.test(email);
}

/** Wandelt ein User-Dokument in ein sicheres Objekt ohne Passwort-Hash um. */
export function serializeUser(doc) {
	return {
		id: doc._id.toString(),
		email: doc.email,
		name: typeof doc.name === 'string' ? doc.name : '',
		calorieGoal: doc.calorieGoal ?? DEFAULT_SETTINGS.calorieGoal,
		proteinGoal: doc.proteinGoal ?? DEFAULT_SETTINGS.proteinGoal,
		carbsGoal: doc.carbsGoal ?? DEFAULT_SETTINGS.carbsGoal,
		fatGoal: doc.fatGoal ?? DEFAULT_SETTINGS.fatGoal,
		// Körperdaten für die Bedarfsberechnung (null, bis das Onboarding ausgefüllt ist)
		sex: doc.sex ?? null,
		age: typeof doc.age === 'number' ? doc.age : null,
		height: typeof doc.height === 'number' ? doc.height : null,
		weight: typeof doc.weight === 'number' ? doc.weight : null,
		activityLevel: doc.activityLevel ?? null,
		goal: doc.goal ?? null,
		onboarded: Boolean(doc.onboardedAt)
	};
}

/**
 * Legt einen neuen Account an. Wirft Error('EMAIL_TAKEN') wenn die E-Mail
 * bereits existiert. Gibt die neue userId (ObjectId) zurück.
 */
export async function registerUser({ email, password, name }) {
	const database = await getDb();
	const now = new Date();
	const doc = {
		email: email.trim().toLowerCase(),
		passwordHash: await hashPassword(password),
		name: (name ?? '').trim().slice(0, 60),
		calorieGoal: DEFAULT_SETTINGS.calorieGoal,
		proteinGoal: DEFAULT_SETTINGS.proteinGoal,
		carbsGoal: DEFAULT_SETTINGS.carbsGoal,
		fatGoal: DEFAULT_SETTINGS.fatGoal,
		createdAt: now,
		updatedAt: now
	};
	try {
		const result = await database.collection('users').insertOne(doc);
		return result.insertedId;
	} catch (error) {
		if (error?.code === 11000) {
			throw new Error('EMAIL_TAKEN');
		}
		throw error;
	}
}

/**
 * Prüft Anmeldedaten. Gibt das User-Dokument bei Erfolg zurück, sonst null.
 * Bei unbekannter E-Mail wird dennoch ein Hash berechnet, damit die Antwortzeit
 * keine Rückschlüsse auf existierende Accounts zulässt.
 */
export async function authenticateUser(email, password) {
	const database = await getDb();
	const user = await database.collection('users').findOne({ email: email.trim().toLowerCase() });
	if (!user) {
		await verifyPassword(password, 'x:0000');
		return null;
	}
	const ok = await verifyPassword(password, user.passwordHash);
	return ok ? user : null;
}

/** Erstellt eine Session für den Benutzer und gibt das Token zurück. */
export async function createSession(userId) {
	const database = await getDb();
	const token = randomBytes(32).toString('hex');
	const now = new Date();
	await database.collection('sessions').insertOne({
		_id: token,
		userId: typeof userId === 'string' ? new ObjectId(userId) : userId,
		createdAt: now,
		expiresAt: new Date(now.getTime() + SESSION_TTL_SECONDS * 1000)
	});
	return token;
}

/**
 * Löst ein Session-Token zum (serialisierten) Benutzer auf.
 * Abgelaufene Sessions werden entfernt und es wird null zurückgegeben.
 */
export async function getSessionUser(token) {
	if (!token) return null;
	try {
		const database = await getDb();
		const session = await database.collection('sessions').findOne({ _id: token });
		if (!session) return null;
		if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
			await database.collection('sessions').deleteOne({ _id: token });
			return null;
		}
		const user = await database.collection('users').findOne({ _id: session.userId });
		return user ? serializeUser(user) : null;
	} catch (error) {
		console.error('Session konnte nicht aufgelöst werden:', error);
		return null;
	}
}

/** Beendet eine Session (Logout). */
export async function destroySession(token) {
	if (!token) return;
	try {
		const database = await getDb();
		await database.collection('sessions').deleteOne({ _id: token });
	} catch (error) {
		console.error('Session konnte nicht gelöscht werden:', error);
	}
}
