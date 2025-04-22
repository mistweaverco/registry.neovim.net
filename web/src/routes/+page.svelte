<script lang="ts">
	import Head from '$lib/head.svelte';
	import { onMount } from 'svelte';
	import { sharedStore } from '$lib/store';

	let modalInfo;
	let modalInfoCloseButton;
	let alertCopySuccess;
	let activePackageIndex = 0;
	let packages = [];

	let activePackageData = {
		name: '',
		description: '',
		homepage: '',
		repository: '',
		license: 'unknown',
		languages: [],
		tags: [],
		category: '',
		media: {
			images: [],
			videos: []
		}
	};

	const onHomepageIconClick = (e: Event) => {
		const target = e.currentTarget as HTMLElement;
		const btn = target.closest('button') as HTMLSpanElement;
		const homepage = btn.dataset.homepage as string;
		window.open(homepage, '_blank');
	};

	const onNameIconClick = (e: Event) => {
		const target = e.currentTarget as HTMLElement;
		const btn = target.closest('button') as HTMLSpanElement;
		const name = btn.dataset.name as string;
		navigator.clipboard.writeText(name);
		alertCopySuccess.classList.remove('hidden');
		setTimeout(() => {
			alertCopySuccess.classList.add('hidden');
		}, 2000);
	};

	const onRemotePackageItemClick = (e: Event) => {
		const target = e.currentTarget as HTMLElement;
		const tr = target.closest('tr') as HTMLTableRowElement;
		activePackageIndex = parseInt(tr.dataset.index as string);
		activePackageData = $sharedStore.filteredPackages[activePackageIndex];
		modalInfo.showModal();
		modalInfoCloseButton.focus();
	};

	const filterPackages = () => {
		if ($sharedStore.tags.length > 0) {
			$sharedStore.filteredPackages = packages.filter((pkg) => {
				return pkg.tags.some((tag) => $sharedStore.tags.includes(tag));
			});
		} else {
			$sharedStore.filteredPackages = packages;
		}
		if ($sharedStore.showColorschemes) {
			$sharedStore.filteredPackages = $sharedStore.filteredPackages.filter((pkg) => {
				if ($sharedStore.showPlugins) {
					return pkg.category === 'colorscheme' || pkg.category === 'plugin';
				} else {
					return pkg.category === 'colorscheme';
				}
			});
		}
		if ($sharedStore.showPlugins) {
			$sharedStore.filteredPackages = $sharedStore.filteredPackages.filter((pkg) => {
				if ($sharedStore.showColorschemes) {
					return pkg.category === 'plugin' || pkg.category === 'colorscheme';
				} else {
					return pkg.category === 'plugin';
				}
			});
		}
		if ($sharedStore.searchValue === '') {
			return;
		}
		$sharedStore.filteredPackages = $sharedStore.filteredPackages.filter((pkg) => {
			return pkg.name.toLowerCase().includes($sharedStore.searchValue.toLowerCase());
		});
	};

	$: $sharedStore.searchValue, filterPackages();

	const toggleCategory = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement;
		const name = target.name;
		const checked = target.checked;
		if (name === 'colorschemes') {
			$sharedStore.showColorschemes = checked;
		} else if (name === 'plugins') {
			$sharedStore.showPlugins = checked;
		}
	};

	const addTag = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement;
		const input = target.closest('input') as HTMLInputElement;
		const value = input.value;
		if (value === '') {
			return;
		}
		if ($sharedStore.tags.includes(value)) {
			input.value = '';
			return;
		}
		$sharedStore.tags = [...$sharedStore.tags, value];
		input.value = '';
	};

	const removeTag = (tag: string) => {
		$sharedStore.tags = $sharedStore.tags.filter((t) => t !== tag);
	};

	onMount(async () => {
		const res = await fetch('/neovim-registry.json');
		const data = await res.json();
		const sortedData = data.sort((a, b) => {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});
		packages = sortedData;
		$sharedStore.filteredPackages = sortedData;
		$sharedStore.packagesCount = sortedData.length;
    filterPackages();
	});
</script>

<Head
	data={{
		title: 'The Neovim Registry',
		description:
			'Easily find plugins 📦, themes 🎨 and anything related to your favourite editor ♥️.'
	}}
/>

<dialog bind:this={modalInfo} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Info</h3>
		<table class="table w-full">
			<tbody>
				<tr>
					<td>Name:</td>
					<td>
						<div class="flex items-center gap-2">
							<label class="input input-bordered">
								<input type="text" class="grow" readonly value={activePackageData.name} />
							</label>
							<button
								class="btn btn-primary"
								aria-label="Click to copy the name to clipboard"
								on:click={onNameIconClick}
								data-name={activePackageData.name}
							>
								<span class="icon">
									<i class="fa-solid fa-copy"></i>
								</span>
							</button>
						</div>
						<div role="alert" bind:this={alertCopySuccess} class="alert alert-success mt-3 hidden">
							<span class="icon">
								<i class="fa-solid fa-check"></i>
							</span>
							<span>Successfully copied to clipboard</span>
						</div>
					</td>
				</tr>
				<tr>
					<td>Description:</td>
					<td>{activePackageData.description}</td>
				</tr>
				<tr>
					<td>Homepage:</td>
					<td>
						<div class="flex items-center gap-2">
							<label class="input input-bordered">
								<input type="text" class="grow" readonly value={activePackageData.homepage} />
							</label>
							<button
								class="btn btn-primary"
								aria-label="Click to open the homepage in a new tab"
								on:click={onHomepageIconClick}
								data-homepage={activePackageData.homepage}
							>
								<span class="icon">
									<i class="fa-solid fa-external-link"></i>
								</span>
							</button>
						</div>
					</td>
				</tr>
				<tr>
					<td>License:</td>
					<td>{activePackageData.license}</td>
				</tr>
				{#if activePackageData.languages && activePackageData.languages.length > 0}
					<tr>
						<td>Languages:</td>
						<td>{activePackageData.languages.join(', ')}</td>
					</tr>
				{/if}
				<tr>
					<td>Categories:</td>
					<td>{activePackageData.tags.join(', ')}</td>
				</tr>
				{#if activePackageData.media && activePackageData.media.images && activePackageData.media.images.length > 0}
					<tr>
						<td>Media:</td>
						<td>
							<div class="tabs tabs-lift">
								<label class="tab">
									<input type="radio" checked />
									<span class="icon">
										<i class="fa-solid fa-images"></i>
									</span>
									<span>Images</span>
								</label>
								<div class="tab-content bg-base-100 border-base-300 p-6">Tab content 1</div>
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
		<div class="modal-action">
			<form method="dialog">
				<button bind:this={modalInfoCloseButton} class="btn">Close</button>
			</form>
		</div>
	</div>
</dialog>

<div class="flex flex-col items-center">
	<h1 class="mt-2 text-3xl font-bold">The Neovim Registry</h1>
	<p class="mt-2 text-lg">
		Easily find plugins 📦, themes 🎨 and anything related to your favourite editor ♥️.
	</p>
	<div class="alert alert-info mt-2 w-auto">
		<span class="icon">
			<i class="fa-solid fa-info"></i>
		</span>
		<span>{packages.length} packages in this registry.</span>
	</div>
</div>

<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
	<legend class="fieldset-legend">Search options</legend>
	<label class="label">
		<input
			type="checkbox"
			name="colorschemes"
			checked
			class="toggle toggle-success"
			on:change={toggleCategory}
		/>
		Colorschemes
	</label>
	<label class="label">
		<input
			type="checkbox"
			name="plugins"
			checked
			class="toggle toggle-success"
			on:change={toggleCategory}
		/>
		Plugins
	</label>
	<label class="label">
		Tags
		<input list="tags" class="input" name="tags" on:change={addTag} />
		<datalist id="tags">
			{#each $sharedStore.filteredPackages as pkg, i (pkg.name)}
				{#each pkg.tags as tag}
					<option value={tag}>
						{tag}
					</option>
				{/each}
			{/each}
		</datalist>
	</label>
</fieldset>
<div class="tags mt-2 p-2">
	{#each $sharedStore.tags as tag}
		<div class="tag">
			<span>{tag}</span>
			<button class="btn btn-sm btn-circle bg-secondary ml-2" on:click={() => removeTag(tag)}
				>✕</button
			>
		</div>
	{/each}
</div>

<div class="flex flex-col items-center">
	<h2 class="mt-2 text-2xl font-bold">Results</h2>
</div>

<div class="overflow-x-auto">
	<table class="table w-full">
		<thead>
			<tr>
				<th>Name</th>
			</tr>
		</thead>
		<tbody>
			{#each $sharedStore.filteredPackages as pkg, i (pkg.name)}
				<tr
					class="remote-package-item {i === activePackageIndex
						? 'bg-primary text-primary-content'
						: ''}"
					on:click={onRemotePackageItemClick}
					data-index={i}
				>
					<td>{pkg.name}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	td {
		vertical-align: top;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.tag {
		display: flex;
		align-items: center;
		background-color: var(--color-primary);
		padding: 0.5rem;
		border-radius: 0.5rem;
	}
</style>
