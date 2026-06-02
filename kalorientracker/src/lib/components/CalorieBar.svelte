<script>
	let { current = 0, goal = 2000, trend = [], today = '' } = $props();

	const percentage = $derived(Math.min((current / goal) * 100, 100));
	const isOver = $derived(current > goal);
	const remaining = $derived(Math.max(goal - current, 0));

	const radius = 56;
	const circumference = $derived(2 * Math.PI * radius);
	const dashOffset = $derived(circumference - (percentage / 100) * circumference);

	// Mini-Trend der letzten 7 Tage
	const trendMax = $derived(Math.max(goal * 1.1, ...trend.map((d) => d.calories), 1));
	const goalLinePct = $derived(Math.min((goal / trendMax) * 100, 100));
	const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
	function weekday(dateStr) {
		const [y, m, d] = dateStr.split('-').map(Number);
		return WD[new Date(y, m - 1, d).getDay()];
	}
	function barHeight(cal) {
		if (cal <= 0) return 0;
		return Math.max((cal / trendMax) * 100, 5);
	}
</script>

<div class="card" class:over={isOver}>
	<div class="main">
		<div class="ring-wrap">
			<svg viewBox="0 0 140 140" class="ring" aria-hidden="true">
				<defs>
					<linearGradient id="calRing" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="var(--green-400)" />
						<stop offset="100%" stop-color="var(--green-600)" />
					</linearGradient>
					<linearGradient id="calRingOver" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#fb7185" />
						<stop offset="100%" stop-color="#ef4444" />
					</linearGradient>
				</defs>
				<circle cx="70" cy="70" r={radius} class="ring-track" />
				<circle
					cx="70"
					cy="70"
					r={radius}
					class="ring-fill"
					stroke-dasharray={circumference}
					stroke-dashoffset={dashOffset}
				/>
			</svg>
			<div class="ring-center">
				<span class="ring-value">{current}</span>
				<span class="ring-label">kcal gegessen</span>
			</div>
		</div>

		<div class="info">
			<span class="label">Heute</span>
			<span class="headline">
				{#if isOver}
					{current - goal} kcal über dem Ziel
				{:else if current === 0}
					Noch keine Mahlzeiten
				{:else}
					{remaining} kcal verbleibend
				{/if}
			</span>
			<span class="goal">von {goal} kcal Tagesziel</span>

			<div class="track">
				<div class="track-fill" style="width: {percentage}%"></div>
			</div>
		</div>
	</div>

	{#if trend.length}
		<div class="trend">
			<span class="trend-title">Letzte 7 Tage</span>
			<div class="trend-bars">
				<span class="goal-line" style="bottom: {goalLinePct}%"></span>
				{#each trend as day (day.date)}
					<div
						class="bar"
						class:today={day.date === today}
						class:over={day.calories > goal}
						style="height: {barHeight(day.calories)}%"
						title="{weekday(day.date)}: {day.calories} kcal"
					></div>
				{/each}
			</div>
			<div class="trend-days">
				{#each trend as day (day.date)}
					<span class:today={day.date === today}>{weekday(day.date)}</span>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.card {
		background: var(--surface);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		margin-bottom: var(--space-4);
	}

	.main {
		display: flex;
		align-items: center;
		gap: var(--space-6);
	}

	.ring-wrap {
		position: relative;
		width: 132px;
		height: 132px;
		flex-shrink: 0;
	}

	.ring {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.ring-track {
		fill: none;
		stroke: var(--surface-2);
		stroke-width: 13;
	}

	.ring-fill {
		fill: none;
		stroke: url(#calRing);
		stroke-width: 13;
		stroke-linecap: round;
		transition:
			stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1),
			stroke 0.2s;
	}

	.card.over .ring-fill {
		stroke: url(#calRingOver);
	}

	.ring-center {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		padding: 0 var(--space-4);
		text-align: center;
	}

	.ring-value {
		font-size: var(--text-display);
		font-weight: var(--weight-extrabold);
		color: var(--text);
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.ring-label {
		font-size: var(--text-overline);
		color: var(--text-subtle);
		font-weight: var(--weight-bold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.label {
		font-size: var(--text-overline);
		font-weight: var(--weight-bold);
		color: var(--text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.headline {
		font-size: var(--text-h2);
		font-weight: var(--weight-bold);
		color: var(--text);
		letter-spacing: -0.01em;
		line-height: 1.25;
	}

	.card.over .headline {
		color: var(--danger);
	}

	.goal {
		font-size: var(--text-caption);
		color: var(--text-muted);
		margin-bottom: var(--space-3);
	}

	.track {
		height: 6px;
		background: var(--surface-2);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.track-fill {
		height: 100%;
		background: var(--brand-gradient);
		border-radius: var(--radius-full);
		transition:
			width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
			background 0.2s;
	}

	.card.over .track-fill {
		background: var(--danger);
	}

	/* Mini-Trend */
	.trend {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
	}

	.trend-title {
		font-size: var(--text-overline);
		font-weight: var(--weight-bold);
		color: var(--text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.trend-bars {
		position: relative;
		display: flex;
		align-items: flex-end;
		gap: var(--space-2);
		height: 48px;
	}

	.goal-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 0;
		border-top: 1px dashed var(--border-strong);
		pointer-events: none;
	}

	.bar {
		flex: 1;
		min-height: 3px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--text-subtle) 45%, transparent);
		transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.bar.over {
		background: color-mix(in srgb, var(--danger) 60%, transparent);
	}

	.bar.today {
		background: var(--brand-gradient);
	}

	.bar.today.over {
		background: var(--danger);
	}

	.trend-days {
		display: flex;
		gap: var(--space-2);
	}

	.trend-days span {
		flex: 1;
		text-align: center;
		font-size: var(--text-overline);
		font-weight: var(--weight-semibold);
		color: var(--text-subtle);
	}

	.trend-days span.today {
		color: var(--brand-strong);
		font-weight: var(--weight-bold);
	}

	@media (min-width: 900px) {
		.card {
			padding: var(--space-6) var(--space-6);
			margin-bottom: 0;
			height: 100%;
			justify-content: space-between;
		}

		.ring-wrap {
			width: 160px;
			height: 160px;
		}

		.ring-value {
			font-size: var(--text-display-lg);
		}

		.headline {
			font-size: var(--text-h1);
		}

		.goal {
			font-size: var(--text-body-sm);
		}

		.trend-bars {
			height: 56px;
		}
	}
</style>
