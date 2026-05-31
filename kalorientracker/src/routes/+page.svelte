<script>
	import { page } from '$app/state';
	import CalorieBar from '$lib/components/CalorieBar.svelte';
	import NutrientSummary from '$lib/components/NutrientSummary.svelte';
	import MealCard from '$lib/components/MealCard.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let { data } = $props();

	const totalCalories = $derived(data.meals.reduce((sum, m) => sum + (m.calories || 0), 0));
	const totalProtein = $derived(data.meals.reduce((sum, m) => sum + (m.protein || 0), 0));
	const totalCarbs = $derived(data.meals.reduce((sum, m) => sum + (m.carbs || 0), 0));
	const totalFat = $derived(data.meals.reduce((sum, m) => sum + (m.fat || 0), 0));

	const showSuccess = $derived(page.url.searchParams.get('success') === '1');
	const showWelcome = $derived(page.url.searchParams.get('welcome') === '1');

	function formatDate(dateStr) {
		const [year, month, day] = dateStr.split('-').map(Number);
		return new Date(year, month - 1, day).toLocaleDateString('de-CH', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	}
</script>

<div class="dashboard">
	{#if showWelcome}
		<div class="success-banner" role="status">
			<Icon name="check-circle" size={18} />
			<span>Willkommen! Dein persönliches Tagesziel ist startklar.</span>
		</div>
	{:else if showSuccess}
		<div class="success-banner" role="status">
			<Icon name="check-circle" size={18} />
			<span>Mahlzeit erfolgreich gespeichert</span>
		</div>
	{/if}

	<div class="page-header">
		<div>
			<h1>Dashboard</h1>
			<p class="date-heading">{formatDate(data.today)}</p>
		</div>
		<a href="/add" class="header-cta">
			<Icon name="plus" size={16} stroke={2.4} />
			<span>Neue Mahlzeit</span>
		</a>
	</div>

	<div class="stats-grid">
		<CalorieBar current={totalCalories} goal={data.user.calorieGoal} />
		<NutrientSummary
			protein={totalProtein}
			carbs={totalCarbs}
			fat={totalFat}
			proteinGoal={data.user.proteinGoal}
			carbsGoal={data.user.carbsGoal}
			fatGoal={data.user.fatGoal}
		/>
	</div>

	<div class="section-header">
		<h2 class="section-title">Heutige Mahlzeiten</h2>
		{#if data.meals.length > 0}
			<span class="meal-count">{data.meals.length}</span>
		{/if}
	</div>

	{#if data.meals.length === 0}
		<div class="empty-state">
			<span class="empty-icon"><Icon name="utensils" size={28} /></span>
			<p class="empty-title">Noch keine Mahlzeiten heute</p>
			<p class="empty-text">Starte deinen Tag und erfasse deine erste Mahlzeit.</p>
			<a href="/add" class="cta-btn">
				<Icon name="plus" size={16} stroke={2.4} />
				<span>Erste Mahlzeit hinzufügen</span>
			</a>
		</div>
	{:else}
		<div class="meals-list">
			{#each data.meals as meal (meal._id)}
				<MealCard {meal} deleteAction="?/delete" />
			{/each}
		</div>
	{/if}
</div>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
	}

	.success-banner {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		padding: 12px 16px;
		border-radius: var(--radius-md);
		margin-bottom: 14px;
		font-size: 0.86rem;
		font-weight: 600;
		border: 1px solid #bbf7d0;
		align-self: flex-start;
	}

	.page-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
	}

	.page-header h1 {
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
		margin: 0 0 2px;
	}

	.date-heading {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-weight: 500;
		margin: 0;
		text-transform: capitalize;
	}

	.header-cta {
		display: none;
		align-items: center;
		gap: 7px;
		background: var(--brand-gradient);
		color: white;
		padding: 11px 18px;
		border-radius: 14px;
		text-decoration: none;
		font-size: 0.88rem;
		font-weight: 700;
		box-shadow: 0 6px 16px rgba(22, 163, 74, 0.32);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.header-cta:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 22px rgba(22, 163, 74, 0.4);
	}

	.stats-grid {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin-bottom: 22px;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
	}

	.section-title {
		font-size: 0.95rem;
		font-weight: 750;
		color: var(--text);
		letter-spacing: -0.01em;
		margin: 0;
	}

	.meal-count {
		font-size: 0.7rem;
		background: var(--brand-soft);
		color: var(--brand-strong);
		padding: 1px 8px;
		border-radius: 999px;
		font-weight: 700;
	}

	.meals-list {
		display: flex;
		flex-direction: column;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 48px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-sm);
	}

	.empty-icon {
		width: 64px;
		height: 64px;
		border-radius: 20px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16px;
	}

	.empty-title {
		margin: 0 0 4px;
		font-size: 1rem;
		font-weight: 700;
		color: var(--text);
	}

	.empty-text {
		margin: 0 0 18px;
		font-size: 0.88rem;
		color: var(--text-muted);
	}

	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: var(--brand-gradient);
		color: white;
		text-decoration: none;
		padding: 13px 22px;
		border-radius: 14px;
		font-weight: 700;
		font-size: 0.92rem;
		box-shadow: 0 6px 16px rgba(22, 163, 74, 0.32);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.cta-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 22px rgba(22, 163, 74, 0.4);
	}

	@media (min-width: 900px) {
		.header-cta {
			display: inline-flex;
		}

		.page-header h1 {
			font-size: 1.7rem;
		}

		.date-heading {
			font-size: 0.95rem;
		}

		.stats-grid {
			display: grid;
			grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
			gap: 14px;
			align-items: stretch;
		}

		.meals-list {
			display: grid;
			grid-template-columns: 1fr;
			gap: 0;
		}
	}

	@media (min-width: 1200px) {
		.meals-list {
			grid-template-columns: 1fr 1fr;
			column-gap: 12px;
		}

		.meals-list :global(.meal-card) {
			margin-bottom: 12px;
		}
	}
</style>
