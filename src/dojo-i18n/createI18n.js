(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'dojo-compose/compose', 'dojo-core/global', 'dojo-core/has', 'dojo-core/lang', 'dojo-shim/Promise', 'dojo-shim/WeakMap'], factory);
    }
})(function (require, exports) {
    "use strict";
    var compose_1 = require('dojo-compose/compose');
    var global_1 = require('dojo-core/global');
    var has_1 = require('dojo-core/has');
    var lang_1 = require('dojo-core/lang');
    var Promise_1 = require('dojo-shim/Promise');
    var WeakMap_1 = require('dojo-shim/WeakMap');
    var defaultLoader = (function () {
        function mapBundles(bundleModules) {
            return bundleModules.map(function (bundleModule) {
                var locales = bundleModule.locales;
                var messages = bundleModule.default;
                return { locales: locales, messages: messages };
            });
        }
        if (has_1.default('host-node')) {
            return function (paths) {
                var bundleModules = paths.map(function (path) {
                    return global_1.default.require(path);
                });
                return Promise_1.default.resolve(mapBundles(bundleModules));
            };
        }
        return function (paths) {
            return new Promise_1.default(function (resolve, reject) {
                var require = global_1.default.require;
                require.on('error', function (error) {
                    reject(error);
                });
                require(paths, function () {
                    var bundleModules = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        bundleModules[_i - 0] = arguments[_i];
                    }
                    resolve(mapBundles(bundleModules));
                });
            });
        };
    })();
    function filterKeys(keys, dictionary) {
        var subset = {};
        if (Array.isArray(keys)) {
            return keys.reduce(function (subset, key) {
                subset[key] = dictionary[key];
                return subset;
            }, subset);
        }
        return Object.keys(keys).reduce(function (subset, key) {
            var alias = keys[key];
            subset[alias] = dictionary[key];
            return subset;
        }, subset);
    }
    var normalizeLocale = (function () {
        if (has_1.default('host-node')) {
            return function (locale) {
                if (locale.indexOf('.') === -1) {
                    return locale;
                }
                return locale.split('.').slice(0, -1).map(function (part) {
                    return part.replace(/_/g, '-');
                }).join('-');
            };
        }
        return function (locale) {
            return locale;
        };
    })();
    function getSupportedLocales(locale, supported) {
        if (supported === void 0) { supported = []; }
        var normalized = normalizeLocale(locale);
        var parts = normalized.split('-');
        var result = [];
        var current = parts[0];
        if (supported.indexOf(current) > -1) {
            result.push(current);
        }
        for (var i = 0; i < parts.length - 1; i += 1) {
            var next = parts[i + 1];
            if (next) {
                current += '-' + next;
                if (supported.indexOf(current) > -1) {
                    result.push(current);
                }
            }
        }
        return result;
    }
    var dictionaryRegistry = new WeakMap_1.default();
    var instanceMap = new WeakMap_1.default();
    var statefulMap = new WeakMap_1.default();
    var PATH_SEPARATOR = has_1.default('host-node') ? global_1.default.require('path').sep : '/';
    var VALID_PATH_PATTERN = new RegExp(PATH_SEPARATOR + '[^' + PATH_SEPARATOR + ']+$');
    var createI18n = compose_1.default({
        get direction() {
            return instanceMap.get(this)['direction'] || 'ltr';
        },
        set direction(direction) {
            instanceMap.get(this)['direction'] = direction;
        },
        get locale() {
            return instanceMap.get(this)['locale'] || exports.systemLocale;
        },
        set locale(locale) {
            instanceMap.get(this)['locale'] = locale;
        },
        load: function (path, locale) {
            if (locale === void 0) { locale = this.locale; }
            path = path.replace(/\/$/, '');
            try {
                this.validateBundlePath(path);
            }
            catch (error) {
                return Promise_1.default.reject(error);
            }
            var registry = dictionaryRegistry.get(this);
            var defaultBundle = registry[path];
            var loader = this.loader || defaultLoader;
            var defaultBundlePromise = defaultBundle ? Promise_1.default.resolve(defaultBundle) :
                loader([path]).then(function (bundles) {
                    var defaultBundle = bundles[0];
                    registry[path] = defaultBundle;
                    return defaultBundle;
                });
            return defaultBundlePromise
                .then(function (defaultBundle) {
                var localePaths = this.resolveLocalePaths(path, locale, defaultBundle.locales);
                if (!localePaths.length) {
                    return defaultBundle.messages;
                }
                var localeDictionary = registry[localePaths[localePaths.length - 1]];
                if (localeDictionary) {
                    return localeDictionary.messages;
                }
                return loader(localePaths).then(function (bundles) {
                    return bundles.reduce(function (previous, partial, i) {
                        var bundle = {
                            messages: lang_1.assign({}, previous, partial.messages)
                        };
                        var localePath = localePaths[i];
                        registry[localePath] = bundle;
                        return bundle.messages;
                    }, defaultBundle.messages);
                });
            }.bind(this));
        },
        registerStateful: (function () {
            function getIndex(stateful, statefuls) {
                var i = statefuls.length - 1;
                var index = -1;
                while (i >= 0) {
                    if (statefuls[i].stateful === stateful) {
                        index = i;
                        break;
                    }
                    i -= 1;
                }
                return index;
            }
            return function (stateful, options) {
                var keys = options.keys, locale = options.locale, path = options.path;
                this.validateBundlePath(path);
                var statefulPathData = statefulMap.get(this);
                var statefuls = statefulPathData[path];
                if (!statefuls) {
                    statefuls = statefulPathData[path] = [];
                }
                var index = getIndex(stateful, statefuls);
                if (index > -1) {
                    statefuls[index].options = options;
                }
                else {
                    statefuls.push({ stateful: stateful, options: options });
                }
                return this.load(path, locale).then(function (dictionary) {
                    var filtered = filterKeys(keys, dictionary);
                    var messages = Array.isArray(keys) ? { messages: filtered } : filtered;
                    stateful.setState(messages);
                    return {
                        destroy: function () {
                            this.destroy = function () { };
                            statefuls.splice(getIndex(stateful, statefuls), 1);
                        }
                    };
                });
            };
        })(),
        resolveLocalePaths: function (path, locale, supported) {
            this.validateBundlePath(path);
            var filename;
            var parentDirectory = path.replace(VALID_PATH_PATTERN, function (matched) {
                filename = matched;
                return PATH_SEPARATOR;
            });
            var locales = getSupportedLocales(locale, supported);
            return locales.map(function (locale) {
                return "" + parentDirectory + locale + filename;
            });
        },
        switchLocale: function (data) {
            var _this = this;
            var direction = data.direction, locale = data.locale;
            this.direction = direction;
            this.locale = locale;
            var statefulPathData = statefulMap.get(this);
            return Promise_1.default.all(Object.keys(statefulPathData).map(function (path) {
                return _this.load(path).then(function (dictionary) {
                    statefulPathData[path].forEach(function (entry) {
                        var options = entry.options, stateful = entry.stateful;
                        var keys = options.keys, locale = options.locale;
                        if (!options.locale) {
                            var filtered = filterKeys(keys, dictionary);
                            var messages = Array.isArray(keys) ? { messages: filtered } : filtered;
                            stateful.setState(messages);
                        }
                    });
                });
            }));
        },
        validateBundlePath: function (path) {
            if (!VALID_PATH_PATTERN.test(path)) {
                var message = 'Invalid i18n bundle path. Bundle maps must adhere to the format' +
                    ' "{basePath}{separator}{bundleName}" so that locale bundles can be resolved.';
                throw new Error(message);
            }
        }
    }, function (instance, options) {
        var bundleMap = {};
        dictionaryRegistry.set(instance, bundleMap);
        instanceMap.set(instance, {});
        statefulMap.set(instance, {});
        if (options) {
            instance.direction = options.direction;
            instance.loader = options.loader;
            instance.locale = options.locale;
        }
    });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = createI18n;
    /**
     * The default environment locale.
     *
     * It should be noted that while the system locale will be normalized to a single
     * format when loading message bundles, this value represents the unaltered
     * locale returned directly by the environment.
     */
    exports.systemLocale = (function () {
        var systemLocale = 'en';
        if (has_1.default('host-browser')) {
            systemLocale = navigator.language;
        }
        else if (has_1.default('host-node')) {
            systemLocale = global_1.default.process.env.LANG;
        }
        return systemLocale;
    })();
});
//# sourceMappingURL=createI18n.js.map