<script>
	import MealCard from '$lib/components/MealCard.svelte';

	let { data } = $props();

	const CALORIE_GOAL = 2000;

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

	.days-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.day-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 16px;
		box-shadow: var(--shadow-sm);
	}

	.day-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 12px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}

	.day-meta {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.day-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--text);
		margin: 0;
		text-transform: capitalize;
		letter-spacing: -0.01em;
	}

	.day-date {
		font-size: 0.72rem;
		color: var(--text-subtle);
		font-weight: 500;
	}

	.day-summary {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: flex-end;
	}

	.day-calories {
		font-size: 1.1rem;
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
		display: inline-flex;
		align-items: baseline;
		gap: 3px;
		line-height: 1;
	}

	.day-calories small {
		font-size: 0.7rem;
		color: var(--text-subtle);
		font-weight: 600;
	}

	.day-calories.over {
		color: var(--danger);
	}

	.mini-bar-track {
		width: 80px;
		height: 4px;
		background: var(--surface-2);
		border-radius: 999px;
		overflow: hidden;
	}

	.mini-bar-fill {
		height: 100%;
		background: var(--brand);
		border-radius: 999px;
		transition: width 0.5s ease;
	}

	.mini-bar-fill.over {
		background: var(--danger);
	}

	.no-meals {
		font-size: 0.85rem;
		color: var(--text-subtle);
		text-align: center;
		padding: 14px 0 4px;
		margin: 0;
	}

	.day-meals {
		display: flex;
		flex-direction: column;
		margin-bottom: 4px;
	}

	.day-macros {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		padding-top: 10px;
		border-top: 1px dashed var(--border);
	}

	.macro {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 3px 9px;
		border-radius: 7px;
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

	@media (min-width: 900px) {
		.page-header h1 {
			font-size: 1.7rem;
		}

		.subtitle {
			font-size: 0.95rem;
		}

		.day-card {
			padding: 20px 22px;
		}

		.day-title {
			font-size: 1.1rem;
		}

		.day-calories {
			font-size: 1.3rem;
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
			gap: 14px;
		}
	}
</style>
