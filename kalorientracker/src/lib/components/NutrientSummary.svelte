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
				{#if item.value > item.goal}
					<span class="over-chip">+{item.value - item.goal} g</span>
				{/if}
			</div>
			<div class="track">
				<div
					class="track-fill"
					class:over={item.value > item.goal}
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
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.cell {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.cell:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.badge {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		background: var(--soft);
		color: var(--color);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.label {
		font-size: var(--text-overline);
		font-weight: var(--weight-semibold);
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.value-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-1);
	}

	.value {
		font-size: var(--text-h1);
		font-weight: var(--weight-extrabold);
		color: var(--text);
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.unit {
		font-size: var(--text-caption);
		color: var(--text-subtle);
		font-weight: var(--weight-medium);
	}

	.track {
		height: 6px;
		background: var(--surface-2);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.track-fill {
		height: 100%;
		background: linear-gradient(90deg, color-mix(in srgb, var(--color) 70%, var(--gray-0)), var(--color));
		border-radius: var(--radius-full);
		transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* „über Ziel": schraffierter Überlauf in der Makro-Farbe (volle Breite). */
	.track-fill.over {
		background: repeating-linear-gradient(
			45deg,
			var(--color) 0 5px,
			color-mix(in srgb, var(--color) 45%, var(--surface)) 5px 10px
		);
	}

	.over-chip {
		margin-left: auto;
		align-self: center;
		font-size: var(--text-overline);
		font-weight: var(--weight-bold);
		color: var(--color);
		background: var(--soft);
		padding: 1px var(--space-2);
		border-radius: var(--radius-full);
		white-space: nowrap;
	}

	@media (min-width: 900px) {
		.grid {
			grid-template-columns: 1fr;
			gap: var(--space-3);
			margin-bottom: 0;
			height: 100%;
			align-content: stretch;
		}

		.cell {
			padding: var(--space-4) var(--space-4);
			gap: var(--space-2);
			flex: 1;
		}

		.value {
			font-size: var(--text-h1);
		}

		.label {
			font-size: var(--text-caption);
		}
	}
</style>
