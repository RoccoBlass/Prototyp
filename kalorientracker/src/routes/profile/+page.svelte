<script>
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();

	const start = form?.values ?? data.settings;

	let name = $state(String(start.name ?? ''));
	let calorieGoal = $state(String(start.calorieGoal ?? data.settings.calorieGoal));
	let proteinGoal = $state(String(start.proteinGoal ?? data.settings.proteinGoal));
	let carbsGoal = $state(String(start.carbsGoal ?? data.settings.carbsGoal));
	let fatGoal = $state(String(start.fatGoal ?? data.settings.fatGoal));

	const showSuccess = $derived(page.url.searchParams.get('success') === '1');
	const presets = [1500, 1800, 2000, 2200, 2500, 3000];
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
				<p>{data.settings.calorieGoal} kcal Tagesziel</p>
			</div>
		</div>
	</section>

	{#if showSuccess}
		<div class="toast toast-ok" role="status">
			<Icon name="check-circle" size={18} />
			<span>Einstellungen gespeichert</span>
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
				<span class="card-icon"><Icon name="target" size={18} /></span>
				<div>
					<h2>Tägliches Kalorienziel</h2>
					<p>Steuert den Ring im Dashboard und den Verlauf.</p>
				</div>
			</header>

			<label class="field">
				<span class="field-label">Kalorien pro Tag</span>
				<div class="input-wrap">
					<input
						class="input"
						type="number"
						name="calorieGoal"
						min="500"
						max="10000"
						step="50"
						required
						bind:value={calorieGoal}
					/>
					<span class="suffix">kcal</span>
				</div>
			</label>

			<div class="chips">
				{#each presets as p (p)}
					<button
						type="button"
						class="chip"
						class:active={Number(calorieGoal) === p}
						onclick={() => (calorieGoal = String(p))}
					>
						{p}
					</button>
				{/each}
			</div>
		</section>

		<section class="card">
			<header class="card-head">
				<span class="card-icon"><Icon name="wheat" size={18} /></span>
				<div>
					<h2>Makro-Ziele</h2>
					<p>Zielwerte pro Tag für die Nährstoff-Übersicht.</p>
				</div>
			</header>

			<div class="macro-grid">
				<label class="field macro" style="--accent: var(--protein); --accent-soft: var(--protein-soft);">
					<span class="macro-top">
						<span class="dot"></span>
						<span class="field-label">Protein</span>
					</span>
					<div class="input-wrap">
						<input
							class="input"
							type="number"
							name="proteinGoal"
							min="10"
							max="500"
							step="5"
							required
							bind:value={proteinGoal}
						/>
						<span class="suffix">g</span>
					</div>
				</label>

				<label class="field macro" style="--accent: var(--carbs); --accent-soft: var(--carbs-soft);">
					<span class="macro-top">
						<span class="dot"></span>
						<span class="field-label">Kohlenhydrate</span>
					</span>
					<div class="input-wrap">
						<input
							class="input"
							type="number"
							name="carbsGoal"
							min="10"
							max="1000"
							step="5"
							required
							bind:value={carbsGoal}
						/>
						<span class="suffix">g</span>
					</div>
				</label>

				<label class="field macro" style="--accent: var(--fat); --accent-soft: var(--fat-soft);">
					<span class="macro-top">
						<span class="dot"></span>
						<span class="field-label">Fett</span>
					</span>
					<div class="input-wrap">
						<input
							class="input"
							type="number"
							name="fatGoal"
							min="5"
							max="400"
							step="5"
							required
							bind:value={fatGoal}
						/>
						<span class="suffix">g</span>
					</div>
				</label>
			</div>
		</section>

		<button type="submit" class="save-btn">
			<Icon name="check-circle" size={18} />
			<span>Speichern</span>
		</button>
	</form>
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
		gap: 20px;
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
		padding-right: 54px;
	}

	.suffix {
		position: absolute;
		right: 16px;
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text-subtle);
		pointer-events: none;
	}

	/* Calorie chips */
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.chip {
		flex: 1 1 auto;
		min-width: 64px;
		padding: 10px 12px;
		border-radius: 12px;
		border: 1.5px solid var(--border);
		background: var(--surface);
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--text-muted);
		cursor: pointer;
		font-family: inherit;
		transition:
			transform 0.12s ease,
			border-color 0.15s,
			background 0.15s,
			color 0.15s;
	}

	.chip:hover {
		border-color: var(--border-strong);
		color: var(--text);
	}

	.chip:active {
		transform: scale(0.96);
	}

	.chip.active {
		background: var(--brand);
		border-color: var(--brand);
		color: #fff;
		box-shadow: 0 4px 12px rgba(22, 163, 74, 0.32);
	}

	/* Macros */
	.macro-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 14px;
	}

	.macro {
		background: var(--accent-soft);
		border-radius: 16px;
		padding: 14px 14px 16px;
	}

	.macro-top {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.macro .dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--accent);
		flex-shrink: 0;
	}

	.macro .field-label {
		color: var(--text);
		font-weight: 700;
	}

	.macro .input {
		background: var(--surface);
	}

	.macro .input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent);
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

	@media (min-width: 600px) {
		.macro-grid {
			grid-template-columns: repeat(3, 1fr);
		}
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
