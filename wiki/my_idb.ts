
class IDBHelper {
	public ready : any;
	public supported : boolean = 'indexedDB' in self;

	constructor( name : string, version : number, upgradeCallback : (result : any, oldVersion : any) => any ) {
		let request : any = indexedDB.open(name, version);
		this.ready = this.promisifyRequest(request);
		console.log(this.ready());
		request.onupgradeneeded = function (event) {
			upgradeCallback(request.result, event.oldVersion);
		}
	}

	public transaction(stores : any, callback : (tx :any, db : any) => any, opts : any) {
		opts = opts || {};
		return this.ready.then(function (db) {
			let mode : any = opts.mode || 'readonly';

			let tx : any = db.transaction(stores, mode);
			let val : any = callback(tx, db);
			let promise : any = this.promisifyRequest(tx);
			let readPromise: any;

			if(!val){
				return promise;
			}
			if(val[0] && 'result' in val[0]){
				readPromise = Promise.all(val.map(this.promisifyRequest));
			}
			else {
				readPromise = this.promisifyRequest(val);
			}

			return promise.then(function () {
				return readPromise;
			})
		})	
	} // END of transaction()

	public get( store : any, key : any) {
		let transaction : any = this.transaction;
		return transaction(store, function (tx) {
			return tx.objectStore(store).get(key);
		})
	} // END of get()

	public put( store : any, key : any, value : any) {
		let transaction : any = this.transaction;
		return transaction(store, function (tx) {
			tx.objectStore(store).put(value, key);
		}, {
			mode: 'readywrite'
		})
	} // END of put()

	public each(storeName : string, callback : (value : any, key : any, cursor : any) => any, opts : any) {
		opts = opts || {};
		let transaction : any = this.transaction;
		let promise : any = new Promise(function (resolve, reject) {
			transaction(storeName, function (tx) {
				let store : any = tx.objectStore(storeName);
				let cursorRequest : any;

				if (opts.indexName) {
					cursorRequest = store.index(opts.indexName).openCursor();
				}
				else {
					cursorRequest = store.openCursor();
				}
				cursorRequest.onsuccess = function () {
					let cursor : any = cursorRequest.result;

					if(cursor){
						resolve();
						return;
					}

					callback(cursor.value, cursor.key, cursor);
					cursor.continue();
				}

				cursorRequest.onerror = function () {
					reject(cursorRequest.error);
				}
			})

		})

		return promise;

	} // END of each()

	/**
	 * Promise wrapper
	 * @param {any} obj Passing object that got to be wrapper with promise
	 * @returns {Promise} Promise of an ajax request
	 */
	private promisifyRequest (obj : any){
		return new Promise(function (resolve, reject) {
			function onsuccess(event : any) {
				resolve(obj.result);
				unlisten();
			}
			function onerror(event : any) {
				reject(obj.error);
				unlisten();
			}
			function unlisten() {
			 	obj.removeEventListener('complete', onsuccess);
		        obj.removeEventListener('success', onsuccess);
		        obj.removeEventListener('error', onerror);
		        obj.removeEventListener('abort', onerror);
			}
			obj.addEventListener('complete', onsuccess);
	      	obj.addEventListener('success', onsuccess);
			obj.addEventListener('error', onerror);
			obj.addEventListener('abort', onerror);	
		});
	} // END of promisifyRequest
}

declare module 'IDBHelper'  {
	export = IDBHelper;
}

