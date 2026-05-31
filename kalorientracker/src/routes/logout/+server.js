import { redirect } from '@sveltejs/kit';
import { destroySession, SESSION_COOKIE } from '$lib/server/auth.js';

export async function POST({ cookies }) {
	const token = cookies.get(SESSION_COOKIE);
	await destroySession(token);
	cookies.delete(SESSION_COOKIE, { path: '/' });
	redirect(303, '/login');
}
