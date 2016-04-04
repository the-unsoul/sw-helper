this.addEventListener('install', function (event) {
	event.waitUntil(caches.open('v2').then(function(cache) {
		return cache.addAll([
			// 'index.html',
			'js/app.js',
			'js/sw-helper/installer.js',
			'images/amex.png',
			'images/mastercard.png',
		]);
	}))
})
this.addEventListener('fetch', function(event) {
	console.log(event.request.url);
	event.respondWith(
		caches.match(event.request).catch(function () {
			return fetch(event.request);
		})
	);
})