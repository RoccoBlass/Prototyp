<script>
	import MealBuilder from '$lib/components/MealBuilder.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();
</script>

<svelte:head><title>Neue Mahlzeit · Kalorientracker</title></svelte:head>

<div class="sub-page">
	<a href="/add?tab=meals" class="back">
		<Icon name="arrow-left" size={18} />
		<span>Zurück</span>
	</a>
	<h1>Neue Mahlzeit</h1>

	{#if form?.error}
		<div class="alert" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<MealBuilder foods={data.foods} action="?/save" submitLabel="Mahlzeit speichern" />
</div>

<style>
	.sub-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--text-muted);
		text-decoration: none;
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
		align-self: flex-start;
	}

	.back:hover {
		color: var(--text);
	}

	h1 {
		font-size: var(--text-display);
		font-weight: var(--weight-extrabold);
		letter-spacing: -0.02em;
		color: var(--text);
		margin: 0;
	}

	.alert {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-sm);
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
		background: var(--danger-soft);
		color: var(--red-700);
		border: 1px solid var(--red-200);
	}
</style>
