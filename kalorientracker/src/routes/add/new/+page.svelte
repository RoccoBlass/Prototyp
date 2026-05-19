<script>
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';

	let { form } = $props();

	const mealTypes = [
		{ value: 'fruehstueck', label: 'Frühstück', icon: 'sunrise' },
		{ value: 'mittagessen', label: 'Mittagessen', icon: 'sun' },
		{ value: 'abendessen', label: 'Abendessen', icon: 'moon' },
		{ value: 'snack', label: 'Snack', icon: 'cookie' }
	];

	const initialMealType = untrack(
		() => form?.values?.mealType ?? page.url.searchParams.get('mealType') ?? 'mittagessen'
	);
	const initialLogToday = untrack(() => form?.values?.logToday ?? true);

	let selectedType = $state(initialMealType);
	let logToday = $state(Boolean(initialLogToday));
</script>

<div class="add-page">
	<a href="/add" class="back-link">
		<Icon name="arrow-left" size={16} />
		<span>Zurück</span>
	</a>

	<div class="page-header">
		<h1>Neue Vorlage anlegen</h1>
		<p class="subtitle">
			Speichere eine Mahlzeit, die du immer wieder isst — du kannst sie später jederzeit erneut
			auswählen.
		</p>
	</div>

	{#if form?.error}
		<div class="error-banner" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<form method="POST" class="meal-form">
		<div class="form-card">
			<div class="form-group">
				<label for="name">Name *</label>
				<input
					id="name"
					name="name"
					type="text"
					placeholder="z.B. Haferflocken mit Beeren"
					value={form?.values?.name ?? ''}
					required
					autocomplete="off"
				/>
			</div>

			<div class="form-group">
				<label for="calories">Kalorien (kcal) *</label>
				<input
					id="calories"
					name="calories"
					type="number"
					inputmode="numeric"
					placeholder="z.B. 350"
					value={form?.values?.calories ?? ''}
					min="1"
					max="9999"
					required
				/>
			</div>
		</div>

		<div class="form-card">
			<span class="card-label">Makronährstoffe (optional)</span>
			<div class="form-row">
				<div class="form-group">
					<label for="protein">Protein (g)</label>
					<input
						id="protein"
						name="protein"
						type="number"
						inputmode="numeric"
						placeholder="0"
						value={form?.values?.protein ?? ''}
						min="0"
						max="999"
					/>
				</div>
				<div class="form-group">
					<label for="carbs">Kohlenhydrate (g)</label>
					<input
						id="carbs"
						name="carbs"
						type="number"
						inputmode="numeric"
						placeholder="0"
						value={form?.values?.carbs ?? ''}
						min="0"
						max="999"
					/>
				</div>
				<div class="form-group">
					<label for="fat">Fett (g)</label>
					<input
						id="fat"
						name="fat"
						type="number"
						inputmode="numeric"
						placeholder="0"
						value={form?.values?.fat ?? ''}
						min="0"
						max="999"
					/>
				</div>
			</div>
		</div>

		<div class="form-card toggle-card">
			<label class="toggle">
				<input type="checkbox" name="logToday" bind:checked={logToday} />
				<span class="toggle-track"><span class="toggle-knob"></span></span>
				<span class="toggle-text">
					<span class="toggle-title">Direkt für heute eintragen</span>
					<span class="toggle-sub">Die Vorlage wird gespeichert und sofort als heutige Mahlzeit erfasst.</span>
				</span>
			</label>

			{#if logToday}
				<div class="form-group">
					<span class="label-text">Mahlzeitentyp</span>
					<input type="hidden" name="mealType" value={selectedType} />
					<div class="type-grid" role="radiogroup">
						{#each mealTypes as type (type.value)}
							<button
								type="button"
								class="type-option"
								class:selected={selectedType === type.value}
								onclick={() => (selectedType = type.value)}
								role="radio"
								aria-checked={selectedType === type.value}
							>
								<span class="type-icon"><Icon name={type.icon} size={18} /></span>
								<span class="type-label">{type.label}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<button type="submit" class="submit-btn">
			<Icon name="check-circle" size={18} />
			<span>{logToday ? 'Speichern & für heute eintragen' : 'Vorlage speichern'}</span>
		</button>
	</form>
</div>

<style>
	.add-page {
		display: flex;
		flex-direction: column;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 12px;
		align-self: flex-start;
		padding: 4px 0;
	}

	.back-link:hover {
		color: var(--text);
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

	.error-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--danger-soft);
		color: #b91c1c;
		padding: 13px 16px;
		border-radius: var(--radius-md);
		margin-bottom: 14px;
		font-size: 0.88rem;
		font-weight: 600;
		border: 1px solid #fecaca;
	}

	.meal-form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.form-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		box-shadow: var(--shadow-sm);
	}

	.card-label {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text);
		letter-spacing: -0.01em;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
		min-width: 0;
	}

	label,
	.label-text {
		font-size: 0.85rem;
		font-weight: 650;
		color: var(--text-muted);
	}

	input[type='text'],
	input[type='number'] {
		padding: 14px 16px;
		border: 1.5px solid transparent;
		border-radius: 14px;
		font-size: 1rem;
		font-weight: 550;
		color: var(--text);
		background: var(--surface-2);
		outline: none;
		transition:
			border-color 0.18s,
			background 0.18s,
			box-shadow 0.18s;
		width: 100%;
		font-family: inherit;
		-webkit-appearance: none;
		appearance: none;
	}

	input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.14);
	}

	input::placeholder {
		color: var(--text-subtle);
	}

	.form-row {
		display: flex;
		gap: 10px;
	}

	.toggle {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		cursor: pointer;
	}

	.toggle input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.toggle-track {
		flex-shrink: 0;
		width: 40px;
		height: 24px;
		background: var(--border-strong);
		border-radius: 999px;
		position: relative;
		transition: background 0.2s;
		margin-top: 2px;
	}

	.toggle-knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		background: white;
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s;
	}

	.toggle input:checked + .toggle-track {
		background: var(--brand);
	}

	.toggle input:checked + .toggle-track .toggle-knob {
		transform: translateX(16px);
	}

	.toggle-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.toggle-title {
		font-size: 0.92rem;
		font-weight: 600;
		color: var(--text);
	}

	.toggle-sub {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.type-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	.type-option {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 13px 14px;
		border: 1.5px solid transparent;
		border-radius: 14px;
		background: var(--surface-2);
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 650;
		color: var(--text);
		text-align: left;
		font-family: inherit;
		transition:
			border-color 0.15s,
			background 0.15s,
			color 0.15s,
			transform 0.12s;
	}

	.type-option:hover {
		background: var(--border);
	}

	.type-option:active {
		transform: scale(0.97);
	}

	.type-option.selected {
		border-color: var(--brand);
		background: var(--brand-soft);
		color: var(--brand-strong);
	}

	.type-icon {
		color: var(--text-muted);
		display: inline-flex;
	}

	.type-option.selected .type-icon {
		color: var(--brand);
	}

	.submit-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: var(--brand-gradient);
		color: white;
		border: none;
		padding: 16px;
		border-radius: 16px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 8px 20px rgba(22, 163, 74, 0.32);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
		width: 100%;
	}

	.submit-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 26px rgba(22, 163, 74, 0.42);
	}

	.submit-btn:active {
		transform: scale(0.99);
	}

	@media (min-width: 900px) {
		.add-page {
			max-width: 640px;
		}

		.page-header h1 {
			font-size: 1.7rem;
		}

		.subtitle {
			font-size: 0.95rem;
		}

		.type-grid {
			grid-template-columns: repeat(4, 1fr);
		}

		.form-card {
			padding: 22px;
		}
	}
</style>
