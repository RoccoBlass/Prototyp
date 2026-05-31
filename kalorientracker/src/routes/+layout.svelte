<script>
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import Icon from '$lib/components/Icon.svelte';
	import '../app.css';

	let { data, children } = $props();

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: 'home' },
		{ href: '/add', label: 'Hinzufügen', icon: 'plus' },
		{ href: '/weight', label: 'Gewicht', icon: 'scale' },
		{ href: '/history', label: 'Verlauf', icon: 'history' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Kalorientracker</title>
</svelte:head>

{#if data.user && data.user.onboarded}
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
		<a href="/weight" class:active={page.url.pathname === '/weight'}>
			<Icon name="scale" size={22} />
			<span class="nav-label">Gewicht</span>
		</a>
		<a href="/add" class:active={page.url.pathname === '/add'} class="add-link">
			<span class="add-circle"><Icon name="plus" size={22} stroke={2.4} /></span>
			<span class="nav-label">Neu</span>
		</a>
		<a href="/history" class:active={page.url.pathname === '/history'}>
			<Icon name="history" size={22} />
			<span class="nav-label">Verlauf</span>
		</a>
		<a href="/profile" class:active={page.url.pathname === '/profile'}>
			<Icon name="user" size={22} />
			<span class="nav-label">Profil</span>
		</a>
	</nav>
</div>
{:else}
	{@render children()}
{/if}

<style>
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
		padding: var(--space-3) var(--space-4);
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		text-decoration: none;
		color: var(--text);
		font-weight: var(--weight-extrabold);
		letter-spacing: -0.02em;
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

	.brand-mobile .brand-mark {
		width: 30px;
		height: 30px;
		border-radius: var(--radius-sm);
	}

	.brand-text {
		font-size: var(--text-body);
	}

	main {
		flex: 1;
		padding: var(--space-4) var(--space-4) 108px;
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
		border-radius: var(--radius-lg);
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
		padding: var(--space-3) 0 var(--space-3);
		text-decoration: none;
		color: var(--text-subtle);
		gap: var(--space-1);
		transition: color 0.15s;
	}

	.bottom-nav a.active {
		color: var(--brand);
	}

	.nav-label {
		font-size: var(--text-overline);
		font-weight: var(--weight-bold);
		letter-spacing: 0.01em;
		white-space: nowrap;
	}

	.add-link {
		position: relative;
	}

	.add-circle {
		width: 46px;
		height: 46px;
		background: var(--brand-gradient);
		color: var(--gray-0);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6px 16px rgb(var(--green-600-rgb) / 0.45);
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
			gap: var(--space-6);
			padding: var(--space-6) var(--space-4);
			background: var(--surface);
			border-right: 1px solid var(--border);
			position: sticky;
			top: 0;
			height: 100dvh;
		}

		.sidebar .brand {
			padding: var(--space-1) var(--space-2);
			font-size: var(--text-h2);
		}

		.side-nav {
			display: flex;
			flex-direction: column;
			gap: var(--space-2);
		}

		.side-nav-link {
			display: flex;
			align-items: center;
			gap: var(--space-3);
			padding: var(--space-3) var(--space-4);
			border-radius: var(--radius-md);
			text-decoration: none;
			color: var(--text-muted);
			font-size: var(--text-body);
			font-weight: var(--weight-semibold);
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
			padding: var(--space-4) var(--space-4);
			background: var(--surface-2);
			border-radius: var(--radius-md);
			display: flex;
			align-items: center;
			gap: var(--space-3);
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
			border-radius: var(--radius-full);
			background: var(--brand-gradient);
			color: var(--gray-0);
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-shadow: 0 4px 12px rgb(var(--green-600-rgb) / 0.35);
		}

		.profile-info {
			display: flex;
			flex-direction: column;
			gap: var(--space-1);
			min-width: 0;
		}

		.footer-label {
			font-size: var(--text-body-sm);
			color: var(--text);
			font-weight: var(--weight-bold);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.sidebar-footer.active .footer-label {
			color: var(--brand-strong);
		}

		.footer-value {
			font-size: var(--text-caption);
			font-weight: var(--weight-semibold);
			color: var(--text-muted);
		}

		main {
			padding: var(--space-8) var(--space-8) var(--space-8);
		}

		.container {
			max-width: 1120px;
		}
	}

	@media (min-width: 1280px) {
		main {
			padding: var(--space-8) 56px 56px;
		}
	}
</style>
