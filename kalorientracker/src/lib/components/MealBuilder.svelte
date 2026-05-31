<script>
	import Icon from './Icon.svelte';
	import { mealTotals, scaleNutrition } from '$lib/food.js';

	let { meal = null, foods = [], action = '?/save', submitLabel = 'Speichern' } = $props();

	let nextKey = 0;
	const initItems = (meal?.items ?? []).map((it) => ({ ...it, amount: String(it.amount), key: nextKey++ }));

	let name = $state(meal?.name ?? '');
	let items = $state(initItems);

	let pickerOpen = $state(false);
	let pickerTab = $state('own');
	let ownQuery = $state('');

	let searchQuery = $state('');
	let searchResults = $state([]);
	let searching = $state(false);
	let searchError = $state('');
	let searchTimer;

	let mName = $state('');
	let mUnit = $state('g');
	let mKcal = $state('');
	let mProtein = $state('');
	let mCarbs = $state('');
	let mFat = $state('');

	const totals = $derived(mealTotals(items.map((it) => ({ ...it, amount: Number(it.amount) || 0 }))));

	const ownFiltered = $derived.by(() => {
		const q = ownQuery.trim().toLowerCase();
		return q ? foods.filter((f) => f.name.toLowerCase().includes(q)) : foods;
	});

	const itemsJson = $derived(
		JSON.stringify(
			items.map((it) => ({
				foodId: it.foodId ?? null,
				name: it.name,
				unit: it.unit === 'ml' ? 'ml' : 'g',
				amount: Number(it.amount) || 0,
				caloriesPer100: Number(it.caloriesPer100) || 0,
				proteinPer100: Number(it.proteinPer100) || 0,
				carbsPer100: Number(it.carbsPer100) || 0,
				fatPer100: Number(it.fatPer100) || 0
			}))
		)
	);

	const canSave = $derived(
		name.trim().length > 0 && items.length > 0 && items.every((it) => Number(it.amount) > 0)
	);

	function addItem(src) {
		items = [
			...items,
			{
				key: nextKey++,
				foodId: src._id ?? null,
				name: src.name,
				unit: src.unit === 'ml' ? 'ml' : 'g',
				amount: '100',
				caloriesPer100: src.caloriesPer100,
				proteinPer100: src.proteinPer100,
				carbsPer100: src.carbsPer100,
				fatPer100: src.fatPer100
			}
		];
	}

	function removeItem(key) {
		items = items.filter((it) => it.key !== key);
	}

	async function runSearch() {
		const q = searchQuery.trim();
		if (q.length < 2) {
			searchResults = [];
			return;
		}
		searching = true;
		searchError = '';
		try {
			const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`);
			if (!res.ok) throw new Error('search failed');
			const data = await res.json();
			searchResults = data.results ?? [];
		} catch {
			searchError = 'Suche fehlgeschlagen. Bitte erneut versuchen.';
			searchResults = [];
		} finally {
			searching = false;
		}
	}

	function onSearchInput() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(runSearch, 400);
	}

	function addManual() {
		const kcal = Number(mKcal);
		if (!mName.trim() || !Number.isFinite(kcal) || kcal < 0) return;
		addItem({
			name: mName.trim(),
			unit: mUnit,
			caloriesPer100: kcal,
			proteinPer100: Number(mProtein) || 0,
			carbsPer100: Number(mCarbs) || 0,
			fatPer100: Number(mFat) || 0
		});
		mName = '';
		mKcal = '';
		mProtein = '';
		mCarbs = '';
		mFat = '';
	}
</script>

<form method="POST" {action} class="builder">
	<input type="hidden" name="items" value={itemsJson} />

	<section class="card">
		<label class="field">
			<span class="field-label">Name der Mahlzeit</span>
			<input class="input" type="text" name="name" maxlength="80" placeholder="z. B. Protein-Frühstück" bind:value={name} required />
		</label>
	</section>

	<section class="card">
		<header class="card-head">
			<span class="card-icon"><Icon name="utensils" size={18} /></span>
			<div>
				<h2>Zutaten</h2>
				<p>{items.length} {items.length === 1 ? 'Lebensmittel' : 'Lebensmittel'}</p>
			</div>
		</header>

		{#if items.length}
			<ul class="items">
				{#each items as item, i (item.key)}
					{@const n = scaleNutrition(item, Number(item.amount) || 0)}
					<li class="item">
						<div class="item-info">
							<span class="item-name">{item.name}</span>
							<span class="item-kcal">{n.calories} kcal</span>
						</div>
						<div class="item-amount">
							<input
								class="amount-input"
								type="number"
								inputmode="decimal"
								min="0"
								step="1"
								bind:value={items[i].amount}
								aria-label="Menge für {item.name}"
							/>
							<span class="amount-unit">{item.unit}</span>
						</div>
						<button type="button" class="item-remove" onclick={() => removeItem(item.key)} aria-label="Zutat entfernen">
							<Icon name="trash" size={15} />
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">Noch keine Zutaten. Füge unten Lebensmittel hinzu.</p>
		{/if}

		{#if !pickerOpen}
			<button type="button" class="add-item-btn" onclick={() => (pickerOpen = true)}>
				<Icon name="plus" size={18} stroke={2.4} />
				<span>Zutat hinzufügen</span>
			</button>
		{:else}
			<div class="picker">
				<div class="picker-head">
					<div class="tabs">
						<button type="button" class="tab" class:active={pickerTab === 'own'} onclick={() => (pickerTab = 'own')}>Meine</button>
						<button type="button" class="tab" class:active={pickerTab === 'search'} onclick={() => (pickerTab = 'search')}>Suchen</button>
						<button type="button" class="tab" class:active={pickerTab === 'manual'} onclick={() => (pickerTab = 'manual')}>Eigenes</button>
					</div>
					<button type="button" class="picker-close" onclick={() => (pickerOpen = false)} aria-label="Schließen">
						<Icon name="plus" size={18} />
					</button>
				</div>

				{#if pickerTab === 'own'}
					<input class="input picker-search" type="search" placeholder="Eigene Lebensmittel filtern…" bind:value={ownQuery} />
					{#if ownFiltered.length}
						<ul class="results">
							{#each ownFiltered as f (f._id)}
								<li>
									<button type="button" class="result" onclick={() => addItem(f)}>
										<span class="result-name">{f.name}</span>
										<span class="result-meta">{f.caloriesPer100} kcal / 100 {f.unit}</span>
									</button>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="picker-empty">Keine eigenen Lebensmittel. Lege sie im Tab „Eigenes" oder unter Lebensmittel an.</p>
					{/if}
				{:else if pickerTab === 'search'}
					<input class="input picker-search" type="search" placeholder="In Open Food Facts suchen…" bind:value={searchQuery} oninput={onSearchInput} />
					{#if searching}
						<p class="picker-empty">Suche läuft…</p>
					{:else if searchError}
						<p class="picker-empty err">{searchError}</p>
					{:else if searchResults.length}
						<ul class="results">
							{#each searchResults as r (r.offId ?? r.name)}
								<li>
									<button type="button" class="result" onclick={() => addItem(r)}>
										<span class="result-name">{r.name}</span>
										<span class="result-meta">{r.caloriesPer100} kcal / 100 {r.unit}</span>
									</button>
								</li>
							{/each}
						</ul>
					{:else if searchQuery.trim().length >= 2}
						<p class="picker-empty">Keine Treffer.</p>
					{:else}
						<p class="picker-empty">Mindestens 2 Zeichen eingeben.</p>
					{/if}
				{:else}
					<div class="manual">
						<input class="input" type="text" placeholder="Name" bind:value={mName} maxlength="120" />
						<div class="manual-row">
							<select class="input" bind:value={mUnit}>
								<option value="g">g</option>
								<option value="ml">ml</option>
							</select>
							<input class="input" type="number" inputmode="numeric" min="0" max="900" placeholder="kcal/100" bind:value={mKcal} />
						</div>
						<div class="manual-row three">
							<input class="input" type="number" inputmode="decimal" min="0" max="100" placeholder="P" bind:value={mProtein} />
							<input class="input" type="number" inputmode="decimal" min="0" max="100" placeholder="KH" bind:value={mCarbs} />
							<input class="input" type="number" inputmode="decimal" min="0" max="100" placeholder="F" bind:value={mFat} />
						</div>
						<button type="button" class="manual-add" onclick={addManual} disabled={!mName.trim() || !mKcal}>
							<Icon name="plus" size={16} stroke={2.4} />
							<span>Als Zutat hinzufügen</span>
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</section>

	<section class="card totals-card">
		<div class="totals">
			<div class="total-cal">
				<span class="total-val">{totals.calories}</span>
				<span class="total-unit">kcal gesamt</span>
			</div>
			<div class="total-macros">
				<span class="tm" style="--cs: var(--protein-soft);">P {totals.protein} g</span>
				<span class="tm" style="--cs: var(--carbs-soft);">KH {totals.carbs} g</span>
				<span class="tm" style="--cs: var(--fat-soft);">F {totals.fat} g</span>
			</div>
		</div>
	</section>

	<button type="submit" class="save-btn" disabled={!canSave}>
		<Icon name="check-circle" size={18} />
		<span>{submitLabel}</span>
	</button>
</form>

<style>
	.builder {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 22px;
		padding: 20px;
		box-shadow: 0 6px 24px rgba(15, 23, 42, 0.05);
		display: flex;
		flex-direction: column;
		gap: 14px;
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
		padding: 13px 15px;
		border: 1.5px solid transparent;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		font-family: inherit;
		background: var(--surface-2);
		color: var(--text);
		outline: none;
		transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
		-webkit-appearance: none;
		appearance: none;
	}

	.input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.14);
	}

	.items {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 13px;
		background: var(--surface-2);
	}

	.item-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.item-name {
		font-size: 0.9rem;
		font-weight: 650;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-kcal {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.item-amount {
		position: relative;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.amount-input {
		width: 78px;
		padding: 9px 30px 9px 10px;
		border: 1.5px solid var(--border);
		border-radius: 10px;
		font-size: 0.9rem;
		font-weight: 700;
		font-family: inherit;
		background: var(--surface);
		color: var(--text);
		outline: none;
		-webkit-appearance: none;
	}

	.amount-input:focus {
		border-color: var(--brand);
	}

	.amount-unit {
		position: absolute;
		right: 10px;
		font-size: 0.74rem;
		font-weight: 700;
		color: var(--text-subtle);
		pointer-events: none;
	}

	.item-remove {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		border-radius: 9px;
		border: none;
		background: transparent;
		color: var(--text-subtle);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, color 0.15s;
	}

	.item-remove:hover {
		background: var(--danger-soft);
		color: var(--danger);
	}

	.empty {
		margin: 0;
		font-size: 0.86rem;
		color: var(--text-subtle);
		text-align: center;
		padding: 8px 0;
	}

	.add-item-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		border: 1.5px solid #bbf7d0;
		padding: 12px 16px;
		border-radius: 13px;
		font-size: 0.92rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.15s;
	}

	.add-item-btn:hover {
		background: #d6f5e1;
	}

	.picker {
		border: 1.5px solid var(--border);
		border-radius: 16px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: var(--surface);
	}

	.picker-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.tabs {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: var(--surface-2);
		border-radius: 11px;
	}

	.tab {
		padding: 7px 12px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.82rem;
		font-weight: 700;
		font-family: inherit;
		cursor: pointer;
	}

	.tab.active {
		background: var(--surface);
		color: var(--brand-strong);
		box-shadow: var(--shadow-sm);
	}

	.picker-close {
		width: 32px;
		height: 32px;
		border-radius: 9px;
		border: none;
		background: var(--surface-2);
		color: var(--text-muted);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transform: rotate(45deg);
		flex-shrink: 0;
	}

	.picker-search {
		background: var(--surface-2);
	}

	.results {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		max-height: 260px;
		overflow-y: auto;
	}

	.result {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 2px;
		align-items: flex-start;
		text-align: left;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 11px;
		background: var(--surface);
		cursor: pointer;
		font-family: inherit;
		transition: border-color 0.15s, background 0.15s;
	}

	.result:hover {
		border-color: var(--brand);
		background: var(--brand-soft-2);
	}

	.result-name {
		font-size: 0.88rem;
		font-weight: 650;
		color: var(--text);
	}

	.result-meta {
		font-size: 0.74rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.picker-empty {
		margin: 0;
		font-size: 0.82rem;
		color: var(--text-subtle);
		text-align: center;
		padding: 10px 0;
	}

	.picker-empty.err {
		color: var(--danger);
	}

	.manual {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.manual-row {
		display: grid;
		grid-template-columns: 90px 1fr;
		gap: 8px;
	}

	.manual-row.three {
		grid-template-columns: repeat(3, 1fr);
	}

	.manual .input {
		padding: 11px 12px;
		font-size: 0.92rem;
	}

	.manual-add {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		background: var(--brand);
		color: #fff;
		border: none;
		padding: 11px 14px;
		border-radius: 11px;
		font-size: 0.88rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.15s, opacity 0.15s;
	}

	.manual-add:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.totals-card {
		padding: 18px 20px;
	}

	.totals {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.total-cal {
		display: flex;
		flex-direction: column;
	}

	.total-val {
		font-size: 1.7rem;
		font-weight: 850;
		letter-spacing: -0.02em;
		color: var(--brand-strong);
		line-height: 1;
	}

	.total-unit {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--text-muted);
	}

	.total-macros {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.tm {
		font-size: 0.76rem;
		font-weight: 700;
		color: var(--text);
		background: var(--cs);
		padding: 5px 10px;
		border-radius: 999px;
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
		transition: transform 0.12s ease, background 0.15s, opacity 0.15s;
	}

	.save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		box-shadow: none;
	}

	.save-btn:hover:not(:disabled) {
		background: var(--brand-strong);
	}

	.save-btn:active:not(:disabled) {
		transform: translateY(1px);
	}
</style>
