<script>
	import MealBuilder from '$lib/components/MealBuilder.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();
</script>

<svelte:head><title>Mahlzeit bearbeiten · Kalorientracker</title></svelte:head>

<div class="sub-page">
	<a href="/add?tab=meals" class="back">
		<Icon name="arrow-left" size={18} />
		<span>Zurück</span>
	</a>
	<h1>Mahlzeit bearbeiten</h1>

	{#if form?.error}
		<div class="alert" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<MealBuilder meal={data.meal} foods={data.foods} action="?/save" submitLabel="Änderungen speichern" />

	<form method="POST" action="?/delete">
		<button type="submit" class="delete-btn">
			<Icon name="trash" size={18} />
			<span>Mahlzeit löschen</span>
		</button>
	</form>
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

	.delete-btn {
		width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		background: var(--surface-2);
		color: var(--danger);
		border: 1.5px solid var(--border);
		padding: var(--space-4) var(--space-6);
		border-radius: var(--radius-md);
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
		transition: background 0.15s, border-color 0.15s;
	}

	.delete-btn:hover {
		background: var(--danger-soft);
		border-color: var(--red-200);
	}
</style>
