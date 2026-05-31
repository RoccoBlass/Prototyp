<script>
	import Icon from './Icon.svelte';
	import { scaleNutrition } from '$lib/food.js';

	let { food = null, action = '?/save', submitLabel = 'Speichern' } = $props();

	let name = $state(food?.name ?? '');
	let unit = $state(food?.unit ?? 'g');
	let kcal = $state(food ? String(food.caloriesPer100) : '');
	let protein = $state(food ? String(food.proteinPer100) : '');
	let carbs = $state(food ? String(food.carbsPer100) : '');
	let fat = $state(food ? String(food.fatPer100) : '');
	let photo = $state(food?.photo ?? '');
	let photoError = $state('');

	const preview = $derived(
		scaleNutrition(
			{
				caloriesPer100: Number(kcal),
				proteinPer100: Number(protein),
				carbsPer100: Number(carbs),
				fatPer100: Number(fat)
			},
			100
		)
	);

	function resizeImage(file, maxSize, quality) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = () => reject(new Error('read'));
			reader.onload = () => {
				const img = new Image();
				img.onerror = () => reject(new Error('decode'));
				img.onload = () => {
					let { width, height } = img;
					if (width >= height && width > maxSize) {
						height = Math.round((height * maxSize) / width);
						width = maxSize;
					} else if (height > maxSize) {
						width = Math.round((width * maxSize) / height);
						height = maxSize;
					}
					const canvas = document.createElement('canvas');
					canvas.width = width;
					canvas.height = height;
					canvas.getContext('2d').drawImage(img, 0, 0, width, height);
					resolve(canvas.toDataURL('image/jpeg', quality));
				};
				img.src = /** @type {string} */ (reader.result);
			};
			reader.readAsDataURL(file);
		});
	}

	async function onFile(event) {
		const file = event.currentTarget.files?.[0];
		if (!file) return;
		photoError = '';
		if (!file.type.startsWith('image/')) {
			photoError = 'Bitte eine Bilddatei wählen.';
			return;
		}
		try {
			photo = await resizeImage(file, 400, 0.7);
		} catch {
			photoError = 'Bild konnte nicht verarbeitet werden.';
		}
	}
</script>

<form method="POST" {action} class="food-form">
	<input type="hidden" name="photo" value={photo} />

	<section class="card">
		<label class="field">
			<span class="field-label">Name</span>
			<input class="input" type="text" name="name" maxlength="120" placeholder="z. B. Magerquark" bind:value={name} required />
		</label>

		<label class="field">
			<span class="field-label">Einheit (Basis: 100 {unit})</span>
			<select class="input" name="unit" bind:value={unit}>
				<option value="g">Gramm (g)</option>
				<option value="ml">Milliliter (ml)</option>
			</select>
		</label>
	</section>

	<section class="card">
		<header class="card-head">
			<span class="card-icon"><Icon name="flame" size={18} /></span>
			<div>
				<h2>Nährwerte je 100 {unit}</h2>
				<p>Werte beziehen sich auf 100 {unit}.</p>
			</div>
		</header>

		<label class="field">
			<span class="field-label">Kalorien</span>
			<div class="input-wrap">
				<input class="input" type="number" name="caloriesPer100" inputmode="numeric" min="0" max="900" step="1" placeholder="0" bind:value={kcal} required />
				<span class="suffix">kcal</span>
			</div>
		</label>

		<div class="macro-grid">
			<label class="field">
				<span class="field-label">Protein</span>
				<div class="input-wrap">
					<input class="input" type="number" name="proteinPer100" inputmode="decimal" min="0" max="100" step="0.1" placeholder="0" bind:value={protein} required />
					<span class="suffix">g</span>
				</div>
			</label>
			<label class="field">
				<span class="field-label">Kohlenh.</span>
				<div class="input-wrap">
					<input class="input" type="number" name="carbsPer100" inputmode="decimal" min="0" max="100" step="0.1" placeholder="0" bind:value={carbs} required />
					<span class="suffix">g</span>
				</div>
			</label>
			<label class="field">
				<span class="field-label">Fett</span>
				<div class="input-wrap">
					<input class="input" type="number" name="fatPer100" inputmode="decimal" min="0" max="100" step="0.1" placeholder="0" bind:value={fat} required />
					<span class="suffix">g</span>
				</div>
			</label>
		</div>
	</section>

	<section class="card">
		<header class="card-head">
			<span class="card-icon"><Icon name="utensils" size={18} /></span>
			<div>
				<h2>Foto (optional)</h2>
				<p>Wird im Browser verkleinert gespeichert.</p>
			</div>
		</header>

		{#if photo}
			<div class="photo-preview">
				<img src={photo} alt="Vorschau" />
				<button type="button" class="photo-remove" onclick={() => (photo = '')}>
					<Icon name="trash" size={16} />
					<span>Foto entfernen</span>
				</button>
			</div>
		{:else}
			<label class="photo-drop">
				<Icon name="plus" size={20} />
				<span>Foto auswählen</span>
				<input type="file" accept="image/*" onchange={onFile} hidden />
			</label>
		{/if}
		{#if photoError}<p class="photo-error">{photoError}</p>{/if}
	</section>

	<button type="submit" class="save-btn">
		<Icon name="check-circle" size={18} />
		<span>{submitLabel}</span>
	</button>
</form>

<style>
	.food-form {
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
		gap: 16px;
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
		font-size: 1.02rem;
		font-weight: 750;
		color: var(--text);
		margin: 0 0 2px;
	}

	.card-head p {
		font-size: 0.82rem;
		color: var(--text-muted);
		margin: 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.field-label {
		font-size: 0.84rem;
		font-weight: 650;
		color: var(--text-muted);
	}

	.input {
		width: 100%;
		padding: 14px 16px;
		border: 1.5px solid transparent;
		border-radius: 13px;
		font-size: 1.02rem;
		font-weight: 600;
		font-family: inherit;
		background: var(--surface-2);
		color: var(--text);
		outline: none;
		transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
		-webkit-appearance: none;
		appearance: none;
	}

	select.input {
		cursor: pointer;
	}

	.input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.14);
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-wrap .input {
		padding-right: 46px;
	}

	.suffix {
		position: absolute;
		right: 14px;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text-subtle);
		pointer-events: none;
	}

	.macro-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
	}

	.macro-grid .input {
		padding: 13px 28px 13px 12px;
		font-size: 0.98rem;
	}

	.macro-grid .suffix {
		right: 11px;
	}

	.macro-grid .field-label {
		font-size: 0.74rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.photo-drop {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 26px;
		border: 1.5px dashed var(--border-strong);
		border-radius: 16px;
		color: var(--text-muted);
		font-size: 0.88rem;
		font-weight: 650;
		cursor: pointer;
		background: var(--surface-2);
		transition: border-color 0.15s, color 0.15s;
	}

	.photo-drop:hover {
		border-color: var(--brand);
		color: var(--brand-strong);
	}

	.photo-preview {
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: flex-start;
	}

	.photo-preview img {
		width: 100%;
		max-height: 220px;
		object-fit: cover;
		border-radius: 14px;
	}

	.photo-remove {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: var(--danger-soft);
		color: var(--danger);
		border: none;
		padding: 9px 14px;
		border-radius: 11px;
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
	}

	.photo-error {
		margin: 0;
		font-size: 0.82rem;
		color: var(--danger);
	}

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
		transition: transform 0.12s ease, background 0.15s;
	}

	.save-btn:hover {
		background: var(--brand-strong);
	}

	.save-btn:active {
		transform: translateY(1px);
	}
</style>
