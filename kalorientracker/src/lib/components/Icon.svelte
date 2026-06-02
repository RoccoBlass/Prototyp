<script>
	let { name, size = 20, stroke = 2, fill = 'none', class: className = '' } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	{fill}
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	aria-hidden="true"
>
	{#if name === 'home'}
		<path d="m3 9.5 9-6.5 9 6.5V20a1 1 0 0 1-1 1h-4v-7h-8v7H4a1 1 0 0 1-1-1z" />
	{:else if name === 'plus'}
		<path d="M12 5v14M5 12h14" />
	{:else if name === 'calendar'}
		<rect x="3" y="4" width="18" height="18" rx="2" />
		<path d="M16 2v4M8 2v4M3 10h18" />
	{:else if name === 'sunrise'}
		<path d="M17 18a5 5 0 0 0-10 0" />
		<path d="M12 2v7" />
		<path d="m4.93 10.93 1.41 1.41" />
		<path d="M2 18h2" />
		<path d="M20 18h2" />
		<path d="m17.66 12.34 1.41-1.41" />
		<path d="M22 22H2" />
		<path d="m8 6 4-4 4 4" />
	{:else if name === 'sun'}
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
	{:else if name === 'moon'}
		<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
	{:else if name === 'cookie'}
		<path d="M12 2a10 10 0 1 0 10 10c0-.46-.02-.92-.07-1.37A5.4 5.4 0 0 1 17 6a5.4 5.4 0 0 1-4.63-4.93C12.25 2.02 12.13 2 12 2Z" />
		<path d="M8.5 8.5v.01" />
		<path d="M16 15.5v.01" />
		<path d="M12 12v.01" />
		<path d="M11 17v.01" />
		<path d="M7 14v.01" />
	{:else if name === 'trash'}
		<path d="M3 6h18" />
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
		<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
		<path d="M10 11v6M14 11v6" />
	{:else if name === 'utensils'}
		<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
		<path d="M7 2v20" />
		<path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
	{:else if name === 'check-circle'}
		<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
		<path d="m9 11 3 3L22 4" />
	{:else if name === 'alert'}
		<circle cx="12" cy="12" r="10" />
		<path d="M12 8v4M12 16h.01" />
	{:else if name === 'flame'}
		<path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1 2.5-2.5 0-1.39-.99-2.5-2.5-2.5h-1c1.39 0 2.5-1.11 2.5-2.5A2.5 2.5 0 0 0 10 7H7v10h1.5z" />
		<path d="M12 2C9 6 6 8.5 6 12.5a6 6 0 0 0 12 0c0-3.5-2.5-6-6-10.5Z" />
	{:else if name === 'history'}
		<path d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8" />
		<path d="M3 3v5h5" />
		<path d="M12 7v5l4 2" />
	{:else if name === 'beef'}
		<circle cx="12.5" cy="8.5" r="2.5" />
		<path d="M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.8A6.5 6.5 0 0 0 12.5 2Z" />
		<path d="m18.5 6 2.19 4.5a6.48 6.48 0 0 1 .31 2 6.49 6.49 0 0 1-2.6 5.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5" />
	{:else if name === 'wheat'}
		<path d="M2 22 16 8" />
		<path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
		<path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
		<path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
		<path d="M20 2v4h-4" />
		<path d="M16 6c1.5 0 4 1.5 4 4" />
	{:else if name === 'droplet'}
		<path d="M12 2.69 5.64 9.05a9 9 0 1 0 12.72 0z" />
	{:else if name === 'pencil'}
		<path d="M12 20h9" />
		<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
	{:else if name === 'arrow-left'}
		<path d="M19 12H5" />
		<path d="m12 19-7-7 7-7" />
	{:else if name === 'user'}
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	{:else if name === 'target'}
		<circle cx="12" cy="12" r="10" />
		<circle cx="12" cy="12" r="6" />
		<circle cx="12" cy="12" r="2" />
	{:else if name === 'mail'}
		<rect width="20" height="16" x="2" y="4" rx="2" />
		<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
	{:else if name === 'lock'}
		<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
		<path d="M7 11V7a5 5 0 0 1 10 0v4" />
	{:else if name === 'log-out'}
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<path d="m16 17 5-5-5-5" />
		<path d="M21 12H9" />
	{:else if name === 'arrow-right'}
		<path d="M5 12h14" />
		<path d="m12 5 7 7-7 7" />
	{:else if name === 'ruler'}
		<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
		<path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2" />
	{:else if name === 'scale'}
		<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
		<path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
		<path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
	{:else if name === 'activity'}
		<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
	{:else if name === 'trending-down'}
		<path d="m22 17-8.5-8.5-5 5L2 7" />
		<path d="M16 17h6v-6" />
	{:else if name === 'trending-up'}
		<path d="m22 7-8.5 8.5-5-5L2 17" />
		<path d="M16 7h6v6" />
	{:else if name === 'minus'}
		<path d="M5 12h14" />
	{:else if name === 'chevron-down'}
		<path d="m6 9 6 6 6-6" />
	{:else if name === 'sparkles'}
		<path
			d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
		/>
		<path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
	{/if}
</svg>
