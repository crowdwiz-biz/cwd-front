var CACHE = "cwd.global";

self.addEventListener("install", function(e) {
    e.waitUntil(
        caches.open(CACHE).then(function(cache) {
            return cache.addAll(["index.html"]).then(function() {
                return self.skipWaiting();
            });
        })
    );
});

self.addEventListener("activate", function(event) {
    event.waitUntil(self.clients.claim());
    console.log("Now ready to handle fetches!");
});

self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches
            .match(event.request, {ignoreSearch: true})
            .then(function(response) {
                return response || fetch(event.request);
            })
    );
});
