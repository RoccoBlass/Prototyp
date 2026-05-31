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
</style>
