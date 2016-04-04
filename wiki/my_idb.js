var IDBHelper = (function () {
    function IDBHelper(name, version, upgradeCallback) {
        this.supported = 'indexedDB' in self;
        var request = indexedDB.open(name, version);
        this.ready = this.promisifyRequest(request);
        console.log(this.ready());
        request.onupgradeneeded = function (event) {
            upgradeCallback(request.result, event.oldVersion);
        };
    }
    IDBHelper.prototype.transaction = function (stores, callback, opts) {
        opts = opts || {};
        return this.ready.then(function (db) {
            var mode = opts.mode || 'readonly';
            var tx = db.transaction(stores, mode);
            var val = callback(tx, db);
            var promise = this.promisifyRequest(tx);
            var readPromise;
            if (!val) {
                return promise;
            }
            if (val[0] && 'result' in val[0]) {
                readPromise = Promise.all(val.map(this.promisifyRequest));
            }
            else {
                readPromise = this.promisifyRequest(val);
            }
            return promise.then(function () {
                return readPromise;
            });
        });
    }; // END of transaction()
    IDBHelper.prototype.get = function (store, key) {
        var transaction = this.transaction;
        return transaction(store, function (tx) {
            return tx.objectStore(store).get(key);
        });
    }; // END of get()
    IDBHelper.prototype.put = function (store, key, value) {
        var transaction = this.transaction;
        return transaction(store, function (tx) {
            tx.objectStore(store).put(value, key);
        }, {
            mode: 'readywrite'
        });
    }; // END of put()
    IDBHelper.prototype.each = function (storeName, callback, opts) {
        opts = opts || {};
        var transaction = this.transaction;
        var promise = new Promise(function (resolve, reject) {
            transaction(storeName, function (tx) {
                var store = tx.objectStore(storeName);
                var cursorRequest;
                if (opts.indexName) {
                    cursorRequest = store.index(opts.indexName).openCursor();
                }
                else {
                    cursorRequest = store.openCursor();
                }
                cursorRequest.onsuccess = function () {
                    var cursor = cursorRequest.result;
                    if (cursor) {
                        resolve();
                        return;
                    }
                    callback(cursor.value, cursor.key, cursor);
                    cursor.continue();
                };
                cursorRequest.onerror = function () {
                    reject(cursorRequest.error);
                };
            });
        });
        return promise;
    }; // END of each()
    /**
     * Promise wrapper
     * @param {any} obj Passing object that got to be wrapper with promise
     * @returns {Promise} Promise of an ajax request
     */
    IDBHelper.prototype.promisifyRequest = function (obj) {
        return new Promise(function (resolve, reject) {
            function onsuccess(event) {
                resolve(obj.result);
                unlisten();
            }
            function onerror(event) {
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
    }; // END of promisifyRequest
    return IDBHelper;
}());
