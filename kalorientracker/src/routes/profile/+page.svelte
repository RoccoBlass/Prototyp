<script>
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();

	const start = form?.values ?? data.settings;

	let name = $state(String(start.name ?? ''));
	let goalInput = $state(String(start.calorieGoal ?? data.settings.calorieGoal));
	let proteinGoal = $state(String(start.proteinGoal ?? data.settings.proteinGoal));
	let carbsGoal = $state(String(start.carbsGoal ?? data.settings.carbsGoal));
	let fatGoal = $state(String(start.fatGoal ?? data.settings.fatGoal));

	const showSuccess = $derived(page.url.searchParams.get('success') === '1');

	const presets = [1500, 1800, 2000, 2200, 2500, 3000];

	const macros = [
		{ state: () => proteinGoal, set: (v) => (proteinGoal = v), name: 'proteinGoal', label: 'Protein', icon: 'beef' },
		{ state: () => carbsGoal, set: (v) => (carbsGoal = v), name: 'carbsGoal', label: 'Kohlenhydrate', icon: 'wheat' },
		{ state: () => fatGoal, set: (v) => (fatGoal = v), name: 'fatGoal', label: 'Fett', icon: 'droplet' }
	];
</script>

<div class="profile-page">
	<div class="page-header">
		<h1>Profil</h1>
		<p class="subtitle">Persönliche Einstellungen für deinen Kalorientracker.</p>
	</div>

	{#if showSuccess}
		<div class="success-banner" role="status">
			<Icon name="check-circle" size={18} />
			<span>Einstellungen aktualisiert</span>
		</div>
	{/if}

	<section class="profile-card">
		<div class="profile-head">
			<span class="profile-avatar"><Icon name="user" size={28} /></span>
			<div class="profile-meta">
				<span class="profile-name">{data.settings.name || 'Mein Profil'}</span>
				<span class="profile-sub">Aktuelles Tagesziel: {data.settings.calorieGoal} kcal</span>
			</div>
		</div>
	</section>

	{#if form?.error}
		<div class="error-banner" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<form method="POST" action="?/updateProfile" class="settings-form">
		<section class="card">
			<header class="card-head">
				<span class="card-icon"><Icon name="user" size={20} /></span>
				<div>
					<h2>Persönliche Angaben</h2>
					<p>Wird in der Seitenleiste angezeigt.</p>
				</div>
			</header>

			<label class="field">
				<span class="field-label">Name</span>
				<div class="input-wrap">
					<input
						type="text"
						name="name"
						maxlength="60"
						placeholder="Dein Name"
						bind:value={name}
					/>
				</div>
			</label>
		</section>

		<section class="card">
			<header class="card-head">
				<span class="card-icon"><Icon name="target" size={20} /></span>
				<div>
					<h2>Tägliches Kalorienziel</h2>
					<p>Wird auf dem Dashboard und im Verlauf verwendet.</p>
				</div>
			</header>

			<label class="field">
				<span class="field-label">Kalorien pro Tag (kcal)</span>
				<div class="input-wrap">
					<input
						type="number"
						name="calorieGoal"
						min="500"
						max="10000"
						step="50"
						required
						bind:value={goalInput}
					/>
					<span class="input-suffix">kcal</span>
				</div>
			</label>

			<div class="presets">
				<span class="preset-label">Vorschläge</span>
				<div class="preset-list">
					{#each presets as p (p)}
						<button
							type="button"
							class="preset"
							class:selected={Number(goalInput) === p}
							onclick={() => (goalInput = String(p))}
						>
							{p}
						</button>
					{/each}
				</div>
			</div>
		</section>

		<section class="card">
			<header class="card-head">
				<span class="card-icon"><Icon name="wheat" size={20} /></span>
				<div>
					<h2>Makro-Ziele</h2>
					<p>Zielwerte pro Tag für die Nährstoff-Übersicht.</p>
				</div>
			</header>

			<div class="macro-grid">
				{#each macros as m (m.name)}
					<label class="field">
						<span class="field-label">{m.label} (g)</span>
						<div class="input-wrap">
							<input
								type="number"
								name={m.name}
								min="5"
								max="1000"
								step="5"
								required
								value={m.state()}
								oninput={(e) => m.set(e.currentTarget.value)}
							/>
							<span class="input-suffix">g</span>
						</div>
					</label>
				{/each}
			</div>
		</section>

		<button type="submit" class="save-btn">
			<Icon name="check-circle" size={16} />
			<span>Speichern</span>
		</button>
	</form>
</div>

<style>
	.profile-page {
		display: flex;
		flex-direction: column;
	}

	.page-header {
		margin-bottom: 18px;
	}

	.page-header h1 {
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
		margin: 0 0 4px;
	}

	.subtitle {
		font-size: 0.88rem;
		color: var(--text-muted);
		margin: 0;
	}

	.success-banner {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		margin-bottom: 14px;
		font-size: 0.86rem;
		font-weight: 600;
		border: 1px solid #bbf7d0;
		align-self: flex-start;
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--danger-soft);
		color: #b91c1c;
		padding: 11px 14px;
		border-radius: var(--radius-sm);
		margin-bottom: 14px;
		font-size: 0.88rem;
		font-weight: 500;
		border: 1px solid #fecaca;
	}

	.profile-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 18px;
		box-shadow: var(--shadow-sm);
		margin-bottom: 14px;
	}

	.profile-head {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.profile-avatar {
		width: 56px;
		height: 56px;
		border-radius: 999px;
		background: linear-gradient(135deg, #22c55e, #16a34a);
		color: white;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
	}

	.profile-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.profile-name {
		font-size: 1.05rem;
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.01em;
	}

	.profile-sub {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.settings-form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 18px;
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.card-head {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin: 0;
	}

	.card-icon {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-head h2 {
		font-size: 1rem;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 2px;
		letter-spacing: -0.01em;
	}

	.card-head p {
		font-size: 0.82rem;
		color: var(--text-muted);
		margin: 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-label {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-wrap input {
		width: 100%;
		padding: 13px 60px 13px 14px;
		border: 1.5px solid var(--border);
		border-radius: 10px;
		font-size: 1rem;
		font-weight: 600;
		font-family: inherit;
		background: var(--surface);
		color: var(--text);
		outline: none;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		-webkit-appearance: none;
	}

	.input-wrap input:focus {
		border-color: var(--brand);
		box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
	}

	.input-suffix {
		position: absolute;
		right: 14px;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text-subtle);
		pointer-events: none;
	}

	.presets {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.preset-label {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.preset-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.preset {
		padding: 7px 13px;
		border-radius: 999px;
		border: 1.5px solid var(--border);
		background: var(--surface);
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		font-family: inherit;
		transition:
			border-color 0.15s,
			background 0.15s,
			color 0.15s;
	}

	.preset:hover {
		border-color: var(--border-strong);
		color: var(--text);
	}

	.preset.selected {
		background: var(--brand-soft);
		border-color: var(--brand);
		color: var(--brand-strong);
	}

	.macro-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 14px;
	}

	.save-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		background: var(--brand);
		color: white;
		border: none;
		padding: 13px 20px;
		border-radius: 10px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
		transition: background 0.15s;
		align-self: flex-start;
	}

	.save-btn:hover {
		background: var(--brand-strong);
	}

	@media (min-width: 600px) {
		.macro-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 900px) {
		.page-header h1 {
			font-size: 1.7rem;
		}

		.subtitle {
			font-size: 0.95rem;
		}

		.profile-card,
		.card {
			padding: 22px 24px;
		}

		.card-head h2 {
			font-size: 1.1rem;
		}
	}
</style>
