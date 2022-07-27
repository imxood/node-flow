<script lang="ts">
	import Header from "$lib/header/Header.svelte";
	import { dev } from "$app/env";
	import "../app.css";
	if (dev) {
		console.log("develop mode");
	}
</script>

<Header />

<main>
	<slot />
</main>

<style>
	main {
		width: 100%;
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
