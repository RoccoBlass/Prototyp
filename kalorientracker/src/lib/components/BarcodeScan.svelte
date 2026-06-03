<script>
	import Icon from './Icon.svelte';
	import { scaleNutrition } from '$lib/food.js';

	let { selectedType } = $props();

	let photo = $state('');
	let photoError = $state('');
	let busy = $state(false);
	let statusMsg = $state('');
	let apiError = $state('');
	let done = $state(false);
	let found = $state(false);
	let code = $state('');
	let manualCode = $state('');

	// Editierbare Felder – mit dem OFF-Treffer vorbefüllt, vom Nutzer korrigierbar.
	let name = $state('');
	let unit = $state('g');
	let kcal = $state('');
	let protein = $state('');
	let carbs = $state('');
	let fat = $state('');
	let amount = $state('100');

	const portion = $derived(
		scaleNutrition(
			{
				caloriesPer100: Number(kcal),
				proteinPer100: Number(protein),
				carbsPer100: Number(carbs),
				fatPer100: Number(fat)
			},
			Number(amount) || 0
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

	async function processFile(file) {
		if (!file) return;
		photoError = '';
		apiError = '';
		done = false;
		if (!file.type.startsWith('image/')) {
			photoError = 'Bitte eine Bilddatei wählen.';
			return;
		}
		try {
			// Etwas höhere Auflösung als bei der Foto-Schätzung – hilft beim Decodieren.
			photo = await resizeImage(file, 1280, 0.82);
		} catch {
			photoError = 'Bild konnte nicht verarbeitet werden.';
		}
	}

	function onFile(event) {
		processFile(event.currentTarget.files?.[0]);
	}

	/** Versucht, den Barcode direkt im Browser zu decodieren (wenn unterstützt). */
	async function detectNative(dataUrl) {
		if (typeof window === 'undefined' || !('BarcodeDetector' in window)) return null;
		try {
			const detector = new window.BarcodeDetector({
				formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
			});
			const img = await new Promise((res, rej) => {
				const i = new Image();
				i.onload = () => res(i);
				i.onerror = rej;
				i.src = dataUrl;
			});
			const results = await detector.detect(img);
			const hit = results.find((r) => /^\d{8,14}$/.test(r.rawValue));
			return hit ? hit.rawValue : null;
		} catch {
			return null;
		}
	}

	async function lookupCode(value) {
		statusMsg = 'Produkt wird gesucht…';
		try {
			const res = await fetch(`/api/product-by-barcode?code=${encodeURIComponent(value)}`);
			if (res.ok) {
				const r = await res.json();
				name = r.name;
				unit = r.unit;
				kcal = String(r.caloriesPer100);
				protein = String(r.proteinPer100);
				carbs = String(r.carbsPer100);
				fat = String(r.fatPer100);
				amount = '100';
				found = true;
				done = true;
			} else if (res.status === 404) {
				// Barcode erkannt, aber nicht in der Datenbank → manuell ergänzen.
				name = '';
				unit = 'g';
				kcal = '';
				protein = '';
				carbs = '';
				fat = '';
				amount = '100';
				found = false;
				done = true;
			} else {
				const e = await res.json().catch(() => null);
				throw new Error(e?.message || 'Suche fehlgeschlagen.');
			}
		} catch (e) {
			apiError = e instanceof Error ? e.message : 'Suche fehlgeschlagen.';
		}
	}

	async function scan() {
		if (!photo || busy) return;
		busy = true;
		apiError = '';
		code = '';
		statusMsg = 'Barcode wird erkannt…';
		try {
			let detected = await detectNative(photo);
			if (!detected) {
				// Fallback: KI liest die Ziffern aus dem Foto.
				statusMsg = 'Barcode wird per KI gelesen…';
				const res = await fetch('/api/read-barcode', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ image: photo })
				});
				if (res.ok) detected = (await res.json()).code;
			}
			if (!detected) {
				apiError = 'Kein Barcode erkennbar. Bitte näher/schärfer fotografieren oder die Nummer unten eingeben.';
				return;
			}
			code = detected;
			await lookupCode(detected);
		} catch (e) {
			apiError = e instanceof Error ? e.message : 'Erkennung fehlgeschlagen.';
		} finally {
			busy = false;
			statusMsg = '';
		}
	}

	async function submitManual() {
		const value = manualCode.replace(/\D/g, '');
		if (!/^\d{8,14}$/.test(value) || busy) {
			apiError = 'Bitte eine gültige Barcode-Nummer (8–14 Ziffern) eingeben.';
			return;
		}
		busy = true;
		apiError = '';
		code = value;
		try {
			await lookupCode(value);
		} finally {
			busy = false;
			statusMsg = '';
		}
	}

	function clearPhoto() {
		photo = '';
		done = false;
		apiError = '';
		photoError = '';
		code = '';
	}
</script>

<section class="scan">
	<div class="intro">
		<span class="intro-icon"><Icon name="barcode" size={18} /></span>
		<p>
			Fotografiere den Strichcode eines Produkts – die App liest den Barcode und holt die
			Nährwerte aus der Open-Food-Facts-Datenbank. Prüfe die Werte und trage sie ein.
		</p>
	</div>

	{#if !photo}
		<label class="photo-drop">
			<Icon name="barcode" size={24} />
			<span>Barcode fotografieren oder auswählen</span>
			<input type="file" accept="image/*" capture="environment" onchange={onFile} hidden />
		</label>
	{:else}
		<div class="photo-preview">
			<img src={photo} alt="Fotografierter Barcode" />
			<button type="button" class="photo-remove" onclick={clearPhoto}>
				<Icon name="x" size={16} />
				<span>Anderes Foto</span>
			</button>
		</div>

		{#if !done}
			<button type="button" class="estimate-btn" onclick={scan} disabled={busy}>
				<Icon name="barcode" size={18} />
				<span>{busy ? statusMsg || 'Wird verarbeitet…' : 'Barcode erkennen'}</span>
			</button>
		{/if}
	{/if}

	{#if photoError}<p class="msg err">{photoError}</p>{/if}
	{#if apiError}<p class="msg err">{apiError}</p>{/if}

	{#if !done}
		<div class="manual">
			<span class="manual-label">oder Barcode-Nummer eingeben</span>
			<div class="manual-row">
				<input
					class="input"
					type="text"
					inputmode="numeric"
					placeholder="z. B. 5449000000996"
					bind:value={manualCode}
				/>
				<button type="button" class="manual-btn" onclick={submitManual} disabled={busy}>
					<Icon name="search" size={16} />
					<span>Suchen</span>
				</button>
			</div>
		</div>
	{/if}

	{#if done}
		<form method="POST" class="result">
			<input type="hidden" name="mealType" value={selectedType} />

			{#if found}
				<div class="conf conf-hoch">
					<Icon name="check-circle" size={15} />
					<span>In Open Food Facts gefunden · Barcode {code}</span>
				</div>
			{:else}
				<div class="conf conf-niedrig">
					<Icon name="alert" size={15} />
					<span>Barcode {code} nicht in der Datenbank – bitte Werte ergänzen.</span>
				</div>
			{/if}

			<label class="field">
				<span class="field-label">Name</span>
				<input class="input" type="text" name="name" maxlength="120" bind:value={name} required />
			</label>

			<div class="row">
				<label class="field">
					<span class="field-label">Einheit</span>
					<select class="input" name="unit" bind:value={unit}>
						<option value="g">Gramm (g)</option>
						<option value="ml">Milliliter (ml)</option>
					</select>
				</label>
				<label class="field">
					<span class="field-label">Kalorien /100 {unit}</span>
					<div class="input-wrap">
						<input class="input" type="number" name="caloriesPer100" inputmode="numeric" min="0" max="900" step="1" bind:value={kcal} required />
						<span class="suffix">kcal</span>
					</div>
				</label>
			</div>

			<div class="macro-grid">
				<label class="field">
					<span class="field-label">Protein</span>
					<div class="input-wrap">
						<input class="input" type="number" name="proteinPer100" inputmode="decimal" min="0" max="100" step="0.1" bind:value={protein} required />
						<span class="suffix">g</span>
					</div>
				</label>
				<label class="field">
					<span class="field-label">Kohlenh.</span>
					<div class="input-wrap">
						<input class="input" type="number" name="carbsPer100" inputmode="decimal" min="0" max="100" step="0.1" bind:value={carbs} required />
						<span class="suffix">g</span>
					</div>
				</label>
				<label class="field">
					<span class="field-label">Fett</span>
					<div class="input-wrap">
						<input class="input" type="number" name="fatPer100" inputmode="decimal" min="0" max="100" step="0.1" bind:value={fat} required />
						<span class="suffix">g</span>
					</div>
				</label>
			</div>

			<label class="field">
				<span class="field-label">Menge für den Eintrag</span>
				<div class="input-wrap">
					<input class="input" type="number" name="amount" inputmode="decimal" min="1" max="5000" step="1" bind:value={amount} />
					<span class="suffix">{unit}</span>
				</div>
			</label>

			<p class="portion">
				Ergibt für {amount || 0} {unit}: <strong>{portion.calories} kcal</strong>
				· {portion.protein} g P · {portion.carbs} g K · {portion.fat} g F
			</p>

			<div class="actions">
				<button type="submit" formaction="?/logFood" class="btn primary">
					<Icon name="check-circle" size={18} />
					<span>Für heute eintragen</span>
				</button>
				<button type="submit" formaction="?/saveScannedFood" class="btn ghost">
					<Icon name="plus" size={18} stroke={2.4} />
					<span>Als Lebensmittel speichern</span>
				</button>
			</div>
		</form>
	{/if}
</section>

<style>
	.scan {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.intro {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
		background: var(--brand-soft);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.intro-icon {
		color: var(--brand-strong);
		flex-shrink: 0;
		margin-top: 2px;
	}

	.intro p {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text);
		line-height: 1.45;
	}

	.photo-drop {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-8) var(--space-6);
		border: 1.5px dashed var(--border-strong);
		border-radius: var(--radius-md);
		color: var(--text-muted);
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
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
		gap: var(--space-3);
		align-items: flex-start;
	}

	.photo-preview img {
		width: 100%;
		max-height: 240px;
		object-fit: contain;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}

	.photo-remove {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		background: var(--surface-2);
		color: var(--text-muted);
		border: none;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
	}

	.estimate-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		background: var(--brand-gradient);
		color: var(--gray-0);
		border: none;
		padding: var(--space-4) var(--space-6);
		border-radius: var(--radius-md);
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 8px 20px rgb(var(--green-600-rgb) / 0.32);
		transition: transform 0.12s ease, opacity 0.15s;
	}

	.estimate-btn:disabled {
		opacity: 0.7;
		cursor: progress;
	}

	.manual {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.manual-label {
		font-size: var(--text-caption);
		font-weight: var(--weight-semibold);
		color: var(--text-subtle);
		text-align: center;
	}

	.manual-row {
		display: flex;
		gap: var(--space-2);
	}

	.manual-row .input {
		flex: 1;
	}

	.manual-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		background: var(--surface-2);
		color: var(--text);
		border: 1.5px solid var(--border);
		padding: 0 var(--space-4);
		border-radius: var(--radius-sm);
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
		flex-shrink: 0;
	}

	.manual-btn:hover:not(:disabled) {
		border-color: var(--brand);
		color: var(--brand-strong);
	}

	.msg.err {
		margin: 0;
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
		color: var(--danger);
	}

	.result {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		box-shadow: var(--shadow-sm);
	}

	.conf {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		align-self: flex-start;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		font-size: var(--text-caption);
		font-weight: var(--weight-bold);
		background: var(--surface-2);
		color: var(--text-muted);
	}

	.conf-hoch {
		background: var(--brand-soft);
		color: var(--brand-strong);
	}

	.conf-niedrig {
		background: var(--danger-soft);
		color: var(--danger);
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

	.input {
		width: 100%;
		padding: var(--space-4);
		border: 1.5px solid transparent;
		border-radius: var(--radius-sm);
		font-size: var(--text-body);
		font-weight: var(--weight-semibold);
		font-family: inherit;
		background: var(--surface-2);
		color: var(--text);
		outline: none;
		-webkit-appearance: none;
		appearance: none;
		transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
	}

	select.input {
		cursor: pointer;
	}

	.input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: var(--focus-ring);
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-wrap .input {
		padding-right: var(--space-12);
	}

	.suffix {
		position: absolute;
		right: 14px;
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		color: var(--text-subtle);
		pointer-events: none;
	}

	.macro-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.macro-grid .input {
		padding: var(--space-3) var(--space-6) var(--space-3) var(--space-3);
	}

	.macro-grid .suffix {
		right: 11px;
	}

	.macro-grid .field-label {
		font-size: var(--text-caption);
	}

	.portion {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-muted);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-6);
		border-radius: var(--radius-md);
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
		border: 1.5px solid transparent;
		transition: background 0.15s, transform 0.12s ease;
	}

	.btn.primary {
		background: var(--brand);
		color: var(--gray-0);
		box-shadow: 0 8px 20px rgb(var(--green-600-rgb) / 0.32);
	}

	.btn.primary:hover {
		background: var(--brand-strong);
	}

	.btn.ghost {
		background: var(--surface-2);
		color: var(--text);
		border-color: var(--border);
	}

	.btn.ghost:hover {
		border-color: var(--brand);
		color: var(--brand-strong);
	}

	.btn:active {
		transform: translateY(1px);
	}

	@media (min-width: 600px) {
		.actions {
			flex-direction: row;
		}

		.btn {
			flex: 1;
		}
	}
</style>
