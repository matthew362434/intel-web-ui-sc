// INTEL CONFIDENTIAL
//
// Copyright (C) 2021 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

/// <reference lib="webworker" />

/*
  For more info about these packages visit https://developers.google.com/web/tools/workbox/modules
*/
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// @ts-expect-error temporarily ignore this warning for debugging purposes
// eslint-disable-next-line no-underscore-dangle
const manifest = self.__WB_MANIFEST;

const staticAssets = (manifest as { url: string }[]).map(({ url }) => url);
const filesToCache = ['/assets/opencv/4.5.5/opencv.js', ...staticAssets];
const staticCacheName = 'assets-cache-v1';

// Upon SW instalation, cache all files from `filesToCache`
self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', async (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(staticCacheName).then((cache) =>
            cache.keys().then((cacheKeys) =>
                Promise.all(
                    cacheKeys.map((request) => {
                        const url = new URL(request.url);

                        if (!filesToCache.includes(url.pathname)) {
                            return cache.delete(request);
                        }
                        return Promise.resolve(true);
                    })
                )
            )
        )
    );
});

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event: FetchEvent) => {
    // workerFetch means to a request within the web worker with self.importScripts(...)
    if (isValidStaticFileOrWorkerFetch(event.request)) {
        event.respondWith(fromCacheOrFetch(event));
    }
});

const fromCacheOrFetch = (event: FetchEvent) =>
    caches.match(event.request, { ignoreSearch: true }).then((cacheResponse) => {
        return cacheResponse || fetchAndCatchWebWorker(event);
    });

const fetchAndCatchWebWorker = (event: FetchEvent) =>
    fetch(event.request).then((fetchResponse) => {
        return caches.open(staticCacheName).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
        });
    });

const isValidStaticFileOrWorkerFetch = (request: Request) =>
    isValidHttpRequest(request) && isStaticFileOrWorkerFetch(request);

const isValidHttpRequest = (request: Request) => {
    const { protocol } = new URL(request.url);
    return protocol.startsWith('http');
};

const isStaticFileOrWorkerFetch = (request: Request) =>
    /\.(js|css|svg|html)$/.test(request.url) || /\.worker.js$/.test(request.referrer);
