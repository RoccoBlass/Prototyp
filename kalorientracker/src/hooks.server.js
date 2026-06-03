import { redirect } from '@sveltejs/kit';
import { getSessionUser, SESSION_COOKIE } from '$lib/server/auth.js';
import { withRequestDb } from '$lib/server/db.js';

const LOGIN_PATH = '/login';
const LOGOUT_PATH = '/logout';
const ONBOARDING_PATH = '/onboarding';

/**
 * Läuft bei jedem Request:
 *  1. Session-Cookie auflösen und den Benutzer in event.locals.user legen.
 *  2. Zugriffsschutz: Nicht angemeldete Nutzer → /login. Angemeldete Nutzer, die
 *     das Onboarding noch nicht abgeschlossen haben → /onboarding.
 */
export function handle({ event, resolve }) {
	// Den gesamten Request in withRequestDb kapseln: Auf Cloudflare wird so genau
	// eine DB-Verbindung pro Request geöffnet (von Hooks + Load + Actions geteilt)
	// und am Ende wieder geschlossen. Auf Node nur ein einfacher Durchlauf.
	return withRequestDb(async () => {
		const token = event.cookies.get(SESSION_COOKIE);
		const user = token ? await getSessionUser(token) : null;
		event.locals.user = user;

		const path = event.url.pathname;
		const isLoginPage = path === LOGIN_PATH;
		const isLogout = path === LOGOUT_PATH;
		const isOnboarding = path === ONBOARDING_PATH;
		// event.route.id ist nur bei echten App-Routen gesetzt (statische Assets => null).
		const isAppRoute = event.route.id !== null;

		if (!user) {
			// Nicht angemeldet: nur Login (und der Logout-Endpunkt) sind erlaubt.
			if (isAppRoute && !isLoginPage && !isLogout) {
				redirect(303, LOGIN_PATH);
			}
		} else {
			// Angemeldete Nutzer brauchen die Login-Seite nicht.
			if (isLoginPage) {
				redirect(303, '/');
			}
			// Onboarding muss zuerst abgeschlossen werden.
			if (!user.onboarded && isAppRoute && !isOnboarding && !isLogout) {
				redirect(303, ONBOARDING_PATH);
			}
			// Fertige Nutzer sehen das Onboarding nicht erneut.
			if (user.onboarded && isOnboarding) {
				redirect(303, '/');
			}
		}

		// Farbschema serverseitig in den <html>-Tag schreiben (Default: Dark),
		// damit die Seite ohne Flackern direkt im richtigen Modus rendert.
		const theme = user?.theme === 'light' ? 'light' : 'dark';
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%theme%', theme)
		});
	});
}
