<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.css';
	import '../app.css';
	let { children } = $props();

	import { sharedStore } from '$lib/store';
	import Navigation from '$lib/navigation.svelte';

	$sharedStore.searchValue = '';
</script>

<div class="flex flex-col min-h-screen max-w-5xl mx-auto">
  <div class="navbar bg-base-200">
    <Navigation />
  </div>
  <div class="flex-grow">
    <div class="container mx-auto">
      {@render children()}
    </div>
  </div>
  <footer class="footer footer-center p-10 bg-base-200 text-base-content">
    <div>
      <p>Made with ❤️ by the community</p>
    </div>
  </footer>
</div>
