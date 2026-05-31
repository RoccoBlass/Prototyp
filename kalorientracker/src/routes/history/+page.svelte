<script>
	import MealCard from '$lib/components/MealCard.svelte';

	let { data } = $props();

	const CALORIE_GOAL = $derived(data.user.calorieGoal);

	function formatDate(dateStr) {
		const [year, month, day] = dateStr.split('-').map(Number);
		const d = new Date(year, month - 1, day);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		if (d.toDateString() === today.toDateString()) return 'Heute';
		if (d.toDateString() === yesterday.toDateString()) return 'Gestern';
		return d.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' });
	}
</script>

<div class="history-page">
	<div class="page-header">
		<h1>Verlauf</h1>
		<p class="subtitle">Letzte 7 Tage im Überblick</p>
	</div>

	<div class="days-list">
		{#each data.days as day (day.date)}
			<section class="day-card">
				<header class="day-header">
					<div class="day-meta">
						<h2 class="day-title">{formatDate(day.date)}</h2>
						<span class="day-date">{day.date}</span>
					</div>
					<div class="day-summary">
						<span class="day-calories" class:over={day.totalCalories > CALORIE_GOAL}>
							{day.totalCalories}<small>kcal</small>
						</span>
						<div class="mini-bar-track">
							<div
								class="mini-bar-fill"
								class:over={day.totalCalories > CALORIE_GOAL}
								style="width: {Math.min((day.totalCalories / CALORIE_GOAL) * 100, 100)}%"
							></div>
						</div>
					</div>
				</header>

				{#if day.meals.length === 0}
					<p class="no-meals">Keine Mahlzeiten erfasst</p>
				{:else}
					<div class="day-meals">
						{#each day.meals as meal (meal._id)}
							<MealCard {meal} deleteAction="?/delete" />
						{/each}
					</div>
					<div class="day-macros">
						<span class="macro p">Protein {day.totalProtein}g</span>
						<span class="macro c">Kohlenhydrate {day.totalCarbs}g</span>
						<span class="macro f">Fett {day.totalFat}g</span>
					</div>
				{/if}
			</section>
		{/each}
	</div>
</div>

<style>
	.history-page {
		display: flex;
		flex-direction: column;
	}

	.page-header {
		margin-bottom: var(--space-4);
	}

	.page-header h1 {
		font-size: var(--text-display);
		font-weight: var(--weight-extrabold);
		color: var(--text);
		letter-spacing: -0.02em;
		margin: 0 0 var(--space-1);
	}

	.subtitle {
		font-size: var(--text-body-sm);
		color: var(--text-muted);
		margin: 0;
	}

	.days-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.day-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.day-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.day-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--border);
	}

	.day-meta {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.day-title {
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		color: var(--text);
		margin: 0;
		text-transform: capitalize;
		letter-spacing: -0.01em;
	}

	.day-date {
		font-size: var(--text-caption);
		color: var(--text-subtle);
		font-weight: var(--weight-medium);
	}

	.day-summary {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		align-items: flex-end;
	}

	.day-calories {
		font-size: var(--text-h2);
		font-weight: var(--weight-extrabold);
		color: var(--text);
		letter-spacing: -0.02em;
		display: inline-flex;
		align-items: baseline;
		gap: var(--space-1);
		line-height: 1;
	}

	.day-calories small {
		font-size: var(--text-overline);
		color: var(--text-subtle);
		font-weight: var(--weight-semibold);
	}

	.day-calories.over {
		color: var(--danger);
	}

	.mini-bar-track {
		width: 80px;
		height: 4px;
		background: var(--surface-2);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.mini-bar-fill {
		height: 100%;
		background: var(--brand-gradient);
		border-radius: var(--radius-full);
		transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.mini-bar-fill.over {
		background: var(--danger);
	}

	.no-meals {
		font-size: var(--text-body-sm);
		color: var(--text-subtle);
		text-align: center;
		padding: var(--space-4) 0 var(--space-1);
		margin: 0;
	}

	.day-meals {
		display: flex;
		flex-direction: column;
		margin-bottom: var(--space-1);
	}

	.day-macros {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		padding-top: var(--space-3);
		border-top: 1px dashed var(--border);
	}

	.macro {
		font-size: var(--text-caption);
		font-weight: var(--weight-semibold);
		padding: var(--space-1) var(--space-3);
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

	@media (min-width: 900px) {
		.page-header h1 {
			font-size: var(--text-display);
		}

		.subtitle {
			font-size: var(--text-body);
		}

		.day-card {
			padding: var(--space-6) var(--space-6);
		}

		.day-title {
			font-size: var(--text-h2);
		}

		.day-calories {
			font-size: var(--text-h1);
		}

		.mini-bar-track {
			width: 120px;
			height: 5px;
		}
	}

	@media (min-width: 1200px) {
		.days-list {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-4);
		}
	}
</style>
