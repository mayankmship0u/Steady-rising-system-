/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "6b28876e95968651e03e8f7c8d6fafe0"
  }, {
    "url": "pwa-512x512.png",
    "revision": "833b09667a174f609bf7b664db8a9056"
  }, {
    "url": "pwa-192x192.png",
    "revision": "2b63265d656819903760f8316d9a7c49"
  }, {
    "url": "index.html",
    "revision": "674fc4eff9f98368f52306f678a75d82"
  }, {
    "url": "icon.svg",
    "revision": "a37502a7b9fbd6bb07da6db297f1f179"
  }, {
    "url": "favicon.ico",
    "revision": "8258c73c2efd54cc51c9dd73c6629f39"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "4399a054c30efd809ba2a95a5f2b3b7d"
  }, {
    "url": "assets/index-CKIOMaVY.js",
    "revision": null
  }, {
    "url": "assets/index-C9CweZ3S.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "4399a054c30efd809ba2a95a5f2b3b7d"
  }, {
    "url": "favicon.ico",
    "revision": "8258c73c2efd54cc51c9dd73c6629f39"
  }, {
    "url": "icon.svg",
    "revision": "a37502a7b9fbd6bb07da6db297f1f179"
  }, {
    "url": "pwa-192x192.png",
    "revision": "2b63265d656819903760f8316d9a7c49"
  }, {
    "url": "pwa-512x512.png",
    "revision": "833b09667a174f609bf7b664db8a9056"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "6b28876e95968651e03e8f7c8d6fafe0"
  }, {
    "url": "manifest.webmanifest",
    "revision": "94299cdd534efbed2c11267e49e94a38"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
