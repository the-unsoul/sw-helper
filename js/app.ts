/// <reference path="sw-helper/installer.ts"/>

document.querySelector('#swsupport').textContent = navigator.serviceWorker ? 'enabled' : 'disabled'

let installer = new Installer('my_worker');
installer.init(navigator).then(function (reg) {
	document.querySelector('#swsupport').textContent = "installed"
	console.info(`Registration succeeded. Scope is ${reg.scope}`);
});

