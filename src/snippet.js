// SPDX-License-Identifier: GPL-3.0-or-later
// GitHub: https://github.com/siiway/subconverter-snippet
// Only for education and study use.
// 本工具仅提供 URL 和 Clash Config 的配置文件格式转换，不存储任何信息，不提供任何代理服务，一切使用产生后果由使用者自行承担，SiiWay Team 及开发本工具的成员不负任何责任.

var REPO = 'Repo-Placeholder';
REPO = REPO === 'Repo' + '-Placeholder' ? 'siiway/subconverter-snippet' : REPO;

var BASE_URL = `https://github.com/${REPO}/releases/download/latest`;
var CORE_URL = `${BASE_URL}/converter.bundle.js`;
var HTML_URL = `${BASE_URL}/frontend.html`;

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 主页：返回 frontend.html
        if (path === '/' || path === '') {
            const htmlResp = await fetch(HTML_URL + '?v=' + Date.now());
            if (!htmlResp.ok) return new Response(`HTML load failed, code: ${htmlResp.status}`, { status: 500 });
            let html = await htmlResp.text();
            return new Response(html, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }

        // 反代 converter.bundle.js
        if (path === '/converter.bundle.js') {
            const jsResp = await fetch(CORE_URL + '?v=' + Date.now());
            if (!jsResp.ok) return new Response(`JS load failed, code: ${jsResp.status}`, { status: 500 });
            return new Response(jsResp.body, {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }

        // API: /to-clash
        if (path === '/to-clash' && request.method === 'POST') {
            const { links } = await request.json();
            const coreResp = await fetch(CORE_URL + '?v=' + Date.now());
            if (!coreResp.ok) return new Response(`Core load failed, code: ${coreResp.status}`, { status: 500 });
            const code = await coreResp.text();
            const core = new Function(code + '; return { linkToClash };')();
            return new Response(core.linkToClash(links), {
                headers: { 'Content-Type': 'text/yaml', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // API: /to-link
        if (path === '/to-link' && request.method === 'POST') {
            const yaml = await request.text();
            const coreResp = await fetch(CORE_URL + '?v=' + Date.now());
            if (!coreResp.ok) return new Response(`Core load failed, code: ${coreResp.status}`, { status: 500 });
            const code = await coreResp.text();
            const core = new Function(code + '; return { clashToLink };')();
            return new Response(core.clashToLink(yaml), {
                headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
            });
        }

        return new Response('Not Found', { status: 404 });
    }
};