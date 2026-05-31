<script>
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import {
		SEXES,
		ACTIVITY_LEVELS,
		GOALS,
		LIMITS,
		calculateTargets,
		caloriesFromMacros
	} from '$lib/nutrition.js';

	let { data, form } = $props();

	const start = form?.values ?? data.user;

	let name = $state(String(start.name ?? ''));
	let sex = $state(start.sex ?? 'female');
	let age = $state(String(start.age ?? ''));
	let height = $state(String(start.height ?? ''));
	let weight = $state(String(start.weight ?? ''));
	let activityLevel = $state(start.activityLevel ?? 'moderate');
	let goal = $state(start.goal ?? 'maintain');

	let proteinGoal = $state(String(start.proteinGoal ?? data.user.proteinGoal));
	let carbsGoal = $state(String(start.carbsGoal ?? data.user.carbsGoal));
	let fatGoal = $state(String(start.fatGoal ?? data.user.fatGoal));

	const calorieSum = $derived(
		caloriesFromMacros({
			proteinGoal: Number(proteinGoal),
			carbsGoal: Number(carbsGoal),
			fatGoal: Number(fatGoal)
		})
	);

	const bodyValid = $derived(
		Number(age) > 0 && Number(height) > 0 && Number(weight) > 0 && !!sex && !!activityLevel && !!goal
	);

	function applyBodyCalc() {
		if (!bodyValid) return;
		const t = calculateTargets({
			sex,
			age: Number(age),
			height: Number(height),
			weight: Number(weight),
			activityLevel,
			goal
		});
		proteinGoal = String(t.proteinGoal);
		carbsGoal = String(t.carbsGoal);
		fatGoal = String(t.fatGoal);
	}

	const showSuccess = $derived(page.url.searchParams.get('success') === '1');
	const initials = $derived(
		(name.trim() || 'Profil')
			.split(/\s+/)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
	);
</script>

<div class="profile-page">
	<section class="hero">
		<div class="hero-bg"></div>
		<div class="hero-content">
			<span class="avatar">{initials}</span>
			<div class="hero-text">
				<h1>{name.trim() || 'Mein Profil'}</h1>
				<p>{data.user.email}</p>
			</div>
		</div>
	</section>

	{#if showSuccess}
		<div class="toast toast-ok" role="status">
			<Icon name="check-circle" size={18} />
			<span>Profil gespeichert</span>
		</div>
	{/if}

	{#if form?.error}
		<div class="toast toast-err" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<form method="POST" action="?/updateProfile" class="settings-form">
		<section class="card">
			<header class="card-head">
				<span class="card-icon"><Icon name="user" size={18} /></span>
				<div>
					<h2>Persönliche Angaben</h2>
					<p>Dein Name erscheint in der Seitenleiste.</p>
				</div>
			</header>
			<label class="field">
				<span class="field-label">Name</span>
				<input
					class="input"
					type="text"
					name="name"
					maxlength="60"
					placeholder="Dein Name"
					bind:value={name}
				/>
			</label>
		</section>

		<section class="card">
			<header class="card-head">
				<span class="card-icon"><Icon name="activity" size={18} /></span>
				<div>
					<h2>Körperdaten &amp; Ziel</h2>
					<p>Basis für die Berechnung über den Button unten.</p>
				</div>
			</header>

			<div class="grid2">
				<label class="field">
					<span class="field-label">Geschlecht</span>
					<select class="input" name="sex" bind:value={sex}>
						{#each SEXES as s (s.key)}
							<option value={s.key}>{s.label}</option>
						{/each}
					</select>
				</label>

				<label class="field">
					<span class="field-label">Alter</span>
					<div class="input-wrap">
						<input
							class="input"
							type="number"
							name="age"
							inputmode="numeric"
							min={LIMITS.age.min}
							max={LIMITS.age.max}
							required
							bind:value={age}
						/>
						<span class="suffix">J.</span>
					</div>
				</label>

				<label class="field">
					<span class="field-label">Größe</span>
					<div class="input-wrap">
						<input
							class="input"
							type="number"
							name="height"
							inputmode="numeric"
							min={LIMITS.height.min}
							max={LIMITS.height.max}
							required
							bind:value={height}
						/>
						<span class="suffix">cm</span>
					</div>
				</label>

				<label class="field">
					<span class="field-label">Gewicht</span>
					<div class="input-wrap">
						<input
							class="input"
							type="number"
							name="weight"
							inputmode="decimal"
							step="0.5"
							min={LIMITS.weight.min}
							max={LIMITS.weight.max}
							required
							bind:value={weight}
						/>
						<span class="suffix">kg</span>
					</div>
				</label>
			</div>

			<label class="field">
				<span class="field-label">Aktivitätsniveau</span>
				<select class="input" name="activityLevel" bind:value={activityLevel}>
					{#each ACTIVITY_LEVELS as level (level.key)}
						<option value={level.key}>{level.label} – {level.hint}</option>
					{/each}
				</select>
			</label>

			<label class="field">
				<span class="field-label">Ziel</span>
				<select class="input" name="goal" bind:value={goal}>
					{#each GOALS as g (g.key)}
						<option value={g.key}>{g.label} – {g.hint}</option>
					{/each}
				</select>
			</label>
		</section>

		<section class="card summary-card">
			<header class="card-head">
				<span class="card-icon"><Icon name="target" size={18} /></span>
				<div>
					<h2>Tagesziel</h2>
					<p>Pass die Makros an – die Kalorien ergeben sich daraus (4/4/9 kcal je g).</p>
				</div>
			</header>

			<div class="kcal">
				<span class="kcal-value">{calorieSum}</span>
				<span class="kcal-unit">kcal / Tag</span>
			</div>

			<div class="macro-inputs">
				<label class="field macro-field">
					<span class="field-label">Protein</span>
					<div class="input-wrap">
						<input
							class="input"
							type="number"
							name="proteinGoal"
							inputmode="numeric"
							min="20"
							max="500"
							required
							bind:value={proteinGoal}
						/>
						<span class="suffix">g</span>
					</div>
				</label>
				<label class="field macro-field">
					<span class="field-label">Kohlenhydrate</span>
					<div class="input-wrap">
						<input
							class="input"
							type="number"
							name="carbsGoal"
							inputmode="numeric"
							min="0"
							max="1000"
							required
							bind:value={carbsGoal}
						/>
						<span class="suffix">g</span>
					</div>
				</label>
				<label class="field macro-field">
					<span class="field-label">Fett</span>
					<div class="input-wrap">
						<input
							class="input"
							type="number"
							name="fatGoal"
							inputmode="numeric"
							min="10"
							max="400"
							required
							bind:value={fatGoal}
						/>
						<span class="suffix">g</span>
					</div>
				</label>
			</div>

			<button type="button" class="calc-btn" onclick={applyBodyCalc} disabled={!bodyValid}>
				<Icon name="activity" size={16} />
				<span>Aus Körperdaten berechnen</span>
			</button>
		</section>

		<button type="submit" class="save-btn">
			<Icon name="check-circle" size={18} />
			<span>Speichern</span>
		</button>
	</form>

	<section class="card account-card">
		<header class="card-head">
			<span class="card-icon"><Icon name="user" size={18} /></span>
			<div>
				<h2>Konto</h2>
				<p>Angemeldet als {data.user.email}</p>
			</div>
		</header>
		<form method="POST" action="/logout">
			<button type="submit" class="logout-btn">
				<Icon name="log-out" size={18} />
				<span>Abmelden</span>
			</button>
		</form>
	</section>
</div>

<style>
	.profile-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* Hero – kompakt & dezent */
	.hero {
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		padding: var(--space-4) var(--space-6);
		color: var(--gray-0);
		isolation: isolate;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(135deg, var(--green-600), var(--green-700));
	}

	.hero-content {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		background: rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(4px);
		border: 1px solid rgba(255, 255, 255, 0.35);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-h2);
		font-weight: var(--weight-extrabold);
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}

	.hero-text h1 {
		margin: 0;
		font-size: var(--text-h1);
		font-weight: var(--weight-extrabold);
		letter-spacing: -0.02em;
	}

	.hero-text p {
		margin: var(--space-1) 0 0;
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
		color: rgba(255, 255, 255, 0.85);
	}

	/* Toasts */
	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
	}

	.toast-ok {
		background: var(--brand-soft);
		color: var(--brand-strong);
		border: 1px solid var(--green-200);
	}

	.toast-err {
		background: var(--danger-soft);
		color: var(--red-700);
		border: 1px solid var(--red-200);
	}

	/* Form */
	.settings-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		box-shadow: 0 6px 24px rgb(var(--gray-900-rgb) / 0.05);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.card-icon {
		width: 42px;
		height: 42px;
		border-radius: var(--radius-md);
		background: var(--brand-soft);
		color: var(--brand-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-head h2 {
		font-size: var(--text-h1);
		font-weight: var(--weight-extrabold);
		color: var(--text);
		margin: 0 0 var(--space-1);
		letter-spacing: -0.02em;
	}

	.card-head p {
		font-size: var(--text-caption);
		color: var(--text-subtle);
		margin: 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field-label {
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
		color: var(--text-muted);
	}

	.grid2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input {
		width: 100%;
		padding: var(--space-4) var(--space-4);
		border: 1.5px solid transparent;
		border-radius: var(--radius-md);
		font-size: var(--text-h2);
		font-weight: var(--weight-semibold);
		font-family: inherit;
		background: var(--surface-2);
		color: var(--text);
		outline: none;
		transition:
			border-color 0.18s ease,
			background 0.18s ease,
			box-shadow 0.18s ease;
		-webkit-appearance: none;
		appearance: none;
	}

	select.input {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239aa3b2' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 14px center;
		padding-right: 42px;
		cursor: pointer;
	}

	.input::placeholder {
		color: var(--text-subtle);
		font-weight: var(--weight-medium);
	}

	.input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: var(--focus-ring);
	}

	.input-wrap .input {
		padding-right: var(--space-12);
	}

	.suffix {
		position: absolute;
		right: 16px;
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		color: var(--text-subtle);
		pointer-events: none;
	}

	/* Computed summary */
	.summary-card {
		background: linear-gradient(180deg, var(--brand-soft-2), var(--surface) 70%);
	}

	.kcal {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		background: var(--surface);
		border: 1px solid var(--green-200);
	}

	.kcal-value {
		font-size: var(--text-display-lg);
		font-weight: var(--weight-extrabold);
		letter-spacing: -0.03em;
		color: var(--brand-strong);
		line-height: 1;
	}

	.kcal-unit {
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		color: var(--brand-strong);
	}

	.macro-inputs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.macro-field {
		gap: var(--space-2);
	}

	.macro-field .field-label {
		font-size: var(--text-caption);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.macro-field .input {
		padding: var(--space-3) var(--space-8) var(--space-3) var(--space-3);
		font-size: var(--text-body);
	}

	.macro-field .suffix {
		right: 11px;
	}

	.calc-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		background: var(--surface);
		color: var(--brand-strong);
		border: 1.5px solid var(--green-200);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-sm);
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
		transition:
			background 0.15s,
			opacity 0.15s,
			transform 0.12s;
	}

	.calc-btn:hover:not(:disabled) {
		background: var(--brand-soft-2);
	}

	.calc-btn:active:not(:disabled) {
		transform: translateY(1px);
	}

	.calc-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Save */
	.save-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		background: var(--brand);
		color: var(--gray-0);
		border: none;
		padding: var(--space-4) var(--space-6);
		border-radius: var(--radius-md);
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 8px 20px rgb(var(--green-600-rgb) / 0.32);
		transition:
			transform 0.12s ease,
			background 0.15s;
		position: sticky;
		bottom: 16px;
	}

	.save-btn:hover {
		background: var(--brand-strong);
	}

	.save-btn:active {
		transform: translateY(1px);
	}

	.logout-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		background: var(--surface-2);
		color: var(--danger);
		border: 1.5px solid var(--border);
		padding: var(--space-4) var(--space-6);
		border-radius: var(--radius-md);
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
		transition:
			background 0.15s ease,
			border-color 0.15s ease,
			transform 0.12s ease;
	}

	.logout-btn:hover {
		background: var(--danger-soft);
		border-color: var(--red-200);
	}

	.logout-btn:active {
		transform: translateY(1px);
	}

	@media (min-width: 900px) {
		.hero {
			padding: var(--space-6) var(--space-6);
		}

		.hero-text h1 {
			font-size: var(--text-h1);
		}

		.card {
			padding: var(--space-6) var(--space-6);
		}

		.save-btn {
			align-self: flex-start;
			padding: var(--space-4) var(--space-8);
			position: static;
		}
	}
</style>
