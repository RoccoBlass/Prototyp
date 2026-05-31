<script>
	import Icon from '$lib/components/Icon.svelte';
	import { SEXES, ACTIVITY_LEVELS, GOALS, LIMITS, calculateTargets } from '$lib/nutrition.js';

	let { form } = $props();

	const prefill = form?.values ?? {};
	const TOTAL = 5;

	let step = $state(form?.error ? TOTAL : 1);

	let sex = $state(prefill.sex || null);
	let age = $state(prefill.age ? String(prefill.age) : '');
	let height = $state(prefill.height ? String(prefill.height) : '');
	let weight = $state(prefill.weight ? String(prefill.weight) : '');
	let activityLevel = $state(prefill.activityLevel || null);
	let goal = $state(prefill.goal || null);

	const ageNum = $derived(Number(age));
	const heightNum = $derived(Number(height));
	const weightNum = $derived(Number(weight));

	const step1Valid = $derived(
		!!sex && Number.isFinite(ageNum) && ageNum >= LIMITS.age.min && ageNum <= LIMITS.age.max
	);
	const step2Valid = $derived(
		Number.isFinite(heightNum) &&
			heightNum >= LIMITS.height.min &&
			heightNum <= LIMITS.height.max &&
			Number.isFinite(weightNum) &&
			weightNum >= LIMITS.weight.min &&
			weightNum <= LIMITS.weight.max
	);
	const step3Valid = $derived(!!activityLevel);
	const step4Valid = $derived(!!goal);
	const allValid = $derived(step1Valid && step2Valid && step3Valid && step4Valid);

	const targets = $derived(
		allValid
			? calculateTargets({
					sex,
					age: ageNum,
					height: heightNum,
					weight: weightNum,
					activityLevel,
					goal
				})
			: null
	);

	const stepValid = $derived(
		step === 1 ? step1Valid : step === 2 ? step2Valid : step === 3 ? step3Valid : step4Valid
	);

	function next() {
		if (step < TOTAL && stepValid) step += 1;
	}
	function back() {
		if (step > 1) step -= 1;
	}

	const goalIcon = { lose: 'trending-down', maintain: 'minus', gain: 'trending-up' };
	const goalLabel = $derived(GOALS.find((g) => g.key === goal)?.label ?? '');
	const activityLabel = $derived(ACTIVITY_LEVELS.find((a) => a.key === activityLevel)?.label ?? '');
</script>

<svelte:head>
	<title>Profil einrichten · Kalorientracker</title>
</svelte:head>

<div class="onboarding">
	<div class="card">
		<header class="head">
			<div class="brand">
				<span class="brand-mark"><Icon name="flame" size={20} /></span>
				<span>Kalorientracker</span>
			</div>
			<span class="step-count">Schritt {step} von {TOTAL}</span>
		</header>

		<div class="progress" aria-hidden="true">
			{#each Array(TOTAL) as _, i (i)}
				<span class="seg" class:done={i < step}></span>
			{/each}
		</div>

		{#if form?.error}
			<div class="alert" role="alert">
				<Icon name="alert" size={18} />
				<span>{form.error}</span>
			</div>
		{/if}

		<div class="body">
			{#if step === 1}
				<div class="intro">
					<h1>Erzähl uns von dir</h1>
					<p>Damit berechnen wir deinen täglichen Kalorienbedarf.</p>
				</div>

				<span class="field-label">Geschlecht</span>
				<div class="choice-row">
					{#each SEXES as s (s.key)}
						<button
							type="button"
							class="choice"
							class:active={sex === s.key}
							onclick={() => (sex = s.key)}
						>
							{s.label}
						</button>
					{/each}
				</div>

				<label class="field">
					<span class="field-label">Alter</span>
					<div class="input-wrap">
						<span class="input-icon"><Icon name="calendar" size={18} /></span>
						<input
							class="input"
							type="number"
							inputmode="numeric"
							min={LIMITS.age.min}
							max={LIMITS.age.max}
							placeholder="z. B. 28"
							bind:value={age}
						/>
						<span class="suffix">Jahre</span>
					</div>
				</label>
			{:else if step === 2}
				<div class="intro">
					<h1>Deine Körpermaße</h1>
					<p>Größe und aktuelles Gewicht.</p>
				</div>

				<label class="field">
					<span class="field-label">Größe</span>
					<div class="input-wrap">
						<span class="input-icon"><Icon name="ruler" size={18} /></span>
						<input
							class="input"
							type="number"
							inputmode="numeric"
							min={LIMITS.height.min}
							max={LIMITS.height.max}
							placeholder="z. B. 175"
							bind:value={height}
						/>
						<span class="suffix">cm</span>
					</div>
				</label>

				<label class="field">
					<span class="field-label">Gewicht</span>
					<div class="input-wrap">
						<span class="input-icon"><Icon name="scale" size={18} /></span>
						<input
							class="input"
							type="number"
							inputmode="decimal"
							step="0.5"
							min={LIMITS.weight.min}
							max={LIMITS.weight.max}
							placeholder="z. B. 72"
							bind:value={weight}
						/>
						<span class="suffix">kg</span>
					</div>
				</label>
			{:else if step === 3}
				<div class="intro">
					<h1>Wie aktiv bist du?</h1>
					<p>Inklusive Sport und Bewegung im Alltag.</p>
				</div>

				<div class="options">
					{#each ACTIVITY_LEVELS as level (level.key)}
						<button
							type="button"
							class="option"
							class:active={activityLevel === level.key}
							onclick={() => (activityLevel = level.key)}
						>
							<span class="option-icon"><Icon name="activity" size={18} /></span>
							<span class="option-text">
								<span class="option-title">{level.label}</span>
								<span class="option-hint">{level.hint}</span>
							</span>
							<span class="radio" class:on={activityLevel === level.key}></span>
						</button>
					{/each}
				</div>
			{:else if step === 4}
				<div class="intro">
					<h1>Was ist dein Ziel?</h1>
					<p>Daraus ergibt sich dein Defizit oder Überschuss.</p>
				</div>

				<div class="options">
					{#each GOALS as g (g.key)}
						<button
							type="button"
							class="option"
							class:active={goal === g.key}
							onclick={() => (goal = g.key)}
						>
							<span class="option-icon"><Icon name={goalIcon[g.key]} size={18} /></span>
							<span class="option-text">
								<span class="option-title">{g.label}</span>
								<span class="option-hint">{g.hint}</span>
							</span>
							<span class="radio" class:on={goal === g.key}></span>
						</button>
					{/each}
				</div>
			{:else}
				<div class="intro">
					<h1>Dein Tagesziel</h1>
					<p>Berechnet aus deinen Angaben – später im Profil anpassbar.</p>
				</div>

				{#if targets}
					<div class="result">
						<div class="kcal">
							<span class="kcal-value">{targets.calorieGoal}</span>
							<span class="kcal-unit">kcal / Tag</span>
						</div>
						<div class="macros">
							<div class="macro" style="--c: var(--protein); --cs: var(--protein-soft);">
								<span class="macro-val">{targets.proteinGoal} g</span>
								<span class="macro-name">Protein</span>
							</div>
							<div class="macro" style="--c: var(--carbs); --cs: var(--carbs-soft);">
								<span class="macro-val">{targets.carbsGoal} g</span>
								<span class="macro-name">Kohlenhydrate</span>
							</div>
							<div class="macro" style="--c: var(--fat); --cs: var(--fat-soft);">
								<span class="macro-val">{targets.fatGoal} g</span>
								<span class="macro-name">Fett</span>
							</div>
						</div>
						<p class="formula">
							Grundumsatz ≈ {targets.bmr} kcal · Gesamtbedarf ≈ {targets.tdee} kcal · Ziel: {goalLabel} ({activityLabel})
						</p>
					</div>
				{/if}
			{/if}
		</div>

		<footer class="nav">
			{#if step > 1}
				<button type="button" class="btn-ghost" onclick={back}>
					<Icon name="arrow-left" size={18} />
					<span>Zurück</span>
				</button>
			{:else}
				<span></span>
			{/if}

			{#if step < TOTAL}
				<button type="button" class="btn-primary" disabled={!stepValid} onclick={next}>
					<span>Weiter</span>
					<Icon name="arrow-right" size={18} />
				</button>
			{:else}
				<form method="POST">
					<input type="hidden" name="sex" value={sex ?? ''} />
					<input type="hidden" name="age" value={age} />
					<input type="hidden" name="height" value={height} />
					<input type="hidden" name="weight" value={weight} />
					<input type="hidden" name="activityLevel" value={activityLevel ?? ''} />
					<input type="hidden" name="goal" value={goal ?? ''} />
					<button type="submit" class="btn-primary" disabled={!allValid}>
						<Icon name="check-circle" size={18} />
						<span>Speichern & loslegen</span>
					</button>
				</form>
			{/if}
		</footer>
	</div>
</div>

<style>
	.onboarding {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px 18px calc(24px + env(safe-area-inset-bottom, 0));
	}

	.card {
		width: 100%;
		max-width: 460px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-6) var(--space-6) var(--space-6);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: var(--weight-extrabold);
		letter-spacing: -0.02em;
		font-size: var(--text-body);
		color: var(--text);
	}

	.brand-mark {
		width: 34px;
		height: 34px;
		border-radius: var(--radius-sm);
		background: var(--brand-gradient);
		color: var(--gray-0);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgb(var(--green-600-rgb) / 0.4);
	}

	.step-count {
		font-size: var(--text-caption);
		font-weight: var(--weight-bold);
		color: var(--text-subtle);
	}

	.progress {
		display: flex;
		gap: var(--space-2);
	}

	.seg {
		flex: 1;
		height: 6px;
		border-radius: var(--radius-full);
		background: var(--surface-2);
		transition: background 0.25s ease;
	}

	.seg.done {
		background: var(--brand);
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

	.body {
		min-height: 268px;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.intro h1 {
		margin: 0 0 var(--space-1);
		font-size: var(--text-h1);
		font-weight: var(--weight-extrabold);
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.intro p {
		margin: 0 0 var(--space-1);
		font-size: var(--text-body-sm);
		color: var(--text-muted);
		line-height: 1.4;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field-label {
		font-size: var(--text-body-sm);
		font-weight: var(--weight-semibold);
		color: var(--text-muted);
	}

	.choice-row {
		display: flex;
		gap: var(--space-3);
	}

	.choice {
		flex: 1;
		padding: var(--space-4);
		border-radius: var(--radius-md);
		border: 1.5px solid var(--border);
		background: var(--surface);
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		color: var(--text-muted);
		cursor: pointer;
		font-family: inherit;
		transition:
			border-color 0.15s,
			background 0.15s,
			color 0.15s,
			transform 0.12s;
	}

	.choice:active {
		transform: scale(0.98);
	}

	.choice.active {
		border-color: var(--brand);
		background: var(--brand-soft);
		color: var(--brand-strong);
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 14px;
		color: var(--text-subtle);
		display: inline-flex;
		pointer-events: none;
	}

	.input {
		width: 100%;
		padding: var(--space-4) 60px var(--space-4) var(--space-12);
		border: 1.5px solid transparent;
		border-radius: var(--radius-sm);
		font-size: var(--text-h2);
		font-weight: var(--weight-semibold);
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

	.input::placeholder {
		color: var(--text-subtle);
		font-weight: var(--weight-medium);
	}

	.input:focus {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: var(--focus-ring);
	}

	.suffix {
		position: absolute;
		right: 16px;
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		color: var(--text-subtle);
		pointer-events: none;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.option {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		border: 1.5px solid var(--border);
		background: var(--surface);
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		transition:
			border-color 0.15s,
			background 0.15s,
			transform 0.12s;
	}

	.option:active {
		transform: scale(0.99);
	}

	.option.active {
		border-color: var(--brand);
		background: var(--brand-soft-2);
	}

	.option-icon {
		width: 38px;
		height: 38px;
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		color: var(--text-muted);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.option.active .option-icon {
		background: var(--brand-soft);
		color: var(--brand-strong);
	}

	.option-text {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
		min-width: 0;
	}

	.option-title {
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		color: var(--text);
	}

	.option-hint {
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	.radio {
		width: 20px;
		height: 20px;
		border-radius: var(--radius-full);
		border: 2px solid var(--border-strong);
		flex-shrink: 0;
		position: relative;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.radio.on {
		border-color: var(--brand);
		background: var(--brand);
		box-shadow: inset 0 0 0 4px var(--surface);
	}

	/* Summary */
	.result {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.kcal {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		background: var(--brand-soft-2);
		border: 1px solid var(--green-200);
	}

	.kcal-value {
		font-size: var(--text-display-lg);
		font-weight: var(--weight-extrabold);
		letter-spacing: -0.03em;
		color: var(--brand-strong);
		line-height: 1;
	}

	.kcal-unit {
		font-size: var(--text-body-sm);
		font-weight: var(--weight-bold);
		color: var(--brand-strong);
	}

	.macros {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-3);
	}

	.macro {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-2);
		border-radius: var(--radius-md);
		background: var(--cs);
	}

	.macro-val {
		font-size: var(--text-h2);
		font-weight: var(--weight-extrabold);
		color: var(--text);
	}

	.macro-name {
		font-size: var(--text-caption);
		font-weight: var(--weight-semibold);
		color: var(--text-muted);
	}

	.formula {
		margin: 0;
		font-size: var(--text-caption);
		line-height: 1.5;
		color: var(--text-subtle);
		text-align: center;
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		background: var(--brand);
		color: var(--gray-0);
		border: none;
		padding: var(--space-3) var(--space-6);
		border-radius: var(--radius-sm);
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 8px 18px rgb(var(--green-600-rgb) / 0.3);
		transition:
			background 0.15s,
			transform 0.12s,
			opacity 0.15s;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--brand-strong);
	}

	.btn-primary:active:not(:disabled) {
		transform: translateY(1px);
	}

	.btn-primary:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		box-shadow: none;
	}

	.btn-ghost {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		background: transparent;
		color: var(--text-muted);
		border: none;
		padding: var(--space-3) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
		cursor: pointer;
		font-family: inherit;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.btn-ghost:hover {
		background: var(--surface-2);
		color: var(--text);
	}
</style>
