<script>
	import Icon from '$lib/components/Icon.svelte';

	let { form } = $props();

	// Nach einem fehlgeschlagenen Versuch auf dem passenden Tab bleiben.
	let mode = $state(form?.mode === 'register' ? 'register' : 'login');

	function setMode(next) {
		mode = next;
	}
</script>

<svelte:head>
	<title>{mode === 'register' ? 'Registrieren' : 'Anmelden'} · Kalorientracker</title>
</svelte:head>

<div class="auth">
	<div class="auth-card">
		<div class="brand">
			<span class="brand-mark"><Icon name="flame" size={22} /></span>
			<span class="brand-text">Kalorientracker</span>
		</div>

		<div class="intro">
			<h1>{mode === 'register' ? 'Konto erstellen' : 'Willkommen zurück'}</h1>
			<p>
				{mode === 'register'
					? 'Registriere dich, um deine Mahlzeiten und Ziele zu speichern.'
					: 'Melde dich an, um deinen Kalorientracker zu öffnen.'}
			</p>
		</div>

		<div class="tabs" role="tablist">
			<button
				type="button"
				role="tab"
				class="tab"
				class:active={mode === 'login'}
				aria-selected={mode === 'login'}
				onclick={() => setMode('login')}
			>
				Anmelden
			</button>
			<button
				type="button"
				role="tab"
				class="tab"
				class:active={mode === 'register'}
				aria-selected={mode === 'register'}
				onclick={() => setMode('register')}
			>
				Registrieren
			</button>
		</div>

		{#if form?.error}
			<div class="alert" role="alert">
				<Icon name="alert" size={18} />
				<span>{form.error}</span>
			</div>
		{/if}

		{#if mode === 'login'}
			<form method="POST" action="?/login" class="form">
				<label class="field">
					<span class="field-label">E-Mail</span>
					<div class="input-wrap">
						<span class="input-icon"><Icon name="mail" size={18} /></span>
						<input
							class="input"
							type="email"
							name="email"
							autocomplete="email"
							placeholder="du@beispiel.ch"
							value={form?.email ?? ''}
							required
						/>
					</div>
				</label>

				<label class="field">
					<span class="field-label">Passwort</span>
					<div class="input-wrap">
						<span class="input-icon"><Icon name="lock" size={18} /></span>
						<input
							class="input"
							type="password"
							name="password"
							autocomplete="current-password"
							placeholder="••••••••"
							required
						/>
					</div>
				</label>

				<button type="submit" class="submit">
					<Icon name="log-out" size={18} />
					<span>Anmelden</span>
				</button>
			</form>
		{:else}
			<form method="POST" action="?/register" class="form">
				<label class="field">
					<span class="field-label">Name <span class="optional">(optional)</span></span>
					<div class="input-wrap">
						<span class="input-icon"><Icon name="user" size={18} /></span>
						<input
							class="input"
							type="text"
							name="name"
							autocomplete="name"
							maxlength="60"
							placeholder="Dein Name"
							value={form?.name ?? ''}
						/>
					</div>
				</label>

				<label class="field">
					<span class="field-label">E-Mail</span>
					<div class="input-wrap">
						<span class="input-icon"><Icon name="mail" size={18} /></span>
						<input
							class="input"
							type="email"
							name="email"
							autocomplete="email"
							placeholder="du@beispiel.ch"
							value={form?.email ?? ''}
							required
						/>
					</div>
				</label>

				<label class="field">
					<span class="field-label">Passwort <span class="optional">(min. 8 Zeichen)</span></span>
					<div class="input-wrap">
						<span class="input-icon"><Icon name="lock" size={18} /></span>
						<input
							class="input"
							type="password"
							name="password"
							autocomplete="new-password"
							placeholder="••••••••"
							minlength="8"
							required
						/>
					</div>
				</label>

				<label class="field">
					<span class="field-label">Passwort bestätigen</span>
					<div class="input-wrap">
						<span class="input-icon"><Icon name="lock" size={18} /></span>
						<input
							class="input"
							type="password"
							name="confirm"
							autocomplete="new-password"
							placeholder="••••••••"
							minlength="8"
							required
						/>
					</div>
				</label>

				<button type="submit" class="submit">
					<Icon name="check-circle" size={18} />
					<span>Konto erstellen</span>
				</button>
			</form>
		{/if}

		<p class="switch">
			{#if mode === 'login'}
				Noch kein Konto?
				<button type="button" class="link" onclick={() => setMode('register')}>
					Jetzt registrieren
				</button>
			{:else}
				Bereits registriert?
				<button type="button" class="link" onclick={() => setMode('login')}> Anmelden </button>
			{/if}
		</p>
	</div>
</div>

<style>
	.auth {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px 18px calc(24px + env(safe-area-inset-bottom, 0));
		position: relative;
		isolation: isolate;
	}

	.auth::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			radial-gradient(120% 120% at 0% 0%, #34d399 0%, transparent 50%),
			radial-gradient(120% 120% at 100% 100%, #15803d 0%, transparent 55%),
			linear-gradient(135deg, #16a34a 0%, #15803d 55%, #166534 100%);
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
		background: rgba(255, 255, 255, 0.97);
		border: 1px solid rgba(255, 255, 255, 0.6);
		border-radius: 26px;
		padding: 30px 26px 26px;
		box-shadow: 0 24px 60px rgba(8, 40, 22, 0.32);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 11px;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
		font-size: 1.05rem;
	}

	.brand-mark {
		width: 40px;
		height: 40px;
		border-radius: 13px;
		background: var(--brand-gradient);
		color: #fff;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6px 16px rgba(22, 163, 74, 0.42);
	}

	.intro h1 {
		margin: 0 0 6px;
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.intro p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.45;
		color: var(--text-muted);
	}

	.tabs {
		display: flex;
		gap: 4px;
		padding: 5px;
		background: var(--surface-2);
		border-radius: 14px;
	}

	.tab {
		flex: 1;
		padding: 10px 12px;
		border: none;
		border-radius: 10px;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 700;
		font-family: inherit;
		cursor: pointer;
		transition:
			background 0.18s ease,
			color 0.18s ease,
			box-shadow 0.18s ease;
	}

	.tab.active {
		background: var(--surface);
		color: var(--brand-strong);
		box-shadow: var(--shadow-sm);
	}

	.alert {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		border-radius: 13px;
		font-size: 0.85rem;
		font-weight: 600;
		background: var(--danger-soft);
		color: #b91c1c;
		border: 1px solid #fecaca;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.field-label {
		font-size: 0.83rem;
		font-weight: 650;
		color: var(--text-muted);
	}

	.optional {
		font-weight: 500;
		color: var(--text-subtle);
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 14px;
		color: var(--text-subtle);
		display: inline-flex;
		pointer-events: none;
	}

	.input {
		width: 100%;
		padding: 14px 16px 14px 44px;
		border: 1.5px solid transparent;
		border-radius: 13px;
		font-size: 1rem;
		font-weight: 550;
		font-family: inherit;
		background: var(--surface-2);
		color: var(--text);
		outline: none;
		transition:
			border-color 0.18s ease,
			background 0.18s ease,
			box-shadow 0.18s ease;
		-webkit-appearance: none;
	}

	.input::placeholder {
		color: var(--text-subtle);
		font-weight: 500;
	}

	.input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.14);
	}

	.input-wrap:focus-within .input-icon {
		color: var(--brand);
	}

	.submit {
		margin-top: 4px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		background: var(--brand);
		color: #fff;
		border: none;
		padding: 15px 20px;
		border-radius: 14px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 8px 20px rgba(22, 163, 74, 0.32);
		transition:
			transform 0.12s ease,
			background 0.15s ease;
	}

	.submit:hover {
		background: var(--brand-strong);
	}

	.submit:active {
		transform: translateY(1px);
	}

	.switch {
		margin: 2px 0 0;
		text-align: center;
		font-size: 0.86rem;
		color: var(--text-muted);
	}

	.link {
		border: none;
		background: none;
		padding: 0;
		font: inherit;
		font-weight: 700;
		color: var(--brand-strong);
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.link:hover {
		color: var(--brand);
	}
</style>
