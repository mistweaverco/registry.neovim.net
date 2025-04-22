import { writable } from 'svelte/store';

export const sharedStore = writable({
	showPlugins: true,
	searchValue: '',
	showColorschemes: true,
	filteredPackages: [],
	packagesCount: 0,
	tags: [],
	availableTags: []
});
