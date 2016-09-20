import { ComposeFactory } from 'dojo-compose/compose';
import { State, Stateful } from 'dojo-compose/mixins/createStateful';
import { Handle } from 'dojo-core/interfaces';
import Promise from 'dojo-shim/Promise';
export interface Bundle {
	locales?: string[];
	messages: Dictionary;
}
export interface BundleMap {
	[path: string]: Bundle;
}
declare const createI18n: IntlFactory;
export default createI18n;
/**
 * The basic dictionary interface.
 */
export interface Dictionary {
	[key: string]: string;
}
export declare type Direction = 'ltr' | 'rtl';
export interface Intl {
	/**
	 * The root text direction.
	 */
	direction: Direction;
	/**
	 * An optional loader function that will be used to load message bundles.
	 */
	loader?: Loader;
	/**
	 * The root locale.
	 */
	locale: string;
	/**
	 * Load the messages located at the specified path for the optionally-specified locale.
	 *
	 * If a locale is not specified, the loader will return the default messages.
	 *
	 * @param path The module path.
	 * @param locale The optional locale.
	 * @return A promise to the requested messages dictionary.
	 */
	load(path: string, locale?: string): Promise<Dictionary>;
	/**
	 * Register a stateful object with bundle and locale data so that its state is
	 * updated when the appropriate messages bundle successfully loads.
	 *
	 * @param stateful A stateful object.
	 * @param options A configuration object containing the bundle path, keys, and
	 * optionally a locale.
	 * @return A promise to a handle for unregistering the stateful.
	 */
	registerStateful(stateful: Stateful<State>, options: StatefulOptions): Promise<Handle>;
	/**
	 * Converts a bundle's default path to its locale-specific forms. Locales are expected to
	 * be separated by hyphens ("-"). Each cumulative segment will be converted to its own path.
	 * For example, if the locale "ar-IR-NM" is provided for the bundle "nls/common", then
	 * the return value will be `[ 'nls/ar/common', 'nls/ar-IR/common', 'nls/ar-IR-NM/common' ]`.
	 *
	 * @param path The bundle path.
	 * @param locale The locale to load.
	 * @param supported A list of locales that are supported by the bundle.
	 * @return An array of locale-specific bundle paths.
	 */
	resolveLocalePaths(path: string, locale: string, supported?: string[]): string[];
	/**
	 * Update the current state to the specified locale and text direction, load the
	 * locale-specific bundles for all registered statefuls, and update the state of
	 * all registered statefuls that do not have their own locale explicitly set.
	 */
	switchLocale(locale: Locale): Promise<void[]>;
	/**
	 * Validates that bundle's default path matches the format required by the loader.
	 * The default loader requires bundles' default paths to be in the format
	 * "{bundle}{pathSeparator}{module}". For example, if the bundle is located at
	 * "messages/main.ts", then "messages/main" is a valid path, whereas "messages/"
	 * is not.
	 *
	 * @param path The bundle's default path.
	 */
	validateBundlePath(path: string): void;
}
export interface IntlFactory extends ComposeFactory<Intl, IntlOptions> {
}
export interface IntlOptions {
	/**
	 * The root text direction.
	 */
	direction?: Direction;
	/**
	 * An optional loader function that will be used to load message bundles.
	 */
	loader?: Loader;
	/**
	 * The root locale.
	 */
	locale?: string;
}
export interface Loader {
	/**
	 * The loader used to load message bundles.
	 *
	 * If not specified, then the default loader will be used, which requires an
	 * absolute (non-relative) module path, as well as that message bundles adhere
	 * to the following directory structure:
	 *
	 * - bundleDir
	 * -- bundleName.ts
	 * -- localeDir
	 * -- bundleName.ts
	 *
	 * @paths - An array of paths representing i18n bundles that should be loaded.
	 * @return A promise to an array of `Bundle` objects.
	 */
	(paths: string[]): Promise<Bundle[]>;
}
export interface Locale {
	/**
	 * The text direction.
	 */
	direction?: Direction;
	/**
	 * The locale string.
	 */
	locale: string;
}
/**
 * An array of message keys, or an object of key aliases used to narrow the
 * values passed to registered statefuls to a subset of the loaded bundle.
 */
export declare type MessageKeys = string[] | Dictionary;
export interface StatefulOptions {
	/**
	 * An array of message keys, or an object of key aliases used to narrow the
	 * values passed to a stateful to a subset of the loaded bundle.
	 */
	keys: MessageKeys;
	/**
	 * The stateful's locale.
	 */
	locale?: string;
	/**
	 * The path to the bundle from which the stateful should receive its messages.
	 */
	path: string;
}
/**
 * The default environment locale.
 *
 * It should be noted that while the system locale will be normalized to a single
 * format when loading message bundles, this value represents the unaltered
 * locale returned directly by the environment.
 */
export declare const systemLocale: string;
