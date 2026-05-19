<script>
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();

	const mealTypes = [
		{ value: 'fruehstueck', label: 'Frühstück', icon: 'sunrise' },
		{ value: 'mittagessen', label: 'Mittagessen', icon: 'sun' },
		{ value: 'abendessen', label: 'Abendessen', icon: 'moon' },
		{ value: 'snack', label: 'Snack', icon: 'cookie' }
	];

	function defaultMealType() {
		const hour = new Date().getHours();
		if (hour < 10) return 'fruehstueck';
		if (hour < 14) return 'mittagessen';
		if (hour < 17) return 'snack';
		return 'abendessen';
	}

	let selectedType = $state(defaultMealType());
	let query = $state('');

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.templates;
		return data.templates.filter((t) => t.name.toLowerCase().includes(q));
	});
</script>

<div class="add-page">
	<div class="page-header">
		<h1>Mahlzeit erfassen</h1>
		<p class="subtitle">Wähle eine Vorlage aus deiner Liste oder lege eine neue an.</p>
	</div>

	{#if form?.error}
		<div class="error-banner" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<section class="card type-card">
		<span class="card-label">Mahlzeitentyp</span>
		<div class="type-grid" role="radiogroup" aria-label="Mahlzeitentyp">
			{#each mealTypes as type (type.value)}
				<button
					type="button"
					class="type-option"
					class:selected={selectedType === type.value}
					onclick={() => (selectedType = type.value)}
					role="radio"
					aria-checked={selectedType === type.value}
				>
					<span class="type-icon"><Icon name={type.icon} size={18} /></span>
					<span class="type-label">{type.label}</span>
				</button>
			{/each}
		</div>
	</section>

	<section class="library">
		<header class="library-header">
			<div>
				<h2>Deine Vorlagen</h2>
				<span class="count">{data.templates.length}</span>
			</div>
			<a href="/add/new?mealType={selectedType}" class="new-btn">
				<Icon name="plus" size={16} stroke={2.4} />
				<span>Neue Vorlage</span>
			</a>
		</header>

		{#if data.templates.length > 0}
			<div class="search">
				<input
					type="search"
					placeholder="Vorlage suchen..."
					bind:value={query}
					autocomplete="off"
				/>
			</div>
		{/if}

		{#if data.templates.length === 0}
			<div class="empty-state">
				<span class="empty-icon"><Icon name="utensils" size={28} /></span>
				<p class="empty-title">Noch keine Vorlagen</p>
				<p class="empty-text">
					Lege deine erste Mahlzeitenvorlage an. Du kannst sie später jederzeit erneut auswählen.
				</p>
				<a href="/add/new?mealType={selectedType}" class="cta-btn">
					<Icon name="plus" size={16} stroke={2.4} />
					<span>Erste Vorlage anlegen</span>
				</a>
			</div>
		{:else if filtered.length === 0}
			<p class="no-match">Keine Vorlage für „{query}" gefunden.</p>
		{:else}
			<ul class="template-list">
				{#each filtered as tpl (tpl._id)}
					<li class="template-row">
						<form method="POST" action="?/log" class="log-form">
							<input type="hidden" name="templateId" value={tpl._id} />
							<input type="hidden" name="mealType" value={selectedType} />
							<button type="submit" class="template-card" aria-label="{tpl.name} hinzufügen">
								<div class="tpl-main">
									<span class="tpl-name">{tpl.name}</span>
									<div class="tpl-macros">
										{#if tpl.protein}<span class="macro p">P {tpl.protein}g</span>{/if}
										{#if tpl.carbs}<span class="macro c">K {tpl.carbs}g</span>{/if}
										{#if tpl.fat}<span class="macro f">F {tpl.fat}g</span>{/if}
									</div>
								</div>
								<div class="tpl-right">
									<span class="tpl-cal">{tpl.calories}<small>kcal</small></span>
									<span class="add-pill"><Icon name="plus" size={16} stroke={2.4} /></span>
								</div>
							</button>
						</form>
						<a
							href="/add/edit/{tpl._id}"
							class="edit-btn"
							aria-label="{tpl.name} bearbeiten"
						>
							<Icon name="pencil" size={16} />
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.add-page {
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

	.error-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--danger-soft);
		color: #b91c1c;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		margin-bottom: 14px;
		font-size: 0.88rem;
		font-weight: 500;
		border: 1px solid #fecaca;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 16px;
		box-shadow: var(--shadow-sm);
	}

	.type-card {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 16px;
	}

	.card-label {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text);
		letter-spacing: -0.01em;
	}

	.type-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	.type-option {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 13px 14px;
		border: 1.5px solid transparent;
		border-radius: 14px;
		background: var(--surface-2);
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 650;
		color: var(--text);
		text-align: left;
		transition:
			border-color 0.15s,
			background 0.15s,
			color 0.15s,
			transform 0.12s;
	}

	.type-option:hover {
		background: var(--border);
	}

	.type-option:active {
		transform: scale(0.97);
	}

	.type-option.selected {
		border-color: var(--brand);
		background: var(--brand-soft);
		color: var(--brand-strong);
	}

	.type-icon {
		color: var(--text-muted);
		display: inline-flex;
		flex-shrink: 0;
	}

	.type-option.selected .type-icon {
		color: var(--brand);
	}

	.library {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.library-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
	}

	.library-header h2 {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 0.95rem;
		font-weight: 750;
		color: var(--text);
		letter-spacing: -0.01em;
		margin: 0;
	}

	.library-header > div {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.count {
		font-size: 0.7rem;
		background: var(--brand-soft);
		color: var(--brand-strong);
		padding: 1px 8px;
		border-radius: 999px;
		font-weight: 700;
	}

	.new-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: var(--brand-gradient);
		color: white;
		padding: 10px 14px;
		border-radius: 12px;
		text-decoration: none;
		font-size: 0.82rem;
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.new-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 18px rgba(22, 163, 74, 0.4);
	}

	.search input {
		width: 100%;
		padding: 14px 16px;
		border: 1.5px solid transparent;
		border-radius: 14px;
		font-size: 0.95rem;
		font-weight: 500;
		font-family: inherit;
		background: var(--surface-2);
		color: var(--text);
		outline: none;
		transition:
			border-color 0.18s,
			background 0.18s,
			box-shadow 0.18s;
		-webkit-appearance: none;
	}

	.search input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.14);
	}

	.no-match {
		text-align: center;
		font-size: 0.88rem;
		color: var(--text-muted);
		padding: 24px 12px;
		margin: 0;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 44px 20px;
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
		max-width: 32ch;
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

	.template-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.template-row {
		position: relative;
	}

	.log-form {
		margin: 0;
	}

	.template-card {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 56px 12px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		font: inherit;
		text-align: left;
		color: var(--text);
		transition:
			border-color 0.15s,
			transform 0.05s,
			box-shadow 0.15s;
	}

	.template-card:hover {
		border-color: var(--brand);
		box-shadow: 0 8px 20px rgba(22, 163, 74, 0.12);
		transform: translateY(-2px);
	}

	.template-card:active {
		transform: scale(0.995);
	}

	.tpl-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.tpl-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text);
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tpl-macros {
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
	}

	.macro {
		font-size: 0.66rem;
		font-weight: 650;
		padding: 3px 9px;
		border-radius: 999px;
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

	.tpl-right {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
	}

	.tpl-cal {
		font-size: 1rem;
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
		display: inline-flex;
		align-items: baseline;
		gap: 3px;
		white-space: nowrap;
	}

	.tpl-cal small {
		font-size: 0.65rem;
		color: var(--text-subtle);
		font-weight: 600;
	}

	.add-pill {
		width: 30px;
		height: 30px;
		border-radius: 999px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.template-card:hover .add-pill {
		background: var(--brand);
		color: white;
	}

	.edit-btn {
		position: absolute;
		top: 50%;
		right: 12px;
		transform: translateY(-50%);
		width: 30px;
		height: 30px;
		border-radius: 8px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-subtle);
		text-decoration: none;
		transition:
			background 0.15s,
			color 0.15s;
		background: transparent;
		z-index: 1;
	}

	.edit-btn:hover {
		background: var(--surface-2);
		color: var(--text);
	}

	@media (min-width: 900px) {
		.page-header h1 {
			font-size: 1.7rem;
		}

		.subtitle {
			font-size: 0.95rem;
		}

		.type-grid {
			grid-template-columns: repeat(4, 1fr);
		}

		.template-card {
			padding: 14px 56px 14px 18px;
		}
	}
</style>
