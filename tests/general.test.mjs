// General checks that apply to any static page: SEO basics, accessibility
// basics, broken links and assets, structured data, robots and sitemap.
// What differs per site (domain, pages, languages) is in site.config.mjs.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseHTML } from 'linkedom'
import {
  site, DIST, loadPage, pageUrl, jsonLdBlocks, graphNodes, textOf, localTarget, isFile, cssFiles,
} from './lib.mjs'

const meta = (document, name) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')
const prop = (document, name) => document.querySelector(`meta[property="${name}"]`)?.getAttribute('content')

for (const page of site.pages) {
  describe(`general: ${page.path}`, () => {
    const { html, document } = loadPage(page.path)

    test('01 page is built and carries its content in the HTML', () => {
      const body = document.querySelector('body')
      assert.ok(body, 'no <body>')
      // Prerendered: the text is in the HTML, not waiting on JavaScript.
      assert.ok(textOf(body).length > 1500, `only ${textOf(body).length} characters of text in the prerendered body`)
    })

    test('02 <html lang> is set to the page language', () => {
      assert.equal(document.documentElement.getAttribute('lang'), page.lang)
    })

    test('03 charset is declared in the first 1024 bytes, with a viewport tag', () => {
      const at = html.search(/<meta charset=/i)
      assert.ok(at >= 0, 'no <meta charset>')
      assert.ok(at < 1024, `<meta charset> starts at byte ${at}; the HTML spec requires the first 1024`)
      assert.match(meta(document, 'viewport') ?? '', /width=device-width/)
    })

    test('04 exactly one <title>, between 10 and 65 characters', () => {
      const titles = document.querySelectorAll('head title')
      assert.equal(titles.length, 1, `${titles.length} <title> tags`)
      const t = textOf(titles[0])
      assert.ok(t.length >= 10 && t.length <= 65, `title is ${t.length} chars: "${t}"`)
    })

    test('05 exactly one meta description, between 50 and 165 characters', () => {
      const all = document.querySelectorAll('meta[name="description"]')
      assert.equal(all.length, 1, `${all.length} meta descriptions`)
      const d = all[0].getAttribute('content') ?? ''
      assert.ok(d.length >= 50 && d.length <= 165, `description is ${d.length} chars`)
    })

    test('06 exactly one canonical, absolute, pointing at this page', () => {
      const all = document.querySelectorAll('link[rel="canonical"]')
      assert.equal(all.length, 1, `${all.length} canonical links`)
      assert.equal(all[0].getAttribute('href'), pageUrl(page.path))
    })

    test('07 robots meta matches whether the page should be indexed', () => {
      const robots = [...document.querySelectorAll('meta[name="robots"]')].map((m) => m.getAttribute('content')).join(',')
      if (page.indexable) assert.doesNotMatch(robots, /noindex/i, 'an indexable page says noindex')
      else assert.match(robots, /noindex/i, 'a draft page is missing noindex')
    })

    test('08 exactly one non-empty <h1>', () => {
      const h1s = document.querySelectorAll('h1')
      assert.equal(h1s.length, 1, `${h1s.length} <h1> elements`)
      assert.ok(textOf(h1s[0]).length > 0, 'the <h1> is empty')
    })

    test('09 headings never skip a level', () => {
      let prev = 1
      for (const h of document.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
        const level = Number(h.tagName[1])
        assert.ok(level <= prev + 1, `<${h.tagName.toLowerCase()}> "${textOf(h).slice(0, 40)}" follows an <h${prev}>`)
        prev = level
      }
    })

    test('10 every <img> has an alt attribute, and every <iframe> a title', () => {
      for (const img of document.querySelectorAll('img')) {
        assert.ok(img.hasAttribute('alt'), `<img src="${img.getAttribute('src')}"> has no alt`)
      }
      for (const f of document.querySelectorAll('iframe')) {
        assert.ok((f.getAttribute('title') ?? '').trim(), `<iframe src="${f.getAttribute('src')}"> has no title`)
      }
    })

    test('11 no duplicate ids', () => {
      const seen = new Set()
      for (const el of document.querySelectorAll('[id]')) {
        assert.ok(!seen.has(el.id), `id="${el.id}" appears more than once`)
        seen.add(el.id)
      }
    })

    test('12 every in-page #link points at an element that exists', () => {
      for (const a of document.querySelectorAll('a[href^="#"]')) {
        const id = a.getAttribute('href').slice(1)
        if (!id) continue
        assert.ok(document.getElementById(id), `link to #${id} ("${textOf(a)}") has no target`)
      }
    })

    test('13 every local file the page references exists in the build', () => {
      const refs = []
      for (const el of document.querySelectorAll('[src], [href], [srcset], [imagesrcset]')) {
        if (el.tagName === 'A' && /^https?:/.test(el.getAttribute('href') ?? '')) continue
        for (const attr of ['src', 'href']) if (el.hasAttribute(attr)) refs.push(el.getAttribute(attr))
        for (const attr of ['srcset', 'imagesrcset']) {
          if (el.hasAttribute(attr)) refs.push(...el.getAttribute(attr).split(',').map((s) => s.trim().split(/\s+/)[0]))
        }
      }
      const missing = refs.filter((r) => {
        const target = localTarget(page.path, r)
        return target && !isFile(target)
      })
      assert.deepEqual(missing, [], `missing from dist/: ${missing.join(', ')}`)
    })

    test('14 JSON-LD parses, uses schema.org, and every @id it references is defined', () => {
      const blocks = jsonLdBlocks(document)
      assert.ok(blocks.length > 0, 'no JSON-LD on the page')
      for (const b of blocks) assert.match(b['@context'], /^https:\/\/schema\.org\/?$/)
      const nodes = graphNodes(document)
      const defined = new Set(nodes.map((n) => n['@id']).filter(Boolean))
      const refs = []
      const walk = (v) => {
        if (Array.isArray(v)) return v.forEach(walk)
        if (v && typeof v === 'object') {
          if (Object.keys(v).length === 1 && v['@id']) refs.push(v['@id'])
          else Object.values(v).forEach(walk)
        }
      }
      nodes.forEach((n) => Object.entries(n).forEach(([k, v]) => k !== '@id' && walk(v)))
      const dangling = refs.filter((r) => !defined.has(r))
      assert.deepEqual(dangling, [], `references to undefined @ids: ${dangling.join(', ')}`)
    })

    test('15 Open Graph and Twitter card are complete, and the image exists', () => {
      for (const p of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image']) {
        assert.ok(prop(document, p), `missing ${p}`)
      }
      assert.equal(prop(document, 'og:url'), pageUrl(page.path), 'og:url differs from the canonical')
      const img = prop(document, 'og:image')
      assert.ok(img.startsWith(site.origin + '/'), `og:image is not absolute on ${site.origin}: ${img}`)
      const file = path.join(DIST, decodeURIComponent(new URL(img).pathname))
      assert.ok(isFile(file), `og:image ${img} is not in the build`)
      assert.ok(meta(document, 'twitter:card'), 'missing twitter:card')
    })

    test('16 links that open a new tab carry rel="noopener"', () => {
      for (const a of document.querySelectorAll('a[target="_blank"]')) {
        assert.match(a.getAttribute('rel') ?? '', /noopener/, `${a.getAttribute('href')} opens a tab without rel="noopener"`)
      }
    })

    test('17 nothing is loaded over plain http://', () => {
      for (const el of document.querySelectorAll('[src], link[href], [srcset], iframe')) {
        const v = el.getAttribute('src') ?? el.getAttribute('href') ?? el.getAttribute('srcset') ?? ''
        assert.doesNotMatch(v, /^http:\/\//, `insecure URL: ${v}`)
      }
    })
  })
}

describe('general: site files', () => {
  const host = new URL(site.origin).host

  test('18 robots.txt allows crawling and names the sitemap', () => {
    const robots = readFileSync(path.join(DIST, 'robots.txt'), 'utf8')
    assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m, 'robots.txt disallows the whole site')
    assert.match(robots, new RegExp(`^Sitemap:\\s*${site.origin.replace(/\./g, '\\.')}/sitemap\\.xml\\s*$`, 'm'))
  })

  test('19 sitemap lists exactly the indexable pages, with valid lastmod dates', () => {
    const xml = readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8')
    const { document } = parseHTML(xml)
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).sort()
    const expected = site.pages.filter((p) => p.indexable).map((p) => pageUrl(p.path)).sort()
    assert.deepEqual(locs, expected)
    const today = new Date().toISOString().slice(0, 10)
    for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
      assert.match(m[1], /^\d{4}-\d{2}-\d{2}$/)
      assert.ok(m[1] <= today, `lastmod ${m[1]} is in the future`)
    }
    assert.ok(document, 'sitemap.xml does not parse')
  })

  test('20 CNAME holds the bare production domain', () => {
    assert.equal(readFileSync(path.join(DIST, 'CNAME'), 'utf8').trim(), host)
  })

  test('21 every url() in the built CSS points at a file that exists', () => {
    const missing = []
    for (const css of cssFiles()) {
      const text = readFileSync(css, 'utf8')
      for (const m of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
        const ref = m[1]
        // %23 is an encoded '#': a url(#id) inside an inline SVG data URI.
        if (/^(data:|https?:|#|%23)/i.test(ref)) continue
        const file = ref.startsWith('/') ? path.join(DIST, ref) : path.resolve(path.dirname(css), ref)
        if (!isFile(file.split(/[?#]/)[0])) missing.push(ref)
      }
    }
    assert.deepEqual(missing, [], `CSS references missing files: ${missing.join(', ')}`)
  })

  test('22 the 404 page is noindex and does not redirect', { skip: !site.notFoundPage && 'this site has no 404.html' }, () => {
    const { document } = parseHTML(readFileSync(path.join(DIST, '404.html'), 'utf8'))
    assert.match(document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '', /noindex/)
    assert.equal(document.querySelector('meta[http-equiv="refresh" i]'), null, 'a redirect turns the 404 into a soft 404')
  })
})
