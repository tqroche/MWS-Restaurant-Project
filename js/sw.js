const appName = "restaurant-reviews"
const staticCacheName = appName + "-v1.0";

const contentImgsCache = appName + "-images";

var allCaches = [
  staticCacheName,
  contentImgsCache
];

self.addEventListener('install', function(event) {
   event.waitUntil(
     caches.open(staticCacheName).then(function(cache) {
       return cache.addAll ([
       '/', // caches index.html
       'restaurant.html',
       '/css/styles.css',
       // other css files are added here
       '/js/dbhelper.js',
       '/js/secrect.js',
       '/js/main.js',
       '/js/restaurant_info.js',
       'data/restaurants.json'
       // add other static assets here like logos, svg icons or any
       // other asset needed for your app UI
       // (Don't add restaurant images, as they are not part of your
       // application's UI)
      ]);
    })
   );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith(appName) &&
          		 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
           return caches.delete(cacheName);
        })
      );
     })
   );
});

/**Hijack fetch requests and respond accordingly */
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);
	
// only highjack request made to our app (not mapbox maps or leaflet, for example)	
if (requestUrl.origin === location.origin) {

  // Since requests made to restaurant.html have search params (like ?id=1), the url can't be used as the
  // key to access the cache, so just respondWith restaurant.html if pathname startsWith '/restaurant/html'
  if (requestUrl.pathname.startsWith('/restaurant.html')) {
    event.respondWith(caches.match('/restaurants.html'));
    return; // Done handling request, so exit early.
  }
  
// If the request pathname starts with/img, then we need to handle images.
if (requestUrl.pathname.startsWith('/img')) {
    event.respondWith(serveImage(event.request));
    return; // Done handling request, so exit early.
  }  
}

// Default behavior: respond with cached elements, if any, falling back to network.
event.respondWith(
  caches.match(event.request).then(function(response) {
    return respone || fetch(event.request);
     })
   );
});

function serveImage(request) {
  let imageStorageUrl = request.url;
  
  imageStorageUrl = imageStorageUrl.replace(/-small\. \w{3}|-medium\. \w{3}|-large\. \w{3}/i, '');
  
  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(imageStorageUrl).then(function(response) {
    
      return respone || fetch(request).then(function(networkResponse) {
        cache.put(imageStorageUrl), networkResponse.clone();
        return networkResponse;
      });
    });
  });
}