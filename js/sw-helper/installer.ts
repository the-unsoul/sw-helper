"use strict";
class Installer {
	private worker: string;
	private scope: string;
	private register_worker: string;
	private register_scope: string;

	constructor(worker: string = 'worker', scope: string = ''){
		this.worker = worker;
		this.scope = scope;
		this.register_worker = `./${this.worker}.js`;
		this.register_scope = `./${this.scope}`;
	}
	/**
	 * unregister any old worker that is not matched with the config
	 * @param {object} navigator navigator bject of DOM
	 * @param {boolean} forceClean If set to true it purge will clean out completely all the old cache.
	 */
	private purge(navigator: any, forceClean?: boolean){
		// Unregister all serviceWorker that doesn't matched with the configured one
		let self = this;
		navigator.serviceWorker.getRegistrations().then(function(registrations) {
			for (let registration of registrations) {
				let active = registration.active;
				if (forceClean) {
					registration.unregister();
				}
				else if (active && active.state == 'activated' && !active.scriptURL.includes(self.worker) && !active.scriptURL.includes(self.scope)) {
					console.log('test');
					registration.unregister();
				}
			}
		});
	}

	/**
	 * Initial service worker
	 * @param {object} navigator window.navigator of DOM to be passing into this.
	 */
	public init(navigator: any, callBack?: any){
		return navigator.serviceWorker.register(this.register_worker, { scope: this.register_scope });
		// .then(function (registration) {
		// 	callBack(registration);
		// }, function (error) {
		// 	console.log(`Failed to install: ${error}`);
		// })
	}

	/**
	 * Public method for purge with forceClean = true
	 * This is when you want to clean out all the caches of service worker
	 * @param {object} navigator window.navigator of DOM to be passing into this.
	 */
	public clean(navigator: any){
		this.purge(navigator, true);
		return this;
	}

	/**
	 * Public method for purge with forceClean = false
	 * Useful when worker.js got rename or changed to new file, or when you want to change the scope.
	 * @param {object} navigator window.navigator of DOM to be passing into this.
	 */
	public renew(navigator: any){
		this.purge(navigator);
		return this;
	}
}

declare module 'Installer' {
	export = Installer;
}