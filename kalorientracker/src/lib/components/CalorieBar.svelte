<script>
	let { current = 0, goal = 2000 } = $props();

	const percentage = $derived(Math.min((current / goal) * 100, 100));
	const isOver = $derived(current > goal);
	const remaining = $derived(Math.max(goal - current, 0));

	const radius = 56;
	const circumference = $derived(2 * Math.PI * radius);
	const dashOffset = $derived(circumference - (percentage / 100) * circumference);
</script>

<div class="card" class:over={isOver}>
	<div class="ring-wrap">
		<svg viewBox="0 0 140 140" class="ring" aria-hidden="true">
			<defs>
				<linearGradient id="calRing" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="#34d399" />
					<stop offset="100%" stop-color="#16a34a" />
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
			<span class="ring-unit">kcal</span>
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

<style>
	.card {
		background: var(--surface);
		border-radius: var(--radius-xl);
		padding: 22px;
		border: 1px solid var(--border);
		box-shadow: var(--shadow-md);
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 14px;
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
		gap: 1px;
	}

	.ring-value {
		font-size: 1.6rem;
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.ring-unit {
		font-size: 0.72rem;
		color: var(--text-subtle);
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.label {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-subtle);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.headline {
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--text);
		letter-spacing: -0.01em;
		line-height: 1.25;
	}

	.card.over .headline {
		color: var(--danger);
	}

	.goal {
		font-size: 0.78rem;
		color: var(--text-muted);
		margin-bottom: 10px;
	}

	.track {
		height: 6px;
		background: var(--surface-2);
		border-radius: 999px;
		overflow: hidden;
	}

	.track-fill {
		height: 100%;
		background: var(--brand-gradient);
		border-radius: 999px;
		transition:
			width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
			background 0.2s;
	}

	.card.over .track-fill {
		background: var(--danger);
	}

	@media (min-width: 900px) {
		.card {
			padding: 24px 28px;
			gap: 28px;
			margin-bottom: 0;
			height: 100%;
		}

		.ring-wrap {
			width: 160px;
			height: 160px;
		}

		.ring-value {
			font-size: 2rem;
		}

		.headline {
			font-size: 1.25rem;
		}

		.goal {
			font-size: 0.85rem;
		}
	}
</style>
