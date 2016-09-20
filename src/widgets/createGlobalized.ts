import { ComposeFactory } from 'dojo-compose/compose';
import createEvented from 'dojo-compose/mixins/createEvented';
import { Handle } from 'dojo-core/interfaces';
import i18n, { Locale, MessageKeys } from 'dojo-i18n/main';
import WeakMap from 'dojo-shim/WeakMap';
import createWidget, { Widget, WidgetOptions, WidgetState } from 'dojo-widgets/createWidget';
import { VNodeProperties } from 'maquette';

const instanceMap = new WeakMap<any, { [key: string]: any }>();

function registerWithI18n(instance: Globalized) {
	const properties = instanceMap.get(instance);
	const { locale, nlsPath, nlsKeys } = instance;
	const { nlsHandle } = properties;

	if (!nlsPath || !nlsKeys) {
		if (nlsHandle) {
			nlsHandle.destroy();
			delete properties['nlsHandle'];
		}
		return;
	}

	i18n.registerStateful(instance, {
		locale: locale && locale.locale,
		keys: nlsKeys,
		path: nlsPath
	}).then((handle: Handle) => {
		properties['nlsHandle'] = handle;
		instance.own(handle);
	});
}

function hasParentLocale(instance: Globalized): boolean {
	let parent: any = instance.parent;
	while (parent) {
		if (parent.locale) {
			return true;
		}
		parent = parent.parent;
	}
	return false;
}

const createGlobalized: GlobalizedFactory = createWidget
	.mixin({
		mixin: createEvented,
		initialize(instance: Globalized) {
			instance.own(instance.on('statechange', () => {
				const locale = instance.state.locale;

				if (locale && !hasParentLocale(instance)) {
					instance.locale = locale;
					instance.state.locale = null;
				}
			}));
		}
	})
	.mixin({
		mixin: <GlobalizedMixin> {
			get locale(this: Globalized): Locale {
				return instanceMap.get(this)['locale'];
			},
			set locale(this: Globalized, locale: Locale) {
				instanceMap.get(this)['locale'] = locale;
				registerWithI18n(this);
			}
		},
		aspectAdvice: {
			before: {
				getNodeAttributes(this: Globalized, overrides: VNodeProperties = {}): VNodeProperties[] {
					overrides['direction'] = this.locale && this.locale.direction || null;
					return [ overrides ];
				}
			}
		},
		initialize(instance: Globalized, options: GlobalizedOptions) {
			instanceMap.set(instance, {});

			if (options) {
				const { locale, nlsKeys, nlsPath } = options;

				if (locale) {
					instance.locale = locale;
				}

				if (nlsPath) {
					instance.nlsPath = nlsPath;
				}

				if (nlsKeys) {
					instance.nlsKeys = nlsKeys;
				}
			}

			registerWithI18n(instance);
		}
	});
export default createGlobalized;

export interface GlobalizedMixin {
	locale?: Locale;
	nlsKeys?: MessageKeys;
	nlsPath?: string;
}

export type Globalized = Widget<GlobalizedState> & GlobalizedMixin;

export interface GlobalizedFactory extends ComposeFactory<Globalized, GlobalizedOptions> {}

export interface GlobalizedOptions extends WidgetOptions<GlobalizedState> {
	locale?: Locale;
	nlsKeys?: MessageKeys;
	nlsPath?: string;
}

export interface GlobalizedState extends WidgetState {
	locale?: Locale;
}
