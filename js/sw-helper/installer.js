"use strict";
var Installer = (function () {
    function Installer(worker, scope) {
        if (worker === void 0) { worker = 'worker'; }
        if (scope === void 0) { scope = ''; }
        this.worker = worker;
        this.scope = scope;
        this.register_worker = "./" + this.worker + ".js";
        this.register_scope = "./" + this.scope;
    }
    /**
     * unregister any old worker that is not matched with the config
     * @param {object} navigator navigator bject of DOM
     * @param {boolean} forceClean If set to true it purge will clean out completely all the old cache.
     */
    Installer.prototype.purge = function (navigator, forceClean) {
        // Unregister all serviceWorker that doesn't matched with the configured one
        var self = this;
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (var _i = 0, registrations_1 = registrations; _i < registrations_1.length; _i++) {
                var registration = registrations_1[_i];
                var active = registration.active;
                if (forceClean) {
                    registration.unregister();
                }
                else if (active && active.state == 'activated' && !active.scriptURL.includes(self.worker) && !active.scriptURL.includes(self.scope)) {
                    console.log('test');
                    registration.unregister();
                }
            }
        });
    };
    /**
     * Initial service worker
     * @param {object} navigator window.navigator of DOM to be passing into this.
     */
    Installer.prototype.init = function (navigator, callBack) {
        return navigator.serviceWorker.register(this.register_worker, { scope: this.register_scope });
        // .then(function (registration) {
        // 	callBack(registration);
        // }, function (error) {
        // 	console.log(`Failed to install: ${error}`);
        // })
    };
    /**
     * Public method for purge with forceClean = true
     * This is when you want to clean out all the caches of service worker
     * @param {object} navigator window.navigator of DOM to be passing into this.
     */
    Installer.prototype.clean = function (navigator) {
        this.purge(navigator, true);
        return this;
    };
    /**
     * Public method for purge with forceClean = false
     * Useful when worker.js got rename or changed to new file, or when you want to change the scope.
     * @param {object} navigator window.navigator of DOM to be passing into this.
     */
    Installer.prototype.renew = function (navigator) {
        this.purge(navigator);
        return this;
    };
    return Installer;
}());
