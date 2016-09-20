(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './createI18n'], factory);
    }
})(function (require, exports) {
    "use strict";
    var createI18n_1 = require('./createI18n');
    exports.createI18n = createI18n_1.default;
    exports.systemLocale = createI18n_1.systemLocale;
    var i18n = createI18n_1.default();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = i18n;
});
//# sourceMappingURL=main.js.map