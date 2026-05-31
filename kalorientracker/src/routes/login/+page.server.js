import { fail, redirect } from '@sveltejs/kit';
import {
	registerUser,
	authenticateUser,
	createSession,
	isValidEmail,
	SESSION_COOKIE,
	SESSION_TTL_SECONDS
} from '$lib/server/auth.js';

function setSessionCookie(cookies, token) {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: SESSION_TTL_SECONDS
	});
}

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '');

		if (!isValidEmail(email) || !password) {
			return fail(400, {
				mode: 'login',
				error: 'Bitte gültige E-Mail und Passwort eingeben.',
				email
			});
		}

		let user;
		try {
			user = await authenticateUser(email, password);
		} catch (error) {
			console.error('Login fehlgeschlagen:', error);
			return fail(500, {
				mode: 'login',
				error: 'Anmeldung momentan nicht möglich. Bitte später erneut versuchen.',
				email
			});
		}

		if (!user) {
			return fail(400, { mode: 'login', error: 'E-Mail oder Passwort ist falsch.', email });
		}

		setSessionCookie(cookies, await createSession(user._id));
		redirect(303, '/');
	},

	register: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim();
		const name = String(data.get('name') ?? '').trim();
		const password = String(data.get('password') ?? '');
		const confirm = String(data.get('confirm') ?? '');

		const values = { mode: 'register', email, name };

		if (!isValidEmail(email)) {
			return fail(400, { ...values, error: 'Bitte eine gültige E-Mail-Adresse eingeben.' });
		}
		if (password.length < 8) {
			return fail(400, { ...values, error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' });
		}
		if (password !== confirm) {
			return fail(400, { ...values, error: 'Die Passwörter stimmen nicht überein.' });
		}

		let userId;
		try {
			userId = await registerUser({ email, password, name });
		} catch (error) {
			if (error?.message === 'EMAIL_TAKEN') {
				return fail(400, {
					...values,
					error: 'Diese E-Mail ist bereits registriert. Bitte melde dich an.'
				});
			}
			console.error('Registrierung fehlgeschlagen:', error);
			return fail(500, {
				...values,
				error: 'Registrierung momentan nicht möglich. Bitte später erneut versuchen.'
			});
		}

		setSessionCookie(cookies, await createSession(userId));
		redirect(303, '/');
	}
};
