import { getSettings } from '$lib/server/db.js';

export async function load() {
	const settings = await getSettings();
	return { settings };
}
