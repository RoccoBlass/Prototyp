<script>
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();

	const values = $derived(form?.values ?? data.template);

	function confirmDelete(event) {
		if (!confirm(`Vorlage „${data.template.name}" wirklich löschen?`)) {
			event.preventDefault();
		}
	}
</script>

<div class="edit-page">
	<a href="/add" class="back-link">
		<Icon name="arrow-left" size={16} />
		<span>Zurück</span>
	</a>

	<div class="page-header">
		<h1>Vorlage bearbeiten</h1>
		<p class="subtitle">Änderungen wirken sich nur auf zukünftige Einträge aus.</p>
	</div>

	{#if form?.error}
		<div class="error-banner" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<form method="POST" action="?/update" class="meal-form">
		<div class="form-card">
			<div class="form-group">
				<label for="name">Name *</label>
				<input
					id="name"
					name="name"
					type="text"
					value={values.name ?? ''}
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
					value={values.calories ?? ''}
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
						value={values.protein ?? ''}
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
						value={values.carbs ?? ''}
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
						value={values.fat ?? ''}
						min="0"
						max="999"
					/>
				</div>
			</div>
		</div>

		<button type="submit" class="submit-btn">
			<Icon name="check-circle" size={18} />
			<span>Änderungen speichern</span>
		</button>
	</form>

	<form method="POST" action="?/delete" class="delete-form" onsubmit={confirmDelete}>
		<button type="submit" class="delete-btn">
			<Icon name="trash" size={16} />
			<span>Vorlage löschen</span>
		</button>
	</form>
</div>

<style>
	.edit-page {
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

	label {
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

	.form-row {
		display: flex;
		gap: 10px;
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
		font-family: inherit;
	}

	.submit-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 26px rgba(22, 163, 74, 0.42);
	}

	.submit-btn:active {
		transform: scale(0.99);
	}

	.delete-form {
		margin-top: 24px;
	}

	.delete-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: transparent;
		color: var(--danger);
		border: 1.5px solid var(--danger-soft);
		padding: 13px 18px;
		border-radius: 14px;
		font-size: 0.9rem;
		font-weight: 650;
		cursor: pointer;
		font-family: inherit;
		transition:
			background 0.15s,
			border-color 0.15s;
	}

	.delete-btn:hover {
		background: var(--danger-soft);
		border-color: #fecaca;
	}

	@media (min-width: 900px) {
		.edit-page {
			max-width: 640px;
		}

		.page-header h1 {
			font-size: 1.7rem;
		}

		.subtitle {
			font-size: 0.95rem;
		}

		.form-card {
			padding: 22px;
		}
	}
</style>
