// Array of assets to cache
const defaultCache = [
  "/",
  "/index.html",
  "/offline.html"
];

// Function to pre-load defaultCache into cache during installation
const preLoad = async function() {
  const cache = await caches.open("offline");
  return await cache.addAll(defaultCache);
};

// Event listener for installation
self.addEventListener("install", function(event) {
  event.waitUntil(preLoad());
});

// Function to check response status
const checkResponse = async function(request) {
  return new Promise(async function(resolve, reject) {
    await fetch(request).then(function(response) {
      if (response && response.status !== 404) {
        resolve(response);
      } else {
        reject();
      }
    }).catch(reject);
  });
};

// Function to add request/response pair to cache
const addToCache = async function(request) {
  return caches.open("offline").then(async function(cache) {
    return await fetch(request).then(async function(response) {
      return await cache.put(request, response.clone());
    });
  });
};

// Function to return response from cache
const returnFromCache = async function(request) {
  const cache = await caches.open("offline");
  const matching = await cache.match(request);
  if (!matching || matching.status === 404) {
    return cache.match("/offline.html");
  } else {
    return matching;
  }
};

// Event listener for fetch requests
self.addEventListener("fetch", function(event) {
  // Intercept fetch requests
  event.respondWith(
    // Check if response is available in cache
    checkResponse(event.request)
      .then(function(response) {
        // If response is valid, return from cache
        return response;
      })
      .catch(function() {
        // If response is not available in cache, fetch from network
        return returnFromCache(event.request);
      })
  );

  // Update cache with the response
  event.waitUntil(
    addToCache(event.request)
      .then(function() {
        // Cache updated successfully
        console.log("Cache updated");
      })
      .catch(function(error) {
        // Cache update failed
        console.error("Cache update failed:", error);
      })
  );
});
