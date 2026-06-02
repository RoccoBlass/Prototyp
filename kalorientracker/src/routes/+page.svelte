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

	// KI-Coach: holt auf Klick ein kurzes Feedback zum heutigen Tag (/api/coach).
	let feedback = $state('');
	let coachLoading = $state(false);
	let coachError = $state('');

	async function askCoach() {
		coachLoading = true;
		coachError = '';
		feedback = '';
		try {
			const res = await fetch('/api/coach', { method: 'POST' });
			const result = await res.json();
			if (!res.ok) throw new Error(result.error || 'Feedback konnte nicht geladen werden.');
			feedback = result.feedback;
		} catch (e) {
			coachError = e.message;
		} finally {
			coachLoading = false;
		}
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
		<CalorieBar current={totalCalories} goal={data.user.calorieGoal} trend={data.trend} today={data.today} />
		<NutrientSummary
			protein={totalProtein}
			carbs={totalCarbs}
			fat={totalFat}
			proteinGoal={data.user.proteinGoal}
			carbsGoal={data.user.carbsGoal}
			fatGoal={data.user.fatGoal}
		/>
	</div>

	<section class="coach">
		<div class="coach-head">
			<span class="coach-icon"><Icon name="sparkles" size={18} /></span>
			<div class="coach-headtext">
				<h2>KI-Coach</h2>
				<p>Kurzes Feedback zu deinem heutigen Tag.</p>
			</div>
		</div>

		{#if feedback}
			<p class="coach-text" role="status">{feedback}</p>
		{:else if coachError}
			<p class="coach-error" role="alert">{coachError}</p>
		{/if}

		<button class="coach-btn" onclick={askCoach} disabled={coachLoading}>
			{#if coachLoading}
				<span class="spinner" aria-hidden="true"></span>
				<span>Analysiere…</span>
			{:else}
				<Icon name="sparkles" size={16} />
				<span>{feedback ? 'Neues Feedback' : 'KI-Feedback holen'}</span>
			{/if}
		</button>

		<p class="coach-disclaimer">KI-Schätzung – keine medizinische Beratung.</p>
	</section>

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
		gap: var(--space-2);
		background: var(--brand-soft);
		color: var(--brand-strong);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-4);
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
		border: 1px solid var(--green-200);
		align-self: flex-start;
	}

	.page-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.page-header h1 {
		font-size: var(--text-display);
		font-weight: var(--weight-extrabold);
		color: var(--text);
		letter-spacing: -0.02em;
		margin: 0 0 var(--space-1);
	}

	.date-heading {
		font-size: var(--text-body-sm);
		color: var(--text-muted);
		font-weight: var(--weight-medium);
		margin: 0;
		text-transform: capitalize;
	}

	.header-cta {
		display: none;
		align-items: center;
		gap: var(--space-2);
		background: var(--brand-gradient);
		color: var(--gray-0);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		box-shadow: 0 6px 16px rgb(var(--green-600-rgb) / 0.32);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.header-cta:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 22px rgb(var(--green-600-rgb) / 0.4);
	}

	.stats-grid {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin-bottom: var(--space-6);
	}

	/* KI-Coach-Karte */
	.coach {
		background: linear-gradient(180deg, var(--brand-soft-2), var(--surface) 70%);
		border: 1px solid var(--green-200);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		box-shadow: var(--shadow-sm);
		margin-bottom: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.coach-head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.coach-icon {
		width: 38px;
		height: 38px;
		border-radius: var(--radius-md);
		background: var(--brand-soft);
		color: var(--brand-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.coach-headtext h2 {
		font-size: var(--text-h2);
		font-weight: var(--weight-extrabold);
		color: var(--text);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.coach-headtext p {
		font-size: var(--text-caption);
		color: var(--text-subtle);
		margin: var(--space-1) 0 0;
	}

	.coach-text {
		font-size: var(--text-body);
		color: var(--text);
		line-height: var(--leading-normal);
		margin: 0;
		white-space: pre-wrap;
	}

	.coach-error {
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
		color: var(--danger);
		margin: 0;
	}

	.coach-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		align-self: flex-start;
		background: var(--brand);
		color: var(--gray-0);
		border: none;
		padding: var(--space-3) var(--space-6);
		border-radius: var(--radius-md);
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		font-family: inherit;
		cursor: pointer;
		transition:
			background 0.15s ease,
			transform 0.12s ease,
			opacity 0.15s ease;
	}

	.coach-btn:hover:not(:disabled) {
		background: var(--brand-strong);
	}

	.coach-btn:active:not(:disabled) {
		transform: translateY(1px);
	}

	.coach-btn:disabled {
		opacity: 0.7;
		cursor: progress;
	}

	.spinner {
		width: 15px;
		height: 15px;
		border: 2px solid rgba(255, 255, 255, 0.45);
		border-top-color: var(--gray-0);
		border-radius: var(--radius-full);
		animation: coach-spin 0.7s linear infinite;
	}

	@keyframes coach-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.coach-disclaimer {
		font-size: var(--text-overline);
		color: var(--text-subtle);
		margin: 0;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.section-title {
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		color: var(--text);
		letter-spacing: -0.01em;
		margin: 0;
	}

	.meal-count {
		font-size: var(--text-overline);
		background: var(--brand-soft);
		color: var(--brand-strong);
		padding: 1px var(--space-2);
		border-radius: var(--radius-full);
		font-weight: var(--weight-bold);
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
		padding: var(--space-12) var(--space-6);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.empty-icon {
		width: 64px;
		height: 64px;
		border-radius: var(--radius-lg);
		background: var(--brand-soft);
		color: var(--brand-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-4);
	}

	.empty-title {
		margin: 0 0 var(--space-1);
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		color: var(--text);
	}

	.empty-text {
		margin: 0 0 var(--space-4);
		font-size: var(--text-body-sm);
		color: var(--text-muted);
	}

	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		background: var(--brand-gradient);
		color: var(--gray-0);
		text-decoration: none;
		padding: var(--space-3) var(--space-6);
		border-radius: var(--radius-md);
		font-weight: var(--weight-bold);
		font-size: var(--text-body);
		box-shadow: 0 6px 16px rgb(var(--green-600-rgb) / 0.32);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.cta-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 22px rgb(var(--green-600-rgb) / 0.4);
	}

	@media (min-width: 900px) {
		.header-cta {
			display: inline-flex;
		}

		.page-header h1 {
			font-size: var(--text-display);
		}

		.date-heading {
			font-size: var(--text-body);
		}

		.stats-grid {
			display: grid;
			grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
			gap: var(--space-4);
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
			column-gap: var(--space-3);
		}

		.meals-list :global(.meal-card) {
			margin-bottom: var(--space-3);
		}
	}
</style>
