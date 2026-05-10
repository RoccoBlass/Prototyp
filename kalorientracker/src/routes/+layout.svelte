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
				<span class="footer-label">Mein Profil</span>
				<span class="footer-value">{data.calorieGoal} kcal Ziel</span>
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

<style>
	:global(:root) {
		--bg: #f7f8f7;
		--surface: #ffffff;
		--surface-2: #f3f5f4;
		--border: #e7eae8;
		--border-strong: #d5d9d7;
		--text: #0f172a;
		--text-muted: #64748b;
		--text-subtle: #94a3b8;
		--brand: #16a34a;
		--brand-strong: #15803d;
		--brand-soft: #dcfce7;
		--brand-soft-2: #f0fdf4;
		--danger: #ef4444;
		--danger-soft: #fee2e2;
		--protein: #3b82f6;
		--protein-soft: #dbeafe;
		--carbs: #f59e0b;
		--carbs-soft: #fef3c7;
		--fat: #f97316;
		--fat-soft: #ffedd5;
		--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
		--shadow-md: 0 4px 16px rgba(15, 23, 42, 0.06);
		--radius-sm: 10px;
		--radius-md: 14px;
		--radius-lg: 18px;
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
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		padding: 12px 18px;
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.topbar-profile {
		width: 36px;
		height: 36px;
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
			color 0.15s;
	}

	.topbar-profile:hover,
	.topbar-profile.active {
		background: var(--brand-soft);
		color: var(--brand-strong);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--text);
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.brand-mark {
		width: 32px;
		height: 32px;
		border-radius: 9px;
		background: linear-gradient(135deg, #22c55e, #16a34a);
		color: white;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(22, 163, 74, 0.35);
	}

	.brand-mobile .brand-mark {
		width: 28px;
		height: 28px;
		border-radius: 8px;
	}

	.brand-text {
		font-size: 0.95rem;
	}

	main {
		flex: 1;
		padding: 18px 16px 96px;
	}

	.container {
		max-width: 480px;
		margin: 0 auto;
		width: 100%;
	}

	/* Bottom nav (mobile) */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--surface);
		border-top: 1px solid var(--border);
		display: flex;
		z-index: 10;
		padding-bottom: env(safe-area-inset-bottom, 0);
		box-shadow: 0 -2px 12px rgba(15, 23, 42, 0.04);
	}

	.bottom-nav a {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px 0 12px;
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
		font-weight: 600;
		letter-spacing: 0.01em;
	}

	.add-link {
		position: relative;
	}

	.add-circle {
		width: 44px;
		height: 44px;
		background: linear-gradient(135deg, #22c55e, #16a34a);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
		transition: transform 0.15s;
		margin-top: -10px;
	}

	.add-link:hover .add-circle,
	.add-link.active .add-circle {
		transform: scale(1.05);
	}

	.add-link.active .nav-label {
		color: var(--brand);
	}

	/* Desktop layout */
	@media (min-width: 900px) {
		.app {
			display: grid;
			grid-template-columns: 248px 1fr;
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
			gap: 24px;
			padding: 24px 18px;
			background: var(--surface);
			border-right: 1px solid var(--border);
			position: sticky;
			top: 0;
			height: 100dvh;
		}

		.sidebar .brand {
			padding: 4px 8px;
			font-size: 1rem;
		}

		.side-nav {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		.side-nav-link {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 10px 12px;
			border-radius: 10px;
			text-decoration: none;
			color: var(--text-muted);
			font-size: 0.9rem;
			font-weight: 500;
			transition:
				background 0.15s,
				color 0.15s;
		}

		.side-nav-link:hover {
			background: var(--surface-2);
			color: var(--text);
		}

		.side-nav-link.active {
			background: var(--brand-soft);
			color: var(--brand-strong);
			font-weight: 600;
		}

		.sidebar-footer {
			margin-top: auto;
			padding: 12px 14px;
			background: var(--surface-2);
			border-radius: var(--radius-md);
			display: flex;
			align-items: center;
			gap: 12px;
			text-decoration: none;
			color: inherit;
			transition:
				background 0.15s,
				box-shadow 0.15s;
		}

		.sidebar-footer:hover,
		.sidebar-footer.active {
			background: var(--brand-soft-2);
			box-shadow: var(--shadow-sm);
		}

		.profile-avatar {
			width: 36px;
			height: 36px;
			border-radius: 999px;
			background: var(--brand);
			color: white;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
		}

		.profile-info {
			display: flex;
			flex-direction: column;
			gap: 1px;
			min-width: 0;
		}

		.footer-label {
			font-size: 0.7rem;
			color: var(--text-subtle);
			text-transform: uppercase;
			letter-spacing: 0.06em;
			font-weight: 700;
		}

		.sidebar-footer.active .footer-label {
			color: var(--brand-strong);
		}

		.footer-value {
			font-size: 0.88rem;
			font-weight: 700;
			color: var(--text);
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
