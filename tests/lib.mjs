// Shared helpers for the test suite. The tests run against the BUILT site in
// dist/ — run `npm run build` first (CI does) — because that prerendered HTML
// is exactly what crawlers and visitors receive.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { parseHTML } from 'linkedom'
import { site } from './site.config.mjs'

export { site }
export const DIST = path.resolve('dist')

if (!existsSync(path.join(DIST, 'index.html'))) {
  throw new Error('dist/index.html not found — run `npm run build` before `npm test`.')
}

/** Path of a page's built file, e.g. '/hr/' -> dist/hr/index.html */
export const pageFile = (urlPath) => path.join(DIST, urlPath, 'index.html')

/** Absolute production URL of a page, e.g. https://example.com/hr/ */
export const pageUrl = (urlPath) => `${site.origin}${urlPath}`

const cache = new Map()

/** The built page parsed into a DOM: { html, document } */
export function loadPage(urlPath) {
  if (!cache.has(urlPath)) {
    const html = readFileSync(pageFile(urlPath), 'utf8')
    const { document } = parseHTML(html)
    cache.set(urlPath, { html, document })
  }
  return cache.get(urlPath)
}

/** Every JSON-LD block on the page, parsed. Throws on invalid JSON. */
export function jsonLdBlocks(document) {
  return [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent))
}

/** Every node of every JSON-LD graph on the page, flattened. */
export function graphNodes(document) {
  return jsonLdBlocks(document).flatMap((block) => block['@graph'] ?? [block])
}

export const typesOf = (node) => [].concat(node?.['@type'] ?? [])

/** First graph node carrying the given @type. */
export const nodeOfType = (document, type) => graphNodes(document).find((n) => typesOf(n).includes(type))

/** Visible-ish text of an element: tags stripped, whitespace collapsed. */
export const textOf = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()

/** Collapse whitespace and strip soft hyphens, for comparing copy. */
export const norm = (s) => String(s).replace(/­/g, '').replace(/\s+/g, ' ').trim()

/**
 * Resolve a reference made from a page to a file in dist/, or null when the
 * reference is external (another origin, mailto:, tel:, data:, javascript:).
 */
export function localTarget(fromUrlPath, ref) {
  if (!ref || /^(mailto:|tel:|data:|javascript:|#)/i.test(ref)) return null
  const base = 'http://local.test'
  const u = new URL(ref, base + fromUrlPath)
  if (u.origin !== base) return null
  let p = decodeURIComponent(u.pathname)
  if (p.endsWith('/')) p += 'index.html'
  return path.join(DIST, p)
}

export const isFile = (p) => existsSync(p) && statSync(p).isFile()

/** Every built CSS file. */
export function cssFiles() {
  const dir = path.join(DIST, 'assets')
  return readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => path.join(dir, f))
}

/** Serve dist/ on a random local port, for the browser tests. */
export function serveDist() {
  const types = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain',
    '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
  }
  const server = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    if (p.endsWith('/')) p += 'index.html'
    const file = path.join(DIST, p)
    if (!file.startsWith(DIST) || !isFile(file)) {
      res.writeHead(404).end('not found')
      return
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ origin: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) })
    })
  })
}
