import { redirect } from '@sveltejs/kit';
import { getSessionUser, SESSION_COOKIE } from '$lib/server/auth.js';

const LOGIN_PATH = '/login';
const LOGOUT_PATH = '/logout';

/**
 * Läuft bei jedem Request:
 *  1. Session-Cookie auflösen und den Benutzer in event.locals.user legen.
 *  2. Zugriffsschutz: Nicht angemeldete Nutzer werden auf /login geleitet,
 *     bereits angemeldete Nutzer von /login wieder ins Dashboard.
 */
export async function handle({ event, resolve }) {
	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.user = token ? await getSessionUser(token) : null;

	const path = event.url.pathname;
	const isLoginPage = path === LOGIN_PATH;
	const isLogout = path === LOGOUT_PATH;

	// event.route.id ist nur bei echten App-Routen gesetzt (statische Assets => null).
	const isAppRoute = event.route.id !== null;

	if (!event.locals.user && isAppRoute && !isLoginPage && !isLogout) {
		redirect(303, LOGIN_PATH);
	}

	if (event.locals.user && isLoginPage) {
		redirect(303, '/');
	}

	return resolve(event);
}
