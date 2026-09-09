/* Service Worker für den Landungsplaner.
   Aufgabe: die Seite beim ersten Aufruf in den Gerätespeicher legen und
   danach von dort ausliefern. Erst dadurch läuft die Home-Bildschirm-App
   ohne Internet.

   Die Version im Namen wechselt, sobald sich die Seite ändert — dann wird
   der alte Speicher beim nächsten Aufruf mit Netz verworfen. */
var SPEICHER = "landungsplaner-d59c28de";
var DATEIEN = ["./", "./index.html", "./manifest.json", "./icon-180.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(SPEICHER).then(function (c) {
    return c.addAll(DATEIEN);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (namen) {
    return Promise.all(namen.filter(function (n) {
      return n !== SPEICHER;
    }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

/* Zuerst der Speicher, dann das Netz: Im Unterricht zählt, dass die Seite
   sofort und verlässlich da ist — nicht, dass sie die neueste ist. */
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (treffer) {
      return treffer || fetch(e.request).then(function (antwort) {
        var kopie = antwort.clone();
        caches.open(SPEICHER).then(function (c) { c.put(e.request, kopie); });
        return antwort;
      }).catch(function () {
        return caches.match("./index.html");
      });
    })
  );
});
