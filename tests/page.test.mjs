// Checks specific to the Healing Path page. Most of them hold a rule from
// CLAUDE.md in place, so a change that breaks one fails here first.
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { loadPage, nodeOfType, graphNodes, typesOf, textOf, norm, cssFiles, serveDist } from './lib.mjs'
import { site as info } from '../src/siteInfo.js'
import { palette } from '../src/palette.js'

const { document, html } = loadPage('/')
const pageText = norm(textOf(document.body))
const sectionText = (id) => norm(textOf(document.getElementById(id)))
const bandOf = (el) => (el.getAttribute('class') ?? '').match(/\bbg-(fern|mist)\b/)?.[1] ?? null

describe('page: Healing Path', () => {
  test('P01 every section the menu, footer and CLAUDE.md name exists', () => {
    const ids = ['home', 'glance', 'about', 'approach', 'services', 'practice', 'reviews', 'faq', 'rates', 'cancellation', 'book', 'message', 'contact']
    const missing = ids.filter((id) => !document.getElementById(id))
    assert.deepEqual(missing, [])
  })

  test('P02 the menu links to the right sections, and #practice is the one headed "The Practice"', () => {
    const nav = document.querySelector('header nav') ?? document.querySelector('nav')
    const hrefs = [...nav.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    for (const h of ['#practice', '#about', '#approach', '#services', '#rates', '#faq', '#reviews']) {
      assert.ok(hrefs.includes(h), `menu has no link to ${h}`)
    }
    assert.equal(norm(textOf(document.querySelector('#practice h2'))), 'The Practice')
  })

  test('P03 every band is fern or mist — two backgrounds, no third — opening and closing on fern', () => {
    const bands = [...document.querySelectorAll('main > section, main > div > section, footer')]
    for (const el of bands) {
      assert.ok(bandOf(el), `<${el.tagName.toLowerCase()} id="${el.id}"> is neither bg-fern nor bg-mist`)
    }
    assert.equal(bandOf(document.getElementById('home')), 'fern')
    assert.equal(bandOf(document.querySelector('footer')), 'fern')
    assert.equal(document.querySelectorAll('[class*="bg-white"]').length, 0, 'a bg-white element')
  })

  test('P04 the colour only changes at a divider, and every divider matches the bands either side', () => {
    const hex = Object.fromEntries(Object.entries(palette).map(([k, v]) => [v.toLowerCase(), k]))
    const seq = [...document.querySelector('main').children, document.querySelector('footer')]
    let prev = null
    let pendingDivider = null
    for (const el of seq) {
      const style = el.getAttribute('style') ?? ''
      const bg = style.match(/background:\s*(#[0-9a-f]{6})/i)?.[1]
      if (el.getAttribute('aria-hidden') === 'true' && bg) {
        const fill = el.querySelector('path')?.getAttribute('fill')
        pendingDivider = { from: hex[bg.toLowerCase()], to: hex[fill?.toLowerCase()] }
        assert.equal(pendingDivider.from, prev, `a divider paints from ${pendingDivider.from} over a ${prev} band`)
        continue
      }
      const band = bandOf(el) ?? bandOf(el.querySelector('section') ?? el)
      if (!band) continue
      if (pendingDivider) {
        assert.equal(pendingDivider.to, band, `a divider fills ${pendingDivider.to} into a ${band} band (#${el.id})`)
        assert.notEqual(band, prev, `a divider joins two ${band} bands`)
      } else if (prev) {
        assert.equal(band, prev, `#${el.id} switches from ${prev} to ${band} with no divider`)
      }
      prev = band
      pendingDivider = null
    }
  })

  test('P05 nothing in the built CSS is white (Tailwind\'s unused ring default aside)', () => {
    for (const file of cssFiles()) {
      const css = readFileSync(file, 'utf8').replace(/--tw-ring-offset-color:\s*#fff/g, '')
      assert.doesNotMatch(css, /#fff\b|#ffffff|255,\s*255,\s*255|255 255 255|:\s*white\b/i, `${file} contains white`)
    }
  })

  test('P06 no font weight outside the trimmed 300–500 range', () => {
    for (const file of cssFiles()) {
      for (const m of readFileSync(file, 'utf8').matchAll(/font-weight:\s*(\d+)/g)) {
        const w = Number(m[1])
        assert.ok(w >= 300 && w <= 500, `font-weight:${w} — the font files only carry 300–500`)
      }
    }
    assert.equal(document.querySelectorAll('b, strong').length, 0, '<b>/<strong> would ask for a bold the fonts do not have')
  })

  test('P07 the insurance wording is identical in Rates, the FAQ and the FAQPage JSON-LD', () => {
    const faq = nodeOfType(document, 'FAQPage')
    const answer = faq.mainEntity.find((q) => /insurance/i.test(q.name)).acceptedAnswer.text
    assert.match(answer, /^We currently do not accept insurance/)
    assert.match(answer, /superbills that you may submit to your PPO/)
    assert.ok(sectionText('rates').includes(norm(answer)), 'Rates does not carry the same insurance paragraph')
    assert.ok(sectionText('faq').includes(norm(answer)), 'the FAQ does not carry the same insurance answer')
  })

  test('P08 every FAQPage question and answer is on the page, in the prerendered HTML', () => {
    const faq = nodeOfType(document, 'FAQPage')
    const visibleQs = [...document.querySelectorAll('#faq button')].map((b) => norm(textOf(b)))
    assert.equal(faq.mainEntity.length, visibleQs.length, 'JSON-LD and the page have different numbers of questions')
    for (const q of faq.mainEntity) {
      assert.ok(visibleQs.includes(norm(q.name)), `question not on the page: ${q.name}`)
      assert.ok(sectionText('faq').includes(norm(q.acceptedAnswer.text)), `answer not in the HTML: ${q.name}`)
    }
  })

  test('P09 every price in the JSON-LD offers matches the Rates list', () => {
    const offers = graphNodes(document).flatMap((n) => [].concat(n.offers ?? [])).filter((o) => o.name && o.price)
    assert.ok(offers.length >= 4, 'expected the per-session offers in the JSON-LD')
    const rows = [...document.querySelectorAll('#rates .divide-y > div')].map((r) => norm(textOf(r)))
    for (const o of offers) {
      const row = rows.find((r) => r.startsWith(o.name))
      assert.ok(row, `no "${o.name}" row in Rates`)
      assert.ok(row.endsWith(`$${Number(o.price).toLocaleString('en-US')}`), `"${o.name}" is $${o.price} in the JSON-LD but "${row}" on the page`)
    }
  })

  test('P10 phone, email and address agree between siteInfo.js, the page and the JSON-LD', () => {
    const biz = nodeOfType(document, 'PhysicalTherapy')
    assert.equal(`tel:${biz.telephone}`, info.phoneHref)
    assert.equal(biz.email, info.email)
    assert.equal(biz.address.streetAddress, info.address)
    assert.ok(document.querySelector(`a[href="${info.phoneHref}"]`), 'no call link')
    assert.ok(document.querySelector(`a[href="${info.emailHref}"]`), 'no email link')
    assert.ok(pageText.includes(info.phone) && pageText.includes(info.address), 'phone or address not shown')
  })

  test('P11 opening hours agree between siteInfo.js, the page and the JSON-LD', () => {
    assert.ok(pageText.includes(norm(info.hours)), `"${info.hours}" not on the page`)
    const spec = nodeOfType(document, 'PhysicalTherapy').openingHoursSpecification
    assert.deepEqual(spec.map((s) => [s.dayOfWeek, s.opens, s.closes]), [[['Monday', 'Tuesday', 'Wednesday', 'Thursday'], '08:00', '18:00']])
  })

  test('P12 every specialty in "Experienced in" is in the JSON-LD availableService', () => {
    const specialties = {
      Neurological: 'Neurological rehabilitation', Orthopedic: 'Orthopedic physical therapy',
      Cardiopulmonary: 'Cardiopulmonary rehabilitation', Geriatric: 'Geriatric physical therapy',
      Sports: 'Sports physical therapy', Vestibular: 'Vestibular rehabilitation',
      Oncological: 'Oncological rehabilitation', 'Complex medical': 'Complex medical rehabilitation',
    }
    const offered = nodeOfType(document, 'PhysicalTherapy').availableService.map((s) => s.name)
    for (const [label, full] of Object.entries(specialties)) {
      assert.ok(sectionText('services').includes(label), `"${label}" is not in Services`)
      assert.ok(offered.includes(full), `"${full}" is not in availableService`)
    }
  })

  test('P13 the JSON-LD makes no claim CLAUDE.md rules out (self-reviews, geo, payment)', () => {
    for (const n of graphNodes(document)) {
      assert.ok(!typesOf(n).includes('Review'), 'a Review node')
      for (const key of ['aggregateRating', 'review', 'geo', 'paymentAccepted']) {
        assert.ok(!(key in n), `${typesOf(n).join('/')} carries ${key}`)
      }
    }
  })

  test('P14 the contact form has the agreed fields, a honeypot, and nothing medical', () => {
    const form = document.querySelector('#message form') ?? document.querySelector('form')
    assert.ok(form, 'no contact form')
    const field = (name) => form.querySelector(`[name="${name}"]`)
    for (const name of ['name', 'email', 'concern', 'preferred']) {
      assert.ok(field(name)?.hasAttribute('required'), `"${name}" is missing or not required`)
    }
    assert.ok(field('phone'), 'no phone field')
    const heard = [...form.querySelectorAll('[name="heard"]')].map((i) => i.getAttribute('value'))
    assert.deepEqual(heard, ['Friend/Relative', 'Google', 'Social Media', 'Yelp'])
    assert.ok(field('botcheck'), 'no honeypot')
    assert.match(info.web3formsKey, /^[0-9a-f-]{36}$/, 'the Web3Forms key is not set — every message would fail')
    const names = [...form.querySelectorAll('[name]')].map((i) => i.getAttribute('name').toLowerCase()).join(' ')
    assert.doesNotMatch(names, /birth|dob|insurance|medication|diagnos|history|ssn/, 'a medical-intake field — see CLAUDE.md before adding one')
  })

  test('P15 every asset path is relative, so the build works under a sub-path', () => {
    const absolute = [...html.matchAll(/\s(?:src|href)="(\/[^/][^"]*)"/g)].map((m) => m[1])
    assert.deepEqual(absolute, [], 'root-relative paths 404 on the github.io fallback URL')
  })

  test('P16 the social profiles in siteInfo.js are linked in the footer and listed in sameAs', () => {
    const profiles = [info.instagram, info.yelp, info.linkedin].filter(Boolean)
    const sameAs = nodeOfType(document, 'PhysicalTherapy').sameAs
    assert.deepEqual([...sameAs].sort(), [...profiles].sort())
    for (const url of profiles) assert.ok(document.querySelector(`footer a[href="${url}"]`), `${url} is not in the footer`)
  })
})

describe('page: Healing Path in the browser', () => {
  let server
  let browser
  before(async () => {
    server = await serveDist()
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  })
  after(async () => {
    await browser?.close()
    await server?.close()
  })

  test('P17 a FAQ question opens and closes its answer', async () => {
    const page = await browser.newPage()
    await page.route('**/*', (r) => (r.request().url().startsWith(server.origin) ? r.continue() : r.abort()))
    await page.goto(server.origin + '/', { waitUntil: 'networkidle' })
    const button = page.locator('#faq button').first()
    const answer = page.locator('#faq-answer-0')
    await assert.doesNotReject(answer.waitFor({ state: 'hidden' }))
    await button.click()
    await answer.waitFor({ state: 'visible' })
    assert.equal(await button.getAttribute('aria-expanded'), 'true')
    await button.click()
    await answer.waitFor({ state: 'hidden' })
    await page.close()
  })
})
