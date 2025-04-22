<script lang="ts">
	import Head from '$lib/head.svelte';
</script>

<Head
	data={{
		title: 'About the Neovim Registry',
		description:
			'The Neovim Registry is a place to find plugins 📦, themes 🎨 and anything related to your favourite editor ♥️.'
	}}
/>

<div class="hero bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">About the Neovim Registry</h1>
			<p class="py-6">
				The Neovim Registry is a place to find plugins 📦, themes 🎨 and anything related to your
				favourite editor ♥️.
			</p>
      <p class="py-6">
        It is a community driven project, and we welcome contributions from anyone who wants to
        add their own plugins or themes.
      </p>
      <p class="py-6">
        The goal of this project is to provide a simple and easy way to find and share Neovim plugins and themes.
      </p>
      <p class="py-6">
        It is heavily inspired by the sublime text package control registry.
      </p>
      <p class="py-6">
        One day, we might even have a package manager for Neovim that can use this registry to find and install plugins and themes.
        Until then, we hope this registry will be a useful resource for the community.
      </p>
		</div>
	</div>
</div>
