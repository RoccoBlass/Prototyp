<script>
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import Icon from '$lib/components/Icon.svelte';

	let { data, children } = $props();

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: 'home' },
		{ href: '/add', label: 'Hinzufügen', icon: 'plus' },
		{ href: '/history', label: 'Verlauf', icon: 'history' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Kalorientracker</title>
</svelte:head>

{#if data.user}
<div class="app">
	<aside class="sidebar">
		<a href="/" class="brand">
			<span class="brand-mark"><Icon name="flame" size={20} /></span>
			<span class="brand-text">Kalorientracker</span>
		</a>
		<nav class="side-nav">
			{#each navItems as item (item.href)}
				<a
					href={item.href}
					class="side-nav-link"
					class:active={page.url.pathname === item.href}
				>
					<Icon name={item.icon} size={20} />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
		<a
			href="/profile"
			class="sidebar-footer profile-link"
			class:active={page.url.pathname === '/profile'}
		>
			<span class="profile-avatar"><Icon name="user" size={18} /></span>
			<span class="profile-info">
				<span class="footer-label">{data.user.name || 'Mein Profil'}</span>
				<span class="footer-value">{data.user.calorieGoal} kcal Ziel</span>
			</span>
		</a>
	</aside>

	<header class="topbar">
		<a href="/" class="brand brand-mobile">
			<span class="brand-mark"><Icon name="flame" size={18} /></span>
			<span class="brand-text">Kalorientracker</span>
		</a>
		<a
			href="/profile"
			class="topbar-profile"
			class:active={page.url.pathname === '/profile'}
			aria-label="Profil"
		>
			<Icon name="user" size={18} />
		</a>
	</header>

	<main>
		<div class="container">
			{@render children()}
		</div>
	</main>

	<nav class="bottom-nav">
		<a href="/" class:active={page.url.pathname === '/'}>
			<Icon name="home" size={22} />
			<span class="nav-label">Dashboard</span>
		</a>
		<a href="/add" class:active={page.url.pathname === '/add'} class="add-link">
			<span class="add-circle"><Icon name="plus" size={22} stroke={2.4} /></span>
			<span class="nav-label">Hinzufügen</span>
		</a>
		<a href="/history" class:active={page.url.pathname === '/history'}>
			<Icon name="history" size={22} />
			<span class="nav-label">Verlauf</span>
		</a>
	</nav>
</div>
{:else}
	{@render children()}
{/if}

<style>
	:global(:root) {
		--bg: #f4f6f8;
		--surface: #ffffff;
		--surface-2: #f1f3f6;
		--border: #ebedf1;
		--border-strong: #d9dde3;
		--text: #0b1220;
		--text-muted: #5b6573;
		--text-subtle: #9aa3b2;
		--brand: #16a34a;
		--brand-strong: #15803d;
		--brand-soft: #dcfce7;
		--brand-soft-2: #f0fdf4;
		--brand-gradient: linear-gradient(135deg, #22c55e, #16a34a);
		--danger: #ef4444;
		--danger-soft: #fee2e2;
		--protein: #3b82f6;
		--protein-soft: #dbeafe;
		--carbs: #f59e0b;
		--carbs-soft: #fef3c7;
		--fat: #f97316;
		--fat-soft: #ffedd5;
		--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 6px rgba(15, 23, 42, 0.04);
		--shadow-md: 0 6px 18px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(15, 23, 42, 0.05);
		--shadow-lg: 0 18px 50px rgba(15, 23, 42, 0.14);
		--radius-sm: 12px;
		--radius-md: 16px;
		--radius-lg: 22px;
		--radius-xl: 28px;
	}

	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Inter',
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			sans-serif;
		background: var(--bg);
		color: var(--text);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(button) {
		font-family: inherit;
	}

	.app {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	/* Sidebar (desktop only) */
	.sidebar {
		display: none;
	}

	/* Top bar (mobile only) */
	.topbar {
		background: rgba(255, 255, 255, 0.78);
		backdrop-filter: saturate(180%) blur(14px);
		-webkit-backdrop-filter: saturate(180%) blur(14px);
		border-bottom: 1px solid var(--border);
		padding: 12px 18px;
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.topbar-profile {
		width: 38px;
		height: 38px;
		border-radius: 999px;
		background: var(--surface-2);
		color: var(--text-muted);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		flex-shrink: 0;
		transition:
			background 0.15s,
			color 0.15s,
			transform 0.15s;
	}

	.topbar-profile:hover,
	.topbar-profile.active {
		background: var(--brand-soft);
		color: var(--brand-strong);
		transform: scale(1.05);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--text);
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.brand-mark {
		width: 34px;
		height: 34px;
		border-radius: 11px;
		background: var(--brand-gradient);
		color: white;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
	}

	.brand-mobile .brand-mark {
		width: 30px;
		height: 30px;
		border-radius: 9px;
	}

	.brand-text {
		font-size: 0.98rem;
	}

	main {
		flex: 1;
		padding: 18px 16px 108px;
	}

	.container {
		max-width: 480px;
		margin: 0 auto;
		width: 100%;
	}

	/* Bottom nav (mobile) — floating pill */
	.bottom-nav {
		position: fixed;
		bottom: calc(14px + env(safe-area-inset-bottom, 0));
		left: 16px;
		right: 16px;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: saturate(180%) blur(16px);
		-webkit-backdrop-filter: saturate(180%) blur(16px);
		border: 1px solid var(--border);
		border-radius: 22px;
		display: flex;
		z-index: 20;
		box-shadow: var(--shadow-lg);
		max-width: 460px;
		margin: 0 auto;
	}

	.bottom-nav a {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px 0 13px;
		text-decoration: none;
		color: var(--text-subtle);
		gap: 4px;
		transition: color 0.15s;
	}

	.bottom-nav a.active {
		color: var(--brand);
	}

	.nav-label {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.01em;
	}

	.add-link {
		position: relative;
	}

	.add-circle {
		width: 46px;
		height: 46px;
		background: var(--brand-gradient);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6px 16px rgba(22, 163, 74, 0.45);
		transition: transform 0.18s ease;
		margin-top: -16px;
	}

	.add-link:hover .add-circle,
	.add-link.active .add-circle {
		transform: scale(1.08) translateY(-1px);
	}

	.add-link.active .nav-label {
		color: var(--brand);
	}

	/* Desktop layout */
	@media (min-width: 900px) {
		.app {
			display: grid;
			grid-template-columns: 264px 1fr;
			grid-template-rows: 1fr;
			min-height: 100dvh;
		}

		.topbar {
			display: none;
		}

		.bottom-nav {
			display: none;
		}

		.sidebar {
			display: flex;
			flex-direction: column;
			gap: 26px;
			padding: 26px 18px;
			background: var(--surface);
			border-right: 1px solid var(--border);
			position: sticky;
			top: 0;
			height: 100dvh;
		}

		.sidebar .brand {
			padding: 4px 8px;
			font-size: 1.05rem;
		}

		.side-nav {
			display: flex;
			flex-direction: column;
			gap: 6px;
		}

		.side-nav-link {
			display: flex;
			align-items: center;
			gap: 13px;
			padding: 12px 14px;
			border-radius: 14px;
			text-decoration: none;
			color: var(--text-muted);
			font-size: 0.92rem;
			font-weight: 600;
			transition:
				background 0.15s,
				color 0.15s,
				transform 0.12s;
		}

		.side-nav-link:hover {
			background: var(--surface-2);
			color: var(--text);
		}

		.side-nav-link.active {
			background: var(--brand-soft);
			color: var(--brand-strong);
		}

		.sidebar-footer {
			margin-top: auto;
			padding: 14px 16px;
			background: var(--surface-2);
			border-radius: var(--radius-md);
			display: flex;
			align-items: center;
			gap: 12px;
			text-decoration: none;
			color: inherit;
			transition:
				background 0.15s,
				box-shadow 0.15s,
				transform 0.12s;
		}

		.sidebar-footer:hover,
		.sidebar-footer.active {
			background: var(--brand-soft-2);
			box-shadow: var(--shadow-sm);
			transform: translateY(-1px);
		}

		.profile-avatar {
			width: 38px;
			height: 38px;
			border-radius: 999px;
			background: var(--brand-gradient);
			color: white;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35);
		}

		.profile-info {
			display: flex;
			flex-direction: column;
			gap: 2px;
			min-width: 0;
		}

		.footer-label {
			font-size: 0.82rem;
			color: var(--text);
			font-weight: 700;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.sidebar-footer.active .footer-label {
			color: var(--brand-strong);
		}

		.footer-value {
			font-size: 0.76rem;
			font-weight: 600;
			color: var(--text-muted);
		}

		main {
			padding: 32px 40px 40px;
		}

		.container {
			max-width: 1120px;
		}
	}

	@media (min-width: 1280px) {
		main {
			padding: 40px 56px 56px;
		}
	}
</style>
