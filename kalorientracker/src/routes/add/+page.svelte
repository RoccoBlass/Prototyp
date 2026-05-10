<script>
	import { untrack } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	let { form } = $props();

	const mealTypes = [
		{ value: 'fruehstueck', label: 'Frühstück', icon: 'sunrise' },
		{ value: 'mittagessen', label: 'Mittagessen', icon: 'sun' },
		{ value: 'abendessen', label: 'Abendessen', icon: 'moon' },
		{ value: 'snack', label: 'Snack', icon: 'cookie' }
	];

	let selectedType = $state(untrack(() => form?.values?.mealType ?? ''));
</script>

<div class="add-page">
	<div class="page-header">
		<h1>Mahlzeit erfassen</h1>
		<p class="subtitle">Trage Nährwerte und Kalorien für deine Mahlzeit ein.</p>
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
				<label for="name">Name der Mahlzeit *</label>
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
				<span class="label-text">Mahlzeitentyp *</span>
				<input type="hidden" name="mealType" value={selectedType} required />
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

		<button type="submit" class="submit-btn">
			<Icon name="check-circle" size={18} />
			<span>Mahlzeit speichern</span>
		</button>
	</form>
</div>

<style>
	.add-page {
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

	.error-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--danger-soft);
		color: #b91c1c;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		margin-bottom: 14px;
		font-size: 0.88rem;
		font-weight: 500;
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
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.07em;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 7px;
		flex: 1;
		min-width: 0;
	}

	label,
	.label-text {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text);
	}

	input {
		padding: 12px 14px;
		border: 1.5px solid var(--border);
		border-radius: 10px;
		font-size: 0.95rem;
		color: var(--text);
		background: var(--surface);
		outline: none;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		width: 100%;
		-webkit-appearance: none;
		appearance: none;
	}

	input:focus {
		border-color: var(--brand);
		box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
	}

	input::placeholder {
		color: var(--text-subtle);
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
		padding: 12px 14px;
		border: 1.5px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text);
		text-align: left;
		transition:
			border-color 0.15s,
			background 0.15s,
			color 0.15s;
	}

	.type-option:hover {
		border-color: var(--border-strong);
	}

	.type-option.selected {
		border-color: var(--brand);
		background: var(--brand-soft-2);
		color: var(--brand-strong);
	}

	.type-icon {
		color: var(--text-muted);
		display: inline-flex;
		flex-shrink: 0;
	}

	.type-option.selected .type-icon {
		color: var(--brand);
	}

	.form-row {
		display: flex;
		gap: 10px;
	}

	.submit-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: var(--brand);
		color: white;
		border: none;
		padding: 14px;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);
		transition:
			background 0.15s,
			transform 0.1s;
		width: 100%;
	}

	.submit-btn:hover {
		background: var(--brand-strong);
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
