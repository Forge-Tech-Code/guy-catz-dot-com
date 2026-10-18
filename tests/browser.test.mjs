// Browser checks, in headless Chromium against dist/ served locally. Every
// request to another origin (maps, social embeds) is blocked, so the run never
// depends on the network and only this site's own code can fail it.
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { site, serveDist } from './lib.mjs'

let server
let browser

before(async () => {
  server = await serveDist()
  // CHROMIUM_PATH lets a machine with its own Chromium skip `playwright install`.
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
})

after(async () => {
  await browser?.close()
  await server?.close()
})

async function open(urlPath, width) {
  const page = await browser.newPage({ viewport: { width, height: 800 } })
  const problems = []
  await page.route('**/*', (route) =>
    route.request().url().startsWith(server.origin) ? route.continue() : route.abort(),
  )
  page.on('pageerror', (e) => problems.push(`uncaught: ${e.message}`))
  page.on('console', (m) => {
    // Blocked third-party requests log "Failed to load resource"; local
    // failures are caught by the response check below instead.
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push(`console: ${m.text()}`)
  })
  page.on('response', (r) => {
    if (r.url().startsWith(server.origin) && r.status() >= 400) problems.push(`${r.status()} ${r.url()}`)
  })
  await page.goto(server.origin + urlPath, { waitUntil: 'networkidle' })
  return { page, problems }
}

for (const p of site.pages) {
  describe(`browser: ${p.path}`, () => {
    test('23 loads and hydrates with no errors and no failed local requests', async () => {
      const { page, problems } = await open(p.path, 1280)
      // Scroll the whole page so lazy images and scroll-triggered code run.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 30))
        }
      })
      await page.waitForLoadState('networkidle')
      await page.close()
      assert.deepEqual(problems, [])
    })

    for (const width of [320, 390, 768, 1280]) {
      test(`24 no horizontal scroll at ${width}px`, async () => {
        const { page } = await open(p.path, width)
        // Freeze animations so a pulsing or sliding element can't make the
        // measurement depend on timing.
        await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' })
        const overflow = await page.evaluate(() => {
          const W = document.documentElement.clientWidth
          const culprits = [...document.querySelectorAll('body *')]
            .filter((el) => el.getBoundingClientRect().right > W + 1 && el.getBoundingClientRect().width > 0)
            .filter((el) => !el.closest('[class*="overflow-hidden"]'))
            .slice(0, 3)
            .map((el) => `<${el.tagName.toLowerCase()} class="${String(el.className.baseVal ?? el.className).slice(0, 60)}">`)
          return { by: document.documentElement.scrollWidth - W, culprits }
        })
        await page.close()
        assert.ok(overflow.by <= 0, `page scrolls sideways by ${overflow.by}px; widest: ${overflow.culprits.join(' ')}`)
      })
    }
  })
}
