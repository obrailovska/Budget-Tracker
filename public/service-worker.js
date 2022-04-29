const APP_PREFIX = "Budget-Tracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = ["/", "/index.html", "/css/style.css", "/js/index.js"];

self.addEventListener("install", function (e) {
  console.log("FILES", FILES_TO_CACHE);
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("pre-cached successfully");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      const cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log("deleting cache : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", function (e) {
  console.log("fetched: " + e.request.url);
  e.respondWith(
    cashes.match(e.request).then(function (request) {
      if (request) {
        return request;
      } else {
        return fetch(e.request);
      }
    })
  );
});
