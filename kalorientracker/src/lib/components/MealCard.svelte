<script>
	import Icon from './Icon.svelte';
	import { scaleNutrition } from '$lib/food.js';

	let { meal, deleteAction = '?/delete' } = $props();

	let expanded = $state(false);

	const typeIcons = {
		fruehstueck: 'sunrise',
		mittagessen: 'sun',
		abendessen: 'moon',
		snack: 'cookie'
	};
	const typeLabels = {
		fruehstueck: 'Frühstück',
		mittagessen: 'Mittagessen',
		abendessen: 'Abendessen',
		snack: 'Snack'
	};
	const typeColor = {
		fruehstueck: 'var(--type-breakfast)',
		mittagessen: 'var(--type-lunch)',
		abendessen: 'var(--type-dinner)',
		snack: 'var(--type-snack)'
	};
	const typeSoft = {
		fruehstueck: 'var(--type-breakfast-soft)',
		mittagessen: 'var(--type-lunch-soft)',
		abendessen: 'var(--type-dinner-soft)',
		snack: 'var(--type-snack-soft)'
	};

	const itemCount = $derived(meal.items?.length ?? 0);
	const canExpand = $derived(meal.kind === 'meal' && itemCount > 0);

	const detail = $derived(
		meal.kind === 'food' && meal.amount != null
			? `${meal.amount} ${meal.unit ?? 'g'}`
			: meal.kind === 'meal'
				? `${itemCount} ${itemCount === 1 ? 'Zutat' : 'Zutaten'}`
				: ''
	);
	const subtitle = $derived(
		`${typeLabels[meal.mealType] ?? meal.mealType}${detail ? ` · ${detail}` : ''}`
	);
</script>

<div class="meal-card">
	<div class="meal-head">
		<span
			class="meal-icon"
			style:--c={typeColor[meal.mealType] ?? 'var(--text-subtle)'}
			style:--s={typeSoft[meal.mealType] ?? 'var(--surface-2)'}
		>
			<Icon name={typeIcons[meal.mealType] ?? 'utensils'} size={18} />
		</span>

		<div class="meal-details">
			<h3>{meal.name}</h3>
			<span class="meal-sub">{subtitle}</span>
		</div>

		<div class="macros" aria-label="Makronährstoffe">
			{#if meal.protein}<span class="macro p">P {meal.protein}g</span>{/if}
			{#if meal.carbs}<span class="macro c">K {meal.carbs}g</span>{/if}
			{#if meal.fat}<span class="macro f">F {meal.fat}g</span>{/if}
		</div>

		<span class="calories">{meal.calories}<small>kcal</small></span>

		{#if canExpand}
			<button
				type="button"
				class="expand"
				class:open={expanded}
				onclick={() => (expanded = !expanded)}
				aria-expanded={expanded}
				aria-label={expanded ? 'Zutaten ausblenden' : 'Zutaten anzeigen'}
			>
				<Icon name="chevron-down" size={16} />
			</button>
		{/if}

		<form method="POST" action={deleteAction} class="delete-form">
			<input type="hidden" name="id" value={meal._id} />
			<button type="submit" class="delete-btn" aria-label="Eintrag löschen">
				<Icon name="trash" size={16} />
			</button>
		</form>
	</div>

	{#if canExpand && expanded}
		<ul class="items">
			{#each meal.items as item, i (i)}
				{@const n = scaleNutrition(item, item.amount)}
				<li class="item">
					<span class="item-name">{item.name}</span>
					<span class="item-amount">{item.amount} {item.unit}</span>
					<span class="item-cal">{n.calories} kcal</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.meal-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-3);
		box-shadow: var(--shadow-sm);
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.meal-card:hover {
		border-color: var(--border-strong);
		box-shadow: var(--shadow-md);
	}

	.meal-head {
		display: grid;
		grid-template-columns: auto 1fr auto auto auto;
		grid-template-areas:
			'icon details calories expand delete'
			'icon macros macros macros macros';
		align-items: center;
		gap: var(--space-2) var(--space-3);
		padding: var(--space-4) var(--space-4);
	}

	.meal-icon {
		grid-area: icon;
		width: 38px;
		height: 38px;
		border-radius: var(--radius-sm);
		background: var(--s);
		color: var(--c);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.meal-details {
		grid-area: details;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.meal-details h3 {
		margin: 0;
		font-size: var(--text-body);
		font-weight: var(--weight-semibold);
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		letter-spacing: -0.01em;
	}

	.meal-sub {
		font-size: var(--text-caption);
		color: var(--text-muted);
		font-weight: var(--weight-medium);
	}

	.macros {
		grid-area: macros;
		display: flex;
		gap: var(--space-1);
		flex-wrap: wrap;
	}

	.macro {
		font-size: var(--text-overline);
		font-weight: var(--weight-semibold);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
	}

	.macro.p {
		background: var(--protein-soft);
		color: var(--protein);
	}

	.macro.c {
		background: var(--carbs-soft);
		color: var(--amber-700);
	}

	.macro.f {
		background: var(--fat-soft);
		color: var(--fat);
	}

	.calories {
		grid-area: calories;
		font-size: var(--text-body);
		font-weight: var(--weight-extrabold);
		color: var(--text);
		letter-spacing: -0.02em;
		display: flex;
		align-items: baseline;
		gap: var(--space-1);
		white-space: nowrap;
	}

	.calories small {
		font-size: var(--text-overline);
		color: var(--text-subtle);
		font-weight: var(--weight-semibold);
	}

	.expand {
		grid-area: expand;
		background: var(--surface-2);
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, transform 0.2s ease;
	}

	.expand.open {
		transform: rotate(180deg);
		background: var(--brand-soft);
		color: var(--brand-strong);
	}

	.delete-form {
		grid-area: delete;
		margin: 0;
	}

	.delete-btn {
		background: transparent;
		border: none;
		color: var(--text-subtle);
		cursor: pointer;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: color 0.15s, background 0.15s;
	}

	.delete-btn:hover {
		color: var(--danger);
		background: var(--danger-soft);
	}

	.items {
		list-style: none;
		margin: 0;
		padding: var(--space-1) var(--space-4) var(--space-4) 66px;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-caption);
	}

	.item-name {
		flex: 1;
		min-width: 0;
		color: var(--text);
		font-weight: var(--weight-semibold);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-amount {
		color: var(--text-subtle);
		font-weight: var(--weight-semibold);
		flex-shrink: 0;
	}

	.item-cal {
		color: var(--text-muted);
		font-weight: var(--weight-bold);
		flex-shrink: 0;
		min-width: 56px;
		text-align: right;
	}

	@media (min-width: 900px) {
		.meal-head {
			grid-template-columns: auto 1fr auto auto auto auto;
			grid-template-areas: 'icon details macros calories expand delete';
			padding: var(--space-4) var(--space-4);
			gap: var(--space-4);
		}

		.calories {
			font-size: var(--text-h2);
		}
	}
</style>
