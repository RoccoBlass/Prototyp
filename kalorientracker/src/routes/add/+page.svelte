<script>
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import { MEAL_TYPES, defaultMealType } from '$lib/food.js';

	let { data, form } = $props();

	let selectedType = $state(defaultMealType(new Date().getHours()));
	let tab = $state(page.url.searchParams.get('tab') === 'foods' ? 'foods' : 'meals');

	let mealQuery = $state('');
	let foodQuery = $state('');

	let offQuery = $state('');
	let offResults = $state([]);
	let offSearching = $state(false);
	let offError = $state('');
	let offTimer;

	const filteredMeals = $derived.by(() => {
		const q = mealQuery.trim().toLowerCase();
		return q ? data.meals.filter((m) => m.name.toLowerCase().includes(q)) : data.meals;
	});

	const filteredFoods = $derived.by(() => {
		const q = foodQuery.trim().toLowerCase();
		return q ? data.foods.filter((f) => f.name.toLowerCase().includes(q)) : data.foods;
	});

	async function runOff() {
		const q = offQuery.trim();
		if (q.length < 2) {
			offResults = [];
			return;
		}
		offSearching = true;
		offError = '';
		try {
			const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`);
			if (!res.ok) throw new Error('failed');
			offResults = (await res.json()).results ?? [];
		} catch {
			offError = 'Suche fehlgeschlagen. Bitte erneut versuchen.';
			offResults = [];
		} finally {
			offSearching = false;
		}
	}

	function onOff() {
		clearTimeout(offTimer);
		offTimer = setTimeout(runOff, 400);
	}
</script>

{#snippet foodAddRow(food, editHref)}
	<li class="food-row">
		<form method="POST" action="?/logFood" class="food-add">
			<input type="hidden" name="mealType" value={selectedType} />
			<input type="hidden" name="foodId" value={food._id ?? ''} />
			<input type="hidden" name="name" value={food.name} />
			<input type="hidden" name="unit" value={food.unit} />
			<input type="hidden" name="caloriesPer100" value={food.caloriesPer100} />
			<input type="hidden" name="proteinPer100" value={food.proteinPer100} />
			<input type="hidden" name="carbsPer100" value={food.carbsPer100} />
			<input type="hidden" name="fatPer100" value={food.fatPer100} />

			{#if food.photo}
				<img class="thumb" src={food.photo} alt="" />
			{/if}
			<div class="food-main">
				<span class="food-name">{food.name}</span>
				<span class="food-meta">{food.caloriesPer100} kcal / 100 {food.unit}</span>
			</div>
			<div class="food-amount">
				<input class="amount" type="number" name="amount" inputmode="decimal" min="1" max="5000" value="100" aria-label="Menge" />
				<span class="amount-unit">{food.unit}</span>
			</div>
			<button type="submit" class="add-pill" aria-label="Hinzufügen">
				<Icon name="plus" size={16} stroke={2.4} />
			</button>
		</form>
		{#if editHref}
			<a href={editHref} class="row-edit" aria-label="Bearbeiten"><Icon name="pencil" size={15} /></a>
		{/if}
	</li>
{/snippet}

<div class="add-page">
	<div class="page-header">
		<h1>Hinzufügen</h1>
		<p class="subtitle">Erfasse eine Mahlzeit oder ein einzelnes Lebensmittel.</p>
	</div>

	{#if form?.error}
		<div class="alert" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<section class="card type-card">
		<span class="card-label">Mahlzeitentyp</span>
		<div class="type-grid">
			{#each MEAL_TYPES as type (type.value)}
				<button
					type="button"
					class="type-option"
					class:selected={selectedType === type.value}
					onclick={() => (selectedType = type.value)}
				>
					<span class="type-icon"><Icon name={type.icon} size={18} /></span>
					<span class="type-label">{type.label}</span>
				</button>
			{/each}
		</div>
	</section>

	<div class="tabs">
		<button type="button" class="tab" class:active={tab === 'meals'} onclick={() => (tab = 'meals')}>
			Mahlzeiten
		</button>
		<button type="button" class="tab" class:active={tab === 'foods'} onclick={() => (tab = 'foods')}>
			Lebensmittel
		</button>
	</div>

	{#if tab === 'meals'}
		<section class="panel">
			<header class="panel-head">
				<h2>Deine Mahlzeiten <span class="count">{data.meals.length}</span></h2>
				<a href="/add/meal/new" class="new-btn">
					<Icon name="plus" size={16} stroke={2.4} />
					<span>Neue Mahlzeit</span>
				</a>
			</header>

			{#if data.meals.length === 0}
				<div class="empty-state">
					<span class="empty-icon"><Icon name="utensils" size={26} /></span>
					<p class="empty-title">Noch keine Mahlzeiten</p>
					<p class="empty-text">Stelle eine Mahlzeit aus mehreren Lebensmitteln zusammen.</p>
					<a href="/add/meal/new" class="cta-btn">
						<Icon name="plus" size={16} stroke={2.4} />
						<span>Erste Mahlzeit erstellen</span>
					</a>
				</div>
			{:else}
				{#if data.meals.length > 3}
					<input class="search" type="search" placeholder="Mahlzeit suchen…" bind:value={mealQuery} />
				{/if}
				<ul class="meal-list">
					{#each filteredMeals as meal (meal._id)}
						<li class="meal-row">
							<form method="POST" action="?/logMeal" class="meal-log">
								<input type="hidden" name="mealId" value={meal._id} />
								<input type="hidden" name="mealType" value={selectedType} />
								<button type="submit" class="meal-card" aria-label="{meal.name} hinzufügen">
									<div class="meal-main">
										<span class="meal-name">{meal.name}</span>
										<div class="meal-macros">
											<span class="macro p">P {meal.protein}g</span>
											<span class="macro c">K {meal.carbs}g</span>
											<span class="macro f">F {meal.fat}g</span>
											<span class="meal-items">· {meal.items.length} Zutaten</span>
										</div>
									</div>
									<div class="meal-right">
										<span class="meal-cal">{meal.calories}<small>kcal</small></span>
										<span class="add-pill"><Icon name="plus" size={16} stroke={2.4} /></span>
									</div>
								</button>
							</form>
							<a href="/add/meal/{meal._id}" class="row-edit" aria-label="Bearbeiten"><Icon name="pencil" size={15} /></a>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{:else}
		<section class="panel">
			<header class="panel-head">
				<h2>Lebensmittel suchen</h2>
				<a href="/add/food/new" class="new-btn">
					<Icon name="plus" size={16} stroke={2.4} />
					<span>Neues Lebensmittel</span>
				</a>
			</header>

			<input
				class="search"
				type="search"
				placeholder="In Open Food Facts suchen (z. B. Banane)…"
				bind:value={offQuery}
				oninput={onOff}
			/>

			{#if offSearching}
				<p class="hint">Suche läuft…</p>
			{:else if offError}
				<p class="hint err">{offError}</p>
			{:else if offResults.length}
				<ul class="food-list">
					{#each offResults as r (r.offId ?? r.name)}
						{@render foodAddRow(r, null)}
					{/each}
				</ul>
			{:else if offQuery.trim().length >= 2}
				<p class="hint">Keine Treffer.</p>
			{/if}

			<header class="panel-head sub">
				<h2>Deine Lebensmittel <span class="count">{data.foods.length}</span></h2>
			</header>

			{#if data.foods.length === 0}
				<p class="hint">Noch keine eigenen Lebensmittel. Lege oben eines an.</p>
			{:else}
				{#if data.foods.length > 4}
					<input class="search" type="search" placeholder="Eigene Lebensmittel filtern…" bind:value={foodQuery} />
				{/if}
				<ul class="food-list">
					{#each filteredFoods as f (f._id)}
						{@render foodAddRow(f, `/add/food/${f._id}`)}
					{/each}
				</ul>
			{/if}
		</section>
	{/if}
</div>

<style>
	.add-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
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

	.alert {
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--danger-soft);
		color: #b91c1c;
		padding: 12px 14px;
		border-radius: 13px;
		font-size: 0.86rem;
		font-weight: 600;
		border: 1px solid #fecaca;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 16px;
		box-shadow: var(--shadow-sm);
	}

	.type-card {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.card-label {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text);
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
		border: 1.5px solid transparent;
		border-radius: 14px;
		background: var(--surface-2);
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 650;
		color: var(--text);
		text-align: left;
		font-family: inherit;
		transition: border-color 0.15s, background 0.15s, color 0.15s;
	}

	.type-option.selected {
		border-color: var(--brand);
		background: var(--brand-soft);
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

	.tabs {
		display: flex;
		gap: 4px;
		padding: 5px;
		background: var(--surface-2);
		border-radius: 14px;
	}

	.tab {
		flex: 1;
		padding: 11px;
		border: none;
		border-radius: 10px;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 700;
		font-family: inherit;
		cursor: pointer;
		transition: background 0.18s, color 0.18s;
	}

	.tab.active {
		background: var(--surface);
		color: var(--brand-strong);
		box-shadow: var(--shadow-sm);
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.panel-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
	}

	.panel-head.sub {
		margin-top: 6px;
	}

	.panel-head h2 {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 0.95rem;
		font-weight: 750;
		color: var(--text);
		margin: 0;
	}

	.count {
		font-size: 0.7rem;
		background: var(--brand-soft);
		color: var(--brand-strong);
		padding: 1px 8px;
		border-radius: 999px;
		font-weight: 700;
	}

	.new-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: var(--brand-gradient);
		color: white;
		padding: 10px 14px;
		border-radius: 12px;
		text-decoration: none;
		font-size: 0.82rem;
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
		flex-shrink: 0;
	}

	.search {
		width: 100%;
		padding: 13px 15px;
		border: 1.5px solid transparent;
		border-radius: 13px;
		font-size: 0.95rem;
		font-weight: 500;
		font-family: inherit;
		background: var(--surface-2);
		color: var(--text);
		outline: none;
		-webkit-appearance: none;
		transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
	}

	.search:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.14);
	}

	.hint {
		font-size: 0.85rem;
		color: var(--text-subtle);
		text-align: center;
		padding: 10px 0;
		margin: 0;
	}

	.hint.err {
		color: var(--danger);
	}

	/* Meal list */
	.meal-list,
	.food-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.meal-row,
	.food-row {
		position: relative;
		display: flex;
		align-items: stretch;
		gap: 6px;
	}

	.meal-log {
		flex: 1;
		min-width: 0;
		margin: 0;
	}

	.meal-card {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		font: inherit;
		text-align: left;
		color: var(--text);
		transition: border-color 0.15s, box-shadow 0.15s, transform 0.05s;
	}

	.meal-card:hover {
		border-color: var(--brand);
		box-shadow: 0 8px 20px rgba(22, 163, 74, 0.12);
	}

	.meal-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.meal-name {
		font-size: 0.95rem;
		font-weight: 650;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.meal-macros {
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
		align-items: center;
	}

	.meal-items {
		font-size: 0.72rem;
		color: var(--text-subtle);
		font-weight: 600;
	}

	.macro {
		font-size: 0.66rem;
		font-weight: 650;
		padding: 3px 9px;
		border-radius: 999px;
	}

	.macro.p {
		background: var(--protein-soft);
		color: var(--protein);
	}

	.macro.c {
		background: var(--carbs-soft);
		color: #b45309;
	}

	.macro.f {
		background: var(--fat-soft);
		color: var(--fat);
	}

	.meal-right {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
	}

	.meal-cal {
		font-size: 1rem;
		font-weight: 800;
		color: var(--text);
		display: inline-flex;
		align-items: baseline;
		gap: 3px;
		white-space: nowrap;
	}

	.meal-cal small {
		font-size: 0.65rem;
		color: var(--text-subtle);
		font-weight: 600;
	}

	/* Food add rows */
	.food-add {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		margin: 0;
	}

	.thumb {
		width: 36px;
		height: 36px;
		border-radius: 9px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.food-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.food-name {
		font-size: 0.9rem;
		font-weight: 650;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.food-meta {
		font-size: 0.74rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.food-amount {
		position: relative;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.amount {
		width: 72px;
		padding: 9px 28px 9px 10px;
		border: 1.5px solid var(--border);
		border-radius: 10px;
		font-size: 0.88rem;
		font-weight: 700;
		font-family: inherit;
		background: var(--surface-2);
		color: var(--text);
		outline: none;
		-webkit-appearance: none;
	}

	.amount:focus {
		border-color: var(--brand);
		background: var(--surface);
	}

	.amount-unit {
		position: absolute;
		right: 9px;
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--text-subtle);
		pointer-events: none;
	}

	.add-pill {
		width: 34px;
		height: 34px;
		border-radius: 999px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		border: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.add-pill:hover {
		background: var(--brand);
		color: white;
	}

	.row-edit {
		flex-shrink: 0;
		width: 34px;
		border-radius: 10px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-subtle);
		text-decoration: none;
		background: var(--surface-2);
		transition: background 0.15s, color 0.15s;
	}

	.row-edit:hover {
		background: var(--border);
		color: var(--text);
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 38px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-sm);
	}

	.empty-icon {
		width: 60px;
		height: 60px;
		border-radius: 18px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 14px;
	}

	.empty-title {
		margin: 0 0 4px;
		font-size: 1rem;
		font-weight: 700;
		color: var(--text);
	}

	.empty-text {
		margin: 0 0 16px;
		font-size: 0.88rem;
		color: var(--text-muted);
		max-width: 32ch;
	}

	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: var(--brand-gradient);
		color: white;
		text-decoration: none;
		padding: 12px 20px;
		border-radius: 14px;
		font-weight: 700;
		font-size: 0.9rem;
		box-shadow: 0 6px 16px rgba(22, 163, 74, 0.32);
	}

	@media (min-width: 900px) {
		.page-header h1 {
			font-size: 1.7rem;
		}

		.type-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
