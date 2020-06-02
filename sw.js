"use strict";

const CACHE_NAME = 'simplesite.godaddysites.com-1591107975851';
const SW_SUPPORTED_PROTOCOL_REGEX = /http(s?):/;
const pageUrls = JSON.parse('["/"]');
const staticAssets = JSON.parse('["//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/8396e10278a51439/styles.css","//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/4a9cd76b5890a16e/styles.css","//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/96a9cad11381dc1a/styles.css","//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/c0b61dd9be6ceb57/styles.css","https://img1.wsimg.com/poly/v2/polyfill.min.js?unknown=polyfill&flags=gated&features=default%2Cfetch%2CArray.prototype.%40%40iterator%2CArray.prototype.find%2CArray.prototype.findIndex%2CFunction.name%2CNumber.isFinite%2CPromise%2CString.prototype.repeat%2CMath.sign%2CMath.trunc%2CArray.prototype.includes%2CObject.entries%2CObject.values%2CIntersectionObserver%2CIntl.~locale.ru-RU","//img1.wsimg.com/blobby/go/gpub/2a4f73fcd74c5421/script.js","//img1.wsimg.com/ceph-p3-01/website-builder-data-prod/static/widgets/UX.3.57.45.js","//img1.wsimg.com/blobby/go/gpub/995ba84bd8b9ae24/script.js","//img1.wsimg.com/blobby/go/gpub/a62a5ab377a54729/script.js","//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/b4541508dbdd6755/script.js","//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/af71a1ca3d0c6f84/script.js","//img1.wsimg.com/blobby/go/gpub/a284be344b41bbe3/script.js","//img1.wsimg.com/blobby/go/gpub/e911b827e821903b/script.js","//img1.wsimg.com/blobby/go/gpub/623088c5c936f441/script.js","//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/5e4a7bb1a7ad7342/script.js","//img1.wsimg.com/blobby/go/gpub/4332fbaf0cbc50a4/script.js","//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/aa013e53057b1941/script.js","//img1.wsimg.com/blobby/go/gpub/67b286479caa4f4d/script.js","//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/acfdf80344a4fe7a/script.js","//img1.wsimg.com/blobby/go/gpub/eadee51fad5fb790/script.js","//img1.wsimg.com/blobby/go/a93142c6-cb84-4de3-a55b-1db0676d7c88/gpub/47b6ab88ebc743cd/script.js","//fonts.googleapis.com/css?family=Archivo+Black:400&display=swap","//fonts.googleapis.com/css?family=Montserrat:400,700&display=swap"]');
const networkOnlyUrls = JSON.parse('["https://api.ola.godaddy.com","https://a93142c6-cb84-4de3-a55b-1db0676d7c88.onlinestore.godaddy.com","https://img.secureserver.net/t/1/tl/event","https://img.test-secureserver.net/t/1/tl/event","https://www.google-analytics.com/collect"]');
const networkOnlyUrlsRegex = JSON.parse('["simplesite.godaddysites.com/m/api/.*","simplesite.godaddysites.com(?:/.*)?/ola/services/.*","simplesite.godaddysites.com/ola/meetings/.*","securepay.godaddy.com/api/apps/ola/accounts/.*"]').map(regexString => new RegExp(regexString));
const networkThenCacheUrls = JSON.parse('["https://blog.apps.secureserver.net/v1/website/a93142c6-cb84-4de3-a55b-1db0676d7c88/feed/post/","https://blog.apps.secureserver.net/v1/website/a93142c6-cb84-4de3-a55b-1db0676d7c88/feed"]');
const networkThenCacheUrlsRegex = JSON.parse('["simplesite.godaddysites.com(?:/.*)?/f/.*"]').map(regexString => new RegExp(regexString));
self.addEventListener('unhandledrejection', function (event) {
  // eslint-disable-next-line no-console
  console.warn('sw unhandledrejection error: ', event.reason);
});

function preCacheResources() {
  return caches.open(CACHE_NAME).then(function (cache) {
    // Pre-Cache pages to improve subsequent navigation but don't making it blocking
    // Avoid extremely large websites from using the end-users data in unexpected amount
    cache.addAll(pageUrls); // Pre-cache all static assets by keeping them as installation dependency

    return cache.addAll(staticAssets);
  });
}

self.addEventListener('install', function (event) {
  // Let the new worker take over as fast as possible
  // For quirks refer: https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#skip_the_waiting_phase
  self.skipWaiting();
  event.waitUntil(preCacheResources());
});

function clearOldCache() {
  return caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key !== CACHE_NAME;
    }).map(function (key) {
      return caches.delete(key);
    }));
  });
}

self.addEventListener('activate', function (event) {
  // Remember to keep this step as lean as possible
  // Only sutiable for performing stuff that can't be done while the previous worker is running
  event.waitUntil(clearOldCache().then(function () {
    clients.claim(); // eslint-disable-line no-undef
  }));
});

function isPageRequest(url) {
  return url.origin === location.origin && pageUrls.includes(url.pathname);
}

function isNetworkOnlyRequest(url, requestMethod) {
  // Browser extensions don't use the standard `http` and `https` protocols
  // Refer: https://github.com/GoogleChromeLabs/sw-toolbox/issues/171
  if (requestMethod !== 'GET' || !SW_SUPPORTED_PROTOCOL_REGEX.test(url.protocol)) {
    return true;
  }

  const urlOrigin = url.origin;
  const urlPathName = url.pathname;
  const fullUrl = `${urlOrigin}${urlPathName}`;

  if (networkOnlyUrls.includes(urlOrigin) || networkOnlyUrls.includes(fullUrl)) {
    return true;
  }

  if (networkOnlyUrlsRegex.some(regex => regex.test(fullUrl))) {
    return true;
  }

  return false;
}

function isNetworkThenCacheRequest(url, requestMethod) {
  // Browser extensions don't use the standard `http` and `https` protocols
  // Refer: https://github.com/GoogleChromeLabs/sw-toolbox/issues/171
  if (requestMethod !== 'GET' || !SW_SUPPORTED_PROTOCOL_REGEX.test(url.protocol)) {
    return true;
  }

  const urlOrigin = url.origin;
  const urlPathName = url.pathname;
  const fullUrl = `${urlOrigin}${urlPathName}`;

  if (networkThenCacheUrls.includes(urlOrigin) || networkThenCacheUrls.includes(fullUrl)) {
    return true;
  }

  if (networkThenCacheUrlsRegex.some(regex => regex.test(fullUrl))) {
    return true;
  }

  return false;
}

function handleWithNetworkThenCache(event) {
  return event.respondWith(fetch(event.request).then(function (networkResponse) {
    if (!networkResponse.ok) {
      return networkResponse;
    }

    return caches.open(CACHE_NAME).then(function (cache) {
      cache.put(event.request, networkResponse.clone());
      return networkResponse;
    });
  }).catch(function () {
    // network failed, try to serve a cached response or offline page if there is one
    return caches.match(event.request);
  }));
}

function handleWithCacheThenNetwork(event) {
  return event.respondWith(caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(event.request).then(function (response) {
      return response || fetch(event.request).then(function (networkResponse) {
        networkResponse.ok && cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
    });
  }).catch(function (err) {
    // TODO: respond with `offline.html` as the final fallback for page requests
    // and use appropriate response for other cases
    return err;
  }));
}

function handleWithNetwork(event) {
  return event.respondWith(fetch(event.request));
}

function handleRequests(event) {
  const requestURL = new URL(event.request.url);

  if (isNetworkOnlyRequest(requestURL, event.request.method)) {
    return handleWithNetwork(event);
  }

  if (isPageRequest(requestURL) || isNetworkThenCacheRequest(requestURL, event.request.method)) {
    // To avoid serving stale content after a publish
    // always fetch the markup from origin and use cache only when the user is offline
    return handleWithNetworkThenCache(event);
  }

  return handleWithCacheThenNetwork(event);
}

self.addEventListener('fetch', handleRequests);