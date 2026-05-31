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
		gap: 16px;
	}

	/* Hero */
	.hero {
		position: relative;
		border-radius: 24px;
		overflow: hidden;
		padding: 28px 22px;
		color: #fff;
		isolation: isolate;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			radial-gradient(120% 120% at 0% 0%, #34d399 0%, transparent 55%),
			linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%);
	}

	.hero-content {
		display: flex;
		align-items: center;
		gap: 18px;
	}

	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 22px;
		background: rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(4px);
		border: 1px solid rgba(255, 255, 255, 0.35);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		font-weight: 800;
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}

	.hero-text h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.hero-text p {
		margin: 4px 0 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
	}

	/* Toasts */
	.toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 14px;
		font-size: 0.88rem;
		font-weight: 600;
	}

	.toast-ok {
		background: var(--brand-soft);
		color: var(--brand-strong);
		border: 1px solid #bbf7d0;
	}

	.toast-err {
		background: var(--danger-soft);
		color: #b91c1c;
		border: 1px solid #fecaca;
	}

	/* Form */
	.settings-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 22px;
		padding: 22px;
		box-shadow: 0 6px 24px rgba(15, 23, 42, 0.05);
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.card-icon {
		width: 42px;
		height: 42px;
		border-radius: 14px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-head h2 {
		font-size: 1.05rem;
		font-weight: 750;
		color: var(--text);
		margin: 0 0 3px;
		letter-spacing: -0.01em;
	}

	.card-head p {
		font-size: 0.83rem;
		color: var(--text-muted);
		margin: 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 9px;
	}

	.field-label {
		font-size: 0.85rem;
		font-weight: 650;
		color: var(--text-muted);
	}

	.grid2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input {
		width: 100%;
		padding: 15px 16px;
		border: 1.5px solid transparent;
		border-radius: 14px;
		font-size: 1.05rem;
		font-weight: 650;
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
		font-weight: 500;
	}

	.input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.14);
	}

	.input-wrap .input {
		padding-right: 48px;
	}

	.suffix {
		position: absolute;
		right: 16px;
		font-size: 0.85rem;
		font-weight: 700;
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
		gap: 2px;
		padding: 14px;
		border-radius: 18px;
		background: var(--surface);
		border: 1px solid #bbf7d0;
	}

	.kcal-value {
		font-size: 2.4rem;
		font-weight: 850;
		letter-spacing: -0.03em;
		color: var(--brand-strong);
		line-height: 1;
	}

	.kcal-unit {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--brand-strong);
	}

	.macro-inputs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
	}

	.macro-field {
		gap: 7px;
	}

	.macro-field .field-label {
		font-size: 0.74rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.macro-field .input {
		padding: 13px 30px 13px 12px;
		font-size: 1rem;
	}

	.macro-field .suffix {
		right: 11px;
	}

	.calc-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		background: var(--surface);
		color: var(--brand-strong);
		border: 1.5px solid #bbf7d0;
		padding: 12px 16px;
		border-radius: 13px;
		font-size: 0.9rem;
		font-weight: 700;
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
		gap: 8px;
		background: var(--brand);
		color: #fff;
		border: none;
		padding: 16px 20px;
		border-radius: 16px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 8px 20px rgba(22, 163, 74, 0.32);
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
		gap: 8px;
		width: 100%;
		background: var(--surface-2);
		color: var(--danger);
		border: 1.5px solid var(--border);
		padding: 14px 20px;
		border-radius: 14px;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		transition:
			background 0.15s ease,
			border-color 0.15s ease,
			transform 0.12s ease;
	}

	.logout-btn:hover {
		background: var(--danger-soft);
		border-color: #fecaca;
	}

	.logout-btn:active {
		transform: translateY(1px);
	}

	@media (min-width: 900px) {
		.hero {
			padding: 34px 30px;
		}

		.hero-text h1 {
			font-size: 1.8rem;
		}

		.card {
			padding: 26px 28px;
		}

		.save-btn {
			align-self: flex-start;
			padding: 15px 32px;
			position: static;
		}
	}
</style>
