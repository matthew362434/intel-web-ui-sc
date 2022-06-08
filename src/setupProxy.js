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
/* eslint-disable @typescript-eslint/no-var-requires */

const https = require('https');

const { createProxyMiddleware } = require('http-proxy-middleware');
const fetch = require('node-fetch');

// This proxy is used for development purposes. It allows us to develop and serve
// the UI locally on localhost while using a (possibly remote) server.
// The environment variable REACT_APP_API_PROXY determines this server while using,
// the password in the SC_AUTH_PASSWORD environment variable is used to automatically
// authenticate with the server and set an auth cookie for all requests to the server

const updateAuthCookie = (callback) => {
    return;
    // Note the password needs to be a base64 encoded string, i.e. btoa('@SCAdmin')
    const password = process.env.SC_AUTH_PASSWORD;
    const login = process.env.SC_AUTH_LOGIN;
    const body = JSON.stringify({ login, password });

    fetch(`${process.env.REACT_APP_API_PROXY}/api/user/login`, {
        method: 'POST',
        body,
        agent: new https.Agent({
            rejectUnauthorized: false,
        }),
    }).then((response) => {
        response.headers.forEach((value, key) => {
            if (key === 'set-cookie') {
                const cookie = value.substring(0, value.indexOf(';'));
                callback(cookie);
            }
        });
    });

    // Update every 5 minutes
    setTimeout(() => updateAuthCookie(callback), 5 * 60 * 1000);
};

module.exports = function (app) {
    // overwrite the auth cookies from the server
    let Cookie = '';
    updateAuthCookie((cookie) => {
        Cookie = cookie;
    });

    app.use(
        createProxyMiddleware('/api', {
            target: process.env.REACT_APP_API_PROXY,
            changeOrigin: true,
            secure: false,
            onProxyReq: (proxyRequest) => {
                proxyRequest.setHeader('Cookie', Cookie);
            },
        })
    );
};
