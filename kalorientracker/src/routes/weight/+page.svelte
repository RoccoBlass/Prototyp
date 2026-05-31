<script>
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import WeightChart from '$lib/components/WeightChart.svelte';

	let { data, form } = $props();

	const todayWeight = data.entries.find((e) => e.date === data.today)?.weight;

	let weight = $state(todayWeight != null ? String(todayWeight) : '');
	let date = $state(data.today);

	const latest = $derived(data.entries.length ? data.entries[data.entries.length - 1] : null);
	const first = $derived(data.entries.length ? data.entries[0] : null);
	const change = $derived(
		latest && first && data.entries.length > 1 ? Math.round((latest.weight - first.weight) * 10) / 10 : null
	);
	const recent = $derived([...data.entries].reverse().slice(0, 12));
	const hasToday = $derived(data.entries.some((e) => e.date === data.today));

	const showLogged = $derived(page.url.searchParams.get('logged') === '1');
	const showRecalc = $derived(page.url.searchParams.get('recalculated') === '1');

	function fmtDate(dateStr) {
		const [y, m, d] = dateStr.split('-').map(Number);
		return new Date(y, m - 1, d).toLocaleDateString('de-CH', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<div class="weight-page">
	<div class="page-header">
		<div>
			<h1>Gewicht</h1>
			<p class="subtitle">Verfolge deinen Verlauf Tag für Tag.</p>
		</div>
		{#if latest}
			<div class="current">
				<span class="current-val">{latest.weight}<span class="unit">kg</span></span>
				{#if change !== null}
					<span class="delta" class:down={change < 0} class:up={change > 0}>
						<Icon name={change < 0 ? 'trending-down' : change > 0 ? 'trending-up' : 'minus'} size={14} />
						{change > 0 ? '+' : ''}{change} kg
					</span>
				{/if}
			</div>
		{/if}
	</div>

	{#if showLogged}
		<div class="toast toast-ok" role="status">
			<Icon name="check-circle" size={18} />
			<span>Gewicht gespeichert</span>
		</div>
	{:else if showRecalc}
		<div class="toast toast-ok" role="status">
			<Icon name="check-circle" size={18} />
			<span>Kalorienziel mit aktuellem Gewicht neu berechnet</span>
		</div>
	{/if}

	{#if form?.error}
		<div class="toast toast-err" role="alert">
			<Icon name="alert" size={18} />
			<span>{form.error}</span>
		</div>
	{/if}

	<section class="card">
		<header class="card-head">
			<span class="card-icon"><Icon name="activity" size={18} /></span>
			<div>
				<h2>Verlauf</h2>
				<p>{data.entries.length} {data.entries.length === 1 ? 'Eintrag' : 'Einträge'}</p>
			</div>
		</header>
		{#if data.entries.length}
			<WeightChart entries={data.entries} />
		{:else}
			<div class="empty">
				<Icon name="scale" size={26} />
				<p>Noch keine Daten. Trag unten dein erstes Gewicht ein.</p>
			</div>
		{/if}
	</section>

	<section class="card">
		<header class="card-head">
			<span class="card-icon"><Icon name="scale" size={18} /></span>
			<div>
				<h2>Gewicht eintragen</h2>
				<p>Ein Eintrag pro Tag – erneutes Speichern überschreibt ihn.</p>
			</div>
		</header>
		<form method="POST" action="?/log" class="log-form">
			<label class="field">
				<span class="field-label">Datum</span>
				<input class="input" type="date" name="date" max={data.today} bind:value={date} required />
			</label>
			<label class="field">
				<span class="field-label">Gewicht</span>
				<div class="input-wrap">
					<input
						class="input"
						type="number"
						name="weight"
						inputmode="decimal"
						step="0.1"
						min="30"
						max="300"
						placeholder="z. B. 72.5"
						bind:value={weight}
						required
					/>
					<span class="suffix">kg</span>
				</div>
			</label>
			<button type="submit" class="btn-primary">
				<Icon name="check-circle" size={18} />
				<span>{hasToday && date === data.today ? 'Aktualisieren' : 'Speichern'}</span>
			</button>
		</form>
	</section>

	<section class="card recalc-card">
		<header class="card-head">
			<span class="card-icon"><Icon name="target" size={18} /></span>
			<div>
				<h2>Kalorienziel</h2>
				<p>Aktuell {data.user.calorieGoal} kcal/Tag. Tracken ändert das nicht.</p>
			</div>
		</header>
		<form method="POST" action="?/recalculate">
			<input type="hidden" name="intent" value="recalculate" />
			<button type="submit" class="btn-soft" disabled={!latest}>
				<Icon name="target" size={18} />
				<span>Mit aktuellem Gewicht neu berechnen</span>
			</button>
		</form>
		{#if latest}
			<p class="hint">Verwendet dein zuletzt erfasstes Gewicht ({latest.weight} kg).</p>
		{:else}
			<p class="hint">Erfasse zuerst ein Gewicht.</p>
		{/if}
	</section>

	{#if recent.length}
		<section class="card">
			<header class="card-head">
				<span class="card-icon"><Icon name="history" size={18} /></span>
				<div>
					<h2>Letzte Einträge</h2>
					<p>Zum Entfernen auf das Papierkorb-Symbol tippen.</p>
				</div>
			</header>
			<ul class="entries">
				{#each recent as e (e.date)}
					<li class="entry">
						<span class="entry-date">{fmtDate(e.date)}</span>
						<span class="entry-weight">{e.weight} kg</span>
						<form method="POST" action="?/delete">
							<input type="hidden" name="date" value={e.date} />
							<button type="submit" class="del" aria-label="Eintrag löschen">
								<Icon name="trash" size={16} />
							</button>
						</form>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.weight-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.page-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 14px;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.subtitle {
		margin: 4px 0 0;
		font-size: 0.88rem;
		color: var(--text-muted);
	}

	.current {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		flex-shrink: 0;
	}

	.current-val {
		font-size: 1.7rem;
		font-weight: 850;
		letter-spacing: -0.02em;
		color: var(--text);
		line-height: 1;
	}

	.current-val .unit {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text-subtle);
		margin-left: 3px;
	}

	.delta {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--text-muted);
		background: var(--surface-2);
		padding: 3px 9px;
		border-radius: 999px;
	}

	.delta.down {
		color: var(--brand-strong);
		background: var(--brand-soft);
	}

	.delta.up {
		color: var(--fat);
		background: var(--fat-soft);
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 14px;
		font-size: 0.88rem;
		font-weight: 600;
	}

	.toast-ok {
		background: var(--brand-soft);
		color: var(--brand-strong);
		border: 1px solid #bbf7d0;
	}

	.toast-err {
		background: var(--danger-soft);
		color: #b91c1c;
		border: 1px solid #fecaca;
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 22px;
		padding: 22px;
		box-shadow: 0 6px 24px rgba(15, 23, 42, 0.05);
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.card-icon {
		width: 42px;
		height: 42px;
		border-radius: 14px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-head h2 {
		font-size: 1.05rem;
		font-weight: 750;
		color: var(--text);
		margin: 0 0 3px;
		letter-spacing: -0.01em;
	}

	.card-head p {
		font-size: 0.83rem;
		color: var(--text-muted);
		margin: 0;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 22px 0;
		color: var(--text-subtle);
		text-align: center;
	}

	.empty p {
		margin: 0;
		font-size: 0.88rem;
	}

	.log-form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		align-items: end;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 9px;
	}

	.field-label {
		font-size: 0.85rem;
		font-weight: 650;
		color: var(--text-muted);
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input {
		width: 100%;
		padding: 15px 16px;
		border: 1.5px solid transparent;
		border-radius: 14px;
		font-size: 1.05rem;
		font-weight: 650;
		font-family: inherit;
		background: var(--surface-2);
		color: var(--text);
		outline: none;
		transition:
			border-color 0.18s ease,
			background 0.18s ease,
			box-shadow 0.18s ease;
		-webkit-appearance: none;
	}

	.input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.14);
	}

	.input-wrap .input {
		padding-right: 48px;
	}

	.suffix {
		position: absolute;
		right: 16px;
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text-subtle);
		pointer-events: none;
	}

	.btn-primary {
		grid-column: 1 / -1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: var(--brand);
		color: #fff;
		border: none;
		padding: 15px 20px;
		border-radius: 14px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
		transition:
			transform 0.12s ease,
			background 0.15s;
	}

	.btn-primary:hover {
		background: var(--brand-strong);
	}

	.btn-primary:active {
		transform: translateY(1px);
	}

	.recalc-card .btn-soft {
		width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: var(--brand-soft);
		color: var(--brand-strong);
		border: 1.5px solid #bbf7d0;
		padding: 14px 18px;
		border-radius: 14px;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		transition:
			background 0.15s,
			transform 0.12s,
			opacity 0.15s;
	}

	.btn-soft:hover:not(:disabled) {
		background: #d6f5e1;
	}

	.btn-soft:active:not(:disabled) {
		transform: translateY(1px);
	}

	.btn-soft:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.hint {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-subtle);
	}

	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.entry {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		border-radius: 13px;
		background: var(--surface-2);
	}

	.entry-date {
		flex: 1;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: capitalize;
	}

	.entry-weight {
		font-size: 0.98rem;
		font-weight: 800;
		color: var(--text);
	}

	.del {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: 10px;
		border: none;
		background: transparent;
		color: var(--text-subtle);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.del:hover {
		background: var(--danger-soft);
		color: var(--danger);
	}

	@media (min-width: 900px) {
		.card {
			padding: 26px 28px;
		}
	}
</style>
