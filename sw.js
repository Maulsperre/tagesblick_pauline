/* Tagesblick: hält die Seite für den Start ohne Netz bereit. Enthält keine Daten. */
var NAME = 'pauline-shell-v1';
var DATEIEN = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(NAME).then(function (c) { return Promise.all(DATEIEN.map(function (u) { return c.add(u).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('pauline-shell-') === 0 && k !== NAME; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return; /* Microsoft, OneDrive und CDN gehen immer direkt ins Netz */
  e.respondWith(
    fetch(r, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) { var kopie = res.clone(); caches.open(NAME).then(function (c) { c.put(r, kopie); }); }
      return res;
    }).catch(function () {
      return caches.match(r, { ignoreSearch: true }).then(function (t) { return t || (r.mode === 'navigate' ? caches.match('index.html') : undefined); });
    })
  );
});
