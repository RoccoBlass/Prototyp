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
		fruehstueck: '#f59e0b',
		mittagessen: '#f97316',
		abendessen: '#6366f1',
		snack: '#ec4899'
	};
	const typeSoft = {
		fruehstueck: '#fef3c7',
		mittagessen: '#ffedd5',
		abendessen: '#e0e7ff',
		snack: '#fce7f3'
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
			style:--c={typeColor[meal.mealType] ?? '#94a3b8'}
			style:--s={typeSoft[meal.mealType] ?? '#f1f5f9'}
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
				aria-label="Zutaten anzeigen"
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
		margin-bottom: 10px;
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
		gap: 6px 12px;
		padding: 14px 16px;
	}

	.meal-icon {
		grid-area: icon;
		width: 38px;
		height: 38px;
		border-radius: 12px;
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
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		letter-spacing: -0.01em;
	}

	.meal-sub {
		font-size: 0.72rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.macros {
		grid-area: macros;
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
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

	.calories {
		grid-area: calories;
		font-size: 1rem;
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
		display: flex;
		align-items: baseline;
		gap: 3px;
		white-space: nowrap;
	}

	.calories small {
		font-size: 0.65rem;
		color: var(--text-subtle);
		font-weight: 600;
	}

	.expand {
		grid-area: expand;
		background: var(--surface-2);
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		width: 28px;
		height: 28px;
		border-radius: 8px;
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
		padding: 6px;
		border-radius: 8px;
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
		padding: 4px 16px 14px 66px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.8rem;
	}

	.item-name {
		flex: 1;
		min-width: 0;
		color: var(--text);
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-amount {
		color: var(--text-subtle);
		font-weight: 600;
		flex-shrink: 0;
	}

	.item-cal {
		color: var(--text-muted);
		font-weight: 700;
		flex-shrink: 0;
		min-width: 56px;
		text-align: right;
	}

	@media (min-width: 900px) {
		.meal-head {
			grid-template-columns: auto 1fr auto auto auto auto;
			grid-template-areas: 'icon details macros calories expand delete';
			padding: 14px 18px;
			gap: 16px;
		}

		.calories {
			font-size: 1.1rem;
		}
	}
</style>
