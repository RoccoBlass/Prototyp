<script>
	import FoodForm from '$lib/components/FoodForm.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();
</script>

<svelte:head><title>Lebensmittel bearbeiten · Kalorientracker</title></svelte:head>

<div class="sub-page">
	<a href="/add?tab=foods" class="back">
		<Icon name="arrow-left" size={18} />
		<span>Zurück</span>
	</a>
	<h1>Lebensmittel bearbeiten</h1>

	{#if form?.error}
		<div class="alert" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<FoodForm food={form?.values ?? data.food} action="?/save" submitLabel="Änderungen speichern" />

	<form method="POST" action="?/delete">
		<button type="submit" class="delete-btn">
			<Icon name="trash" size={18} />
			<span>Lebensmittel löschen</span>
		</button>
	</form>
</div>

<style>
	.sub-page {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.88rem;
		font-weight: 650;
		align-self: flex-start;
	}

	.back:hover {
		color: var(--text);
	}

	h1 {
		font-size: 1.4rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
		margin: 0;
	}

	.alert {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		border-radius: 13px;
		font-size: 0.86rem;
		font-weight: 600;
		background: var(--danger-soft);
		color: #b91c1c;
		border: 1px solid #fecaca;
	}

	.delete-btn {
		width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: var(--surface-2);
		color: var(--danger);
		border: 1.5px solid var(--border);
		padding: 14px 20px;
		border-radius: 14px;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.15s, border-color 0.15s;
	}

	.delete-btn:hover {
		background: var(--danger-soft);
		border-color: #fecaca;
	}
</style>
