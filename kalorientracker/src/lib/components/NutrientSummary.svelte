<script>
	import Icon from './Icon.svelte';

	let {
		protein = 0,
		carbs = 0,
		fat = 0,
		proteinGoal = 150,
		carbsGoal = 250,
		fatGoal = 70
	} = $props();

	const items = $derived([
		{
			key: 'protein',
			value: protein,
			label: 'Protein',
			goal: proteinGoal,
			icon: 'beef',
			color: 'var(--protein)',
			soft: 'var(--protein-soft)'
		},
		{
			key: 'carbs',
			value: carbs,
			label: 'Kohlenhydrate',
			goal: carbsGoal,
			icon: 'wheat',
			color: 'var(--carbs)',
			soft: 'var(--carbs-soft)'
		},
		{
			key: 'fat',
			value: fat,
			label: 'Fett',
			goal: fatGoal,
			icon: 'droplet',
			color: 'var(--fat)',
			soft: 'var(--fat-soft)'
		}
	]);
</script>

<div class="grid">
	{#each items as item (item.key)}
		<div class="cell" style:--color={item.color} style:--soft={item.soft}>
			<div class="row">
				<span class="badge"><Icon name={item.icon} size={16} /></span>
				<span class="label">{item.label}</span>
			</div>
			<div class="value-row">
				<span class="value">{item.value}</span>
				<span class="unit">/ {item.goal}g</span>
			</div>
			<div class="track">
				<div
					class="track-fill"
					style="width: {Math.min((item.value / item.goal) * 100, 100)}%"
				></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-bottom: 18px;
	}

	.cell {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		box-shadow: var(--shadow-sm);
	}

	.row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.badge {
		width: 24px;
		height: 24px;
		border-radius: 7px;
		background: var(--soft);
		color: var(--color);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.label {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.value-row {
		display: flex;
		align-items: baseline;
		gap: 4px;
	}

	.value {
		font-size: 1.3rem;
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.unit {
		font-size: 0.72rem;
		color: var(--text-subtle);
		font-weight: 500;
	}

	.track {
		height: 4px;
		background: var(--surface-2);
		border-radius: 999px;
		overflow: hidden;
	}

	.track-fill {
		height: 100%;
		background: var(--color);
		border-radius: 999px;
		transition: width 0.5s ease;
	}

	@media (min-width: 900px) {
		.grid {
			grid-template-columns: 1fr;
			gap: 10px;
			margin-bottom: 0;
			height: 100%;
			align-content: stretch;
		}

		.cell {
			padding: 14px 16px;
			gap: 8px;
			flex: 1;
		}

		.value {
			font-size: 1.5rem;
		}

		.label {
			font-size: 0.78rem;
		}
	}
</style>
