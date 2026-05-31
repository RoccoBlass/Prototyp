<script>
	let { entries = [] } = $props();

	const W = 320;
	const H = 170;
	const PAD = { top: 14, right: 14, bottom: 24, left: 38 };
	const plotW = W - PAD.left - PAD.right;
	const plotH = H - PAD.top - PAD.bottom;

	const chart = $derived.by(() => {
		const pts = entries.filter((e) => Number.isFinite(e.weight));
		if (pts.length === 0) return null;

		const weights = pts.map((p) => p.weight);
		let minW = Math.min(...weights);
		let maxW = Math.max(...weights);
		if (minW === maxW) {
			minW -= 1;
			maxW += 1;
		} else {
			const pad = (maxW - minW) * 0.18;
			minW -= pad;
			maxW += pad;
		}
		const range = maxW - minW;

		const n = pts.length;
		const xAt = (i) => (n === 1 ? PAD.left + plotW / 2 : PAD.left + (plotW * i) / (n - 1));
		const yAt = (w) => PAD.top + plotH * (1 - (w - minW) / range);

		const coords = pts.map((p, i) => ({ x: xAt(i), y: yAt(p.weight), date: p.date, weight: p.weight }));
		const line = coords
			.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
			.join(' ');
		const baseY = (PAD.top + plotH).toFixed(1);
		const area = `${line} L${coords[n - 1].x.toFixed(1)},${baseY} L${coords[0].x.toFixed(1)},${baseY} Z`;

		const ticks = [0, 0.5, 1].map((t) => {
			const value = minW + range * t;
			return { y: yAt(value), label: value.toFixed(1) };
		});

		return { coords, line, area, ticks, first: pts[0], last: pts[n - 1] };
	});

	function fmt(dateStr) {
		const [, m, d] = dateStr.split('-');
		return `${d}.${m}.`;
	}
</script>

{#if chart}
	<svg class="chart" viewBox="0 0 {W} {H}" role="img" aria-label="Gewichtsverlauf">
		<defs>
			<linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--brand)" stop-opacity="0.22" />
				<stop offset="100%" stop-color="var(--brand)" stop-opacity="0" />
			</linearGradient>
		</defs>

		{#each chart.ticks as t (t.label)}
			<line class="grid" x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} />
			<text class="axis-y" x={PAD.left - 7} y={t.y + 3}>{t.label}</text>
		{/each}

		<path class="area" d={chart.area} fill="url(#weight-fill)" />
		<path class="line" d={chart.line} vector-effect="non-scaling-stroke" />

		{#each chart.coords as c (c.date)}
			<circle class="dot" cx={c.x} cy={c.y} r="3" />
		{/each}

		<text class="axis-x start" x={PAD.left} y={H - 7}>{fmt(chart.first.date)}</text>
		{#if chart.last.date !== chart.first.date}
			<text class="axis-x end" x={W - PAD.right} y={H - 7}>{fmt(chart.last.date)}</text>
		{/if}
	</svg>
{/if}

<style>
	.chart {
		width: 100%;
		height: auto;
		display: block;
	}

	.grid {
		stroke: var(--border);
		stroke-width: 1;
	}

	.axis-y,
	.axis-x {
		fill: var(--text-subtle);
		font-size: 9px;
		font-weight: 600;
	}

	.axis-y {
		text-anchor: end;
	}

	.axis-x.start {
		text-anchor: start;
	}

	.axis-x.end {
		text-anchor: end;
	}

	.line {
		fill: none;
		stroke: var(--brand);
		stroke-width: 2.5;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.dot {
		fill: var(--surface);
		stroke: var(--brand);
		stroke-width: 2;
	}
</style>
