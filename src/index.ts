(<DojoLoader.RootRequire> require).config({
	baseUrl: '../../',
	packages: [
		{ name: 'src', location: '_build/src' },
		{ name: 'nls', location: '_build/src/nls' },
		{ name: 'dojo-actions', location: 'node_modules/dojo-actions' },
		{ name: 'dojo-dom', location: 'node_modules/dojo-dom' },
		{ name: 'dojo-compose', location: 'node_modules/dojo-compose' },
		{ name: 'dojo-i18n', location: 'src/dojo-i18n' },
		{ name: 'dojo-core', location: 'node_modules/dojo-core' },
		{ name: 'dojo-shim', location: 'node_modules/dojo-shim' },
		{ name: 'dojo-has', location: 'node_modules/dojo-has' },
		{ name: 'dojo-widgets', location: 'node_modules/dojo-widgets' },
		{ name: 'immutable', location: 'node_modules/immutable/dist', main: 'immutable' },
		{ name: 'maquette', location: 'node_modules/maquette/dist', main: 'maquette' },
		{ name: 'rxjs', location: 'node_modules/@reactivex/rxjs/dist/amd' }
	]
});

require([ 'src/main' ], function () {});
