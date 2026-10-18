# Healing Path Rehabilitation — Claude Code Guide

## What this project is

Static marketing website for **Healing Path Rehabilitation** — the practice of Guy H. Catz, PT, DPT, in Los Angeles. One-on-one physical therapy delivered three ways: in the patient's home, at the West Los Angeles office, or by telehealth. Single-page scroll. No backend, no router, no database. Builds to `dist/` and deploys to GitHub Pages via GitHub Actions.

The domain is `guycatz.com`; the practice name is Healing Path Rehabilitation. The wordmark reads "Healing Path" — don't "correct" it to the doctor's name.

The stack is borrowed from the `veli-bol-home` site; the design language is not. Where that site is a photo-led travel page built from hard-edged alternating slabs, this one is built from exactly **two background colours** — a deep blue-green and a cool light blue — alternating in bands joined by curved seams. See "Bands and seams" below before adding anything.

> **The words are the client's, and so are the contact details and prices now.** Bio, approach, services and testimonials are real copy supplied by the practice — keep testimonials verbatim. Phone, email, the office address, the opening hours and every rate but the telehealth treatment session are confirmed. See "What's placeholder" at the bottom.

## Commands

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve dist/ locally
```

## Tests

```bash
npm run build && npm test   # the tests read the BUILT site, so build first
```

`.github/workflows/ci.yml` runs exactly that on every pull request (and on pushes to `main`), as the
**Build and test** check — the one to make required for merging. Plain `node --test`, no framework:

| file | what it checks |
|---|---|
| `tests/general.test.mjs` | the same on every site: title, description, canonical, robots, `lang`, one `h1`, heading order, alt text, duplicate ids, dead `#links`, every local file the HTML or CSS references exists, JSON-LD parses and its `@id`s resolve, Open Graph, `noopener`, robots.txt, sitemap, CNAME, 404 |
| `tests/browser.test.mjs` | headless Chromium: the page hydrates with no console errors or failed requests, and never scrolls sideways at 320 / 390 / 768 / 1280px |
| `tests/page.test.mjs` | this site's own rules, most of them from this file — see the test names |
| `tests/site.config.mjs` | the only per-site input to the two shared files: origin, pages, languages |
| `tests/lib.mjs` | helpers: load a built page as a DOM (`linkedom`), read JSON-LD, serve `dist/` |

The browser tests block every request to another origin, so they never depend on the network. Locally,
`CHROMIUM_PATH=/path/to/chromium npm test` uses an existing Chromium instead of `npx playwright install
chromium`.

**When a test fails, fix the page, not the test** — unless the rule itself changed, in which case change
the test and this file in the same commit.

Two fixes came out of writing them: the FAQ answers are now always in the HTML (hidden while closed, rather than not rendered), so the `FAQPage` JSON-LD describes text that is really on the page; and `.btn-primary-light` no longer hovers to `white/95` — it steps down to `mist` (fern text 5.5:1). P05 fails if white comes back.

## Stack

- **React 18** — UI
- **Vite 5** — build tool, `base: './'` in `vite.config.js` (relative, so the build runs from any mount point)
- **vite-react-ssg** — prerenders the page to static HTML at build time (pinned to `0.9.1`; `0.9.2+` requires Vite 6)
- **Tailwind CSS 3** — styling via utility classes + component layer in `src/index.css`
- **No router** — single HTML page, anchor links (`#practice`, `#about`, etc.)

## Project layout

```
src/
  siteInfo.js        single source of truth for phone / email / address / hours
  palette.js         band colours as hex — <Divider> needs real colour strings
  components/
    Navbar.jsx       floating translucent pill, fixed at the top from the first
                     pixel; Services carries a Rates/FAQ submenu
    Footer.jsx       practice summary / explore links / contact
    Divider.jsx      the curved seam between two colour bands
    Reveal.jsx       scroll-triggered fade-and-rise wrapper
    Photo.jsx        image slot — <img>, or a "photo coming soon" placeholder when src is falsy
    ContactForm.jsx  the message form in BookingCTA, sent through Web3Forms —
                     see "The contact form" below
  sections/          one file per visible scroll section, assembled in App.jsx
    Hero.jsx         a flat `fern` band — no photo, no gradient, light-on-dark;
                     carries the recoloured logo mark; laid out mobile-first —
                     see "Mobile" and "The logo" below
    Practice.jsx     hairline fact row (#glance) — the rates moved out, and so
                     did the #practice anchor: see "Section IDs" below
    About.jsx        "Meet Our Doctor" — portrait + his bio, verbatim (`paragraphs`);
                     a `fern` band, so light-on-dark
    Approach.jsx     the Healing Path Approach, verbatim (`paragraphs`)
    Services.jsx     `settings` (the three care settings, verbatim) +
                     `experience` (8 rehab specialties) + `provided` (what a plan involves)
    Gallery.jsx      masonry grid of the practice — `photos` array
    Reviews.jsx      real patient testimonials — `featured` + `reviews` +
                     `moreReviews` —
                     closing on the Care Hero certificate photo, with the
                     `award` text as its screen-reader transcript
    FAQ.jsx          accordion — `faqs` array (uses useState per item)
    Rates.jsx        the price list + the insurance note (#rates), at the foot
                     of the page — reached from the menu as Services → Rates
    Cancellation.jsx the cancellation & no-show policy (#cancellation),
                     verbatim client copy, directly after the rates
    BookingCTA.jsx   closing call-to-action + map (#book), and the message
                     form under them (#message)
  App.jsx            orders the sections and places the dividers between bands
  main.jsx           ViteReactSSG entry; App adds `.reveal-ready` on mount
  index.css          @font-face, base layer, component classes
public/
  fonts/             self-hosted Fraunces + DM Sans (latin subset, woff2)
  images/            photography, plus the logo mark and lock-up
  favicon.svg        the icon master
  favicon-32.png     the four PNGs are derived from favicon.svg by
  apple-touch-icon.png   scripts/build-icons.py — don't hand-edit them
  icon-192.png
  icon-512.png
  site.webmanifest   name, theme colour and the two manifest icons
  404.html           self-contained, noindex; see "The 404 page" below
  CNAME              guycatz.com — what points GitHub Pages at the domain
  robots.txt
  sitemap.xml
brand/
  healing-path-logo.jpg   the logo as the practice supplied it — the master
scripts/
  build-logo-mark.py      derives everything the site ships from that master
  build-icons.py          rasterises favicon.svg into the PNG icon set
  trim-fonts.py           cuts the font files down to the axes actually used
.github/
  workflows/
    deploy.yml       push to main → npm ci → npm run build → GitHub Pages
```

## Bands and seams

**This is the part that makes the page feel calm — don't undo it by accident.**

The page is not eleven alternating light/dark slabs. It is **eight colour bands** plus the footer, joined by **curved dividers**. Sections inside a band share a background and simply continue into each other with no rule, no border, and no colour change.

**There are two background colours on this page and there is no third.** The
client's instruction was literal — *"I only want to see two background colors
on the whole page"* — after pointing at the Services band and saying *"when I
said blue, I meant like the services section"*. So `fern` is that blue-green,
`mist` is its light companion, and every band is one or the other, strictly
alternating.

| Band | Sections | Background |
|---|---|---|
| A | Hero | `fern` |
| B | Practice | `mist` |
| C | About | `fern` |
| D | Approach | `mist` |
| E | Services | `fern` |
| F | Gallery | `mist` |
| G | Reviews | `fern` |
| H | FAQ, Rates, Cancellation, BookingCTA | `mist` |
| — | Footer | `fern` |

One section per band, apart from the closing four — the colour changes at
every seam. Rates sits inside that closing band deliberately: the client asked
for the price list to come only after everything else has been read, and
`.btn-primary` needs the light ground anyway. The cancellation policy follows
the rates for the same reason it is worded the way it is: its fee is "the full
session value fee", which only means something once the session values are on
screen.

**`cream` is never a band background.** It is the surface tone — cards, the
navbar pill, ghost buttons, light photo placeholders — and nothing else. An
earlier draft gave About a `cream` band, and the client's note was that it and
Reviews *"look so bright, why??"*: they were the two lightest areas on the
page. If a section needs to feel different, the alternation already does that;
don't reach for a third background.

### What decides which sections can be dark

**The terracotta button.** `.btn-primary` on `fern` sits at **1.4:1** — the pill
all but vanishes, and no shade of terracotta both separates from `fern` and
carries `cream` text at AA. Any section with a primary CTA (Practice,
BookingCTA) therefore stays on `mist`. The Hero is dark and uses
`.btn-primary-light`, the cream inversion, instead. This is the one hard
constraint on the alternation.

**Long-form copy is not a constraint — the client decided that.** An earlier
pass kept his bio and the Approach on `mist`, on the reasoning that seven
paragraphs of light-on-dark is a readability cost worth avoiding. He asked for
Meet Our Doctor on the dark band anyway, so that is where it is. The cost is
paid down with type rather than colour: a `62ch` measure, `1.85` line height,
`cream` for the serif opening paragraph and `cream/80` for the body. If the
Approach ever moves to `fern` too, do the same there — and note that the two of
them can never both be dark while alternation holds, since they are neighbours.

A dark section also needs its light-on-dark variants throughout —
`.label-light`, `.section-heading-light`, `text-cream`, `text-cream/80` for
body, `.soft-card-dark`, and `ochre` (not `fern`) for any emphasis, since a
fern `<em>` on a fern ground is invisible. Hero, Services and Reviews are the
worked examples.

The seams are placed in `App.jsx`:

```jsx
<Divider from="fern" to="mist" shape="dune" />
```

`from` **must** match the background of the section above and `to` the section below — the SVG paints `to` over a `from` background, so a mismatch shows as a hard line. Four shapes exist in `Divider.jsx` (`dune`, `bowl`, `crest`, `ripple`), deliberately gentle; steep waves read as energetic, which is the opposite of the brief. **Reordering or inserting a section means re-pairing every divider below it.**

### The logo

The practice supplied its logo as a JPEG of the full lock-up — the emblem over
a "HEALING PATH REHABILITATION" wordmark — drawn navy-and-green on white. It is
in `brand/healing-path-logo.jpg`, and **nothing on the page uses it as-is**.
`scripts/build-logo-mark.py` derives what the site actually ships:

| Output | Where |
|---|---|
| `healing-path-mark-{200,340,680}.webp` | the emblem, recoloured for `fern`, in the Hero |
| `healing-path-logo-1200.webp` | the untouched lock-up, the `logo` in the JSON-LD |

Two things were changed on the way in, and both are the page's rules rather
than taste:

- **The wordmark is dropped from the page.** "Healing Path" is already set in
  Fraunces in the navbar and the practice name is in the hero label; shipping
  it again as raster type would say it a third time, in a font that is not
  this page's
- **The colours are remapped.** The logo's navy is 1.3:1 against `fern` —
  invisible — and its navy/green/slate would have been a third, fourth and
  fifth colour on a page that has two. So the cool artwork becomes `cream`, the
  greens become `ochre`, and the white ground becomes transparency. Those are
  the same two inks every other dark band uses, which is why the mark sits on
  the Hero as if it had been drawn for it

The recolour is a per-pixel remap, not a trace: alpha comes from each pixel's
distance from white (so the winding path and the snow on the peaks read as
`fern` showing through), and the cream/ochre split comes from `g - b`. That
discriminant is blurred before it is thresholded — the deep forest green in the
bottom right sits within a few counts of the slate, and classified pixel by
pixel the seam between them comes out as ochre/cream confetti. If you re-run
the script against a new source and see speckle, that blur radius is the knob.

**A vector original would be worth asking for.** What is here is traced out of
a JPEG: fine at the sizes the page uses, not fine on a business card.

The lock-up's own tagline — *"Restore movement. Restore life."* — is real
copy, so it is now `site.tagline` (it replaced an invented one that nothing
rendered) and it sits under the footer wordmark.

### Heading pairs — the name leads, the phrase follows

Sections used to open with a small spaced-caps `.label` over a large
`.section-heading`, which put the *description* at display size and the
section's own name in 11px capitals. The client asked for that reversed
everywhere he saw it: "Testimonials" over "In their words", "The Practice" over
"Where the work happens", "FAQ" over "Good to know", "Meet Our Doctor" over his
name and credentials. So the pattern is now:

```jsx
<h2 className="section-heading mb-3">The Practice</h2>
<p className="section-sub mb-6">Where the work happens</p>
```

The `h2` carries the section's name — which is also what the menu and the
footer call it — and `.section-sub` sets the phrase beneath it in the same
serif, around `1.35rem`. `.label` is still right for a small heading *inside* a
section ("Experienced in", "What that involves", "Book a session"); it is no
longer how a section introduces itself.

The Hero follows the same instruction: the practice name is the largest thing
on the page and "Recovery is more than healing an injury" sits under it at
roughly half the size it used to be.

### The client's own copy — do not rearrange it

`Approach.jsx` and `About.jsx` each render a `paragraphs` array that is the
client's writing, verbatim and in his order. He asked for these two sections
specifically after an earlier draft split them up:

> *"I don't like how the AI kind of spliced up what I wrote and even took bits
> out of paragraphs and put it elsewhere. It takes away from the cohesiveness…
> I did it with the intention that it would all kind of stay together."*

`Cancellation.jsx` is his writing too — the policy, its headings and its
closing line came from him whole, so it gets the same treatment. So is the
`settings` array in `Services.jsx` — the Home Health / In Office / Telehealth
descriptions and their lists, from his website-edits document — and the
trauma-informed FAQ answer. He is adamant that his wording is used as written.
The only liberty taken: his `–` dashes, which he typed with no space before
(`operation– guiding`), are set with a space either side.

**His edits are additive.** When a new document adds detail, it goes in
alongside what is there — it does not replace it. That is why Services carries
both his three care settings *and* the older "Experienced in" grid and "What
that involves" list, and why Cardiopulmonary and Complex medical stay in the
grid even though the new breakdown does not expand on them. Don't drop
something just because he didn't elaborate on it.

So: **never** break these paragraphs across cards, pull a sentence out for a
heading or pull-quote, move one into another section, or lift the closing
education paragraph into a credentials grid — it belongs at the end of Meet Our
Doctor as a paragraph, which is where professionals put it. Readability here
comes from typography — measure, spacing, a larger opening paragraph — not from
chopping the text up. Same goes for the testimonials in `Reviews.jsx`.

### Nothing invented — the rule that removed two whole sections

The client reviewed every line and cut both sections that were written *for*
him rather than *by* him: "Ways to work together" (the three care settings) and
"How it works" (a four-step intake timeline). His notes were *"Drop it. I don't
want things off the script"* and *"Again, drop this. Nothing made up."* A
"Free 15-minute consult" offer went the same way — he had never offered one.

So before adding any section, sentence or figure: it comes from him, or it does
not go on the site. Plausible is not the standard. Where a detail is genuinely
unsettled he would rather the page said **"contact for details"** than carried
a number nobody has agreed to — that is what the packages and travel rows do.

### Voice — plain, not clever

The client's second note was about the writing *around* his copy:

> *"Our tone is relaxing, healing and caring. Stop using Claude like language
> where you try to be too 'catch line-y'."*

So the site's own words — headings, subtitles, FAQ answers, the small print
under a fact — are written the way you would say them to a patient, and nothing
is written to land a line. What that ruled out, and what replaced it:

| Cut | Now reads |
|---|---|
| "the whole session, every session" | "you have my full attention" |
| "Out-of-network" / "no insurance-driven limits" | "Without insurance" / "paid at the time of the visit" |
| "Simple and transparent" (rates heading) | "What a session costs" |
| "no queue, no televisions, and no one else booked over the top of your hour" | "wherever you are most comfortable moving" |
| "the aim is for you to need me less, not longer" | "and it is revisited as you go" |
| "Breathe" over the scroll hint | the hairline alone, no caption |

Two tests before a sentence goes in: could he say it out loud to a patient
without wincing, and does it tell them something true rather than sell them
the idea of it? Note that the "televisions" line also broke the
nothing-invented rule — the punchy sentences are usually the invented ones.

**Insurance wording:** the client gave the sentence himself — **"We currently
do not accept insurance"** — and it is set that way in both places it appears,
followed by the same explanation, verbatim: payment is due at the time of the
visit, and *"this ensures significantly less wait time for appointments, and
you will receive direct one-on-one care guided by your goals rather than what
your plan covers."* It now closes on his superbill sentence, also verbatim:
*"We can provide superbills that you may submit to your PPO for out-of-network
coverage and possible reimbursement."* Rates.jsx and the FAQ answer carry the
identical wording; change one and change the other, plus the `FAQPage` JSON-LD
in `index.html`. That sentence is the **one** billing specific the practice has
confirmed — he supplied it — so it stays; "private pay" and "cash-based" are
still industry hedges a patient shouldn't have to decode, and HSA/FSA wording
remains unconfirmed and off the page. "Does not bill insurance" was the earlier
phrasing and he replaced it.

Rules of thumb for anything new:

- No `border-t` between sections, and no full-width horizontal rules except the deliberate hairline inside Practice
- Cards are borderless: `.soft-card` (soft shadow, no outline), never a 1px box
- **Nothing on this page is white.** No `bg-white`, no `#fff`, no white-tinted overlay. A raised surface is `cream` — the lightest band tone — and it separates itself with a shadow, not by being brighter than the palette allows
- Section padding is generous — `py-24 sm:py-32`, or `pt-8 pb-24 sm:pb-32` for the second section in a band
- Wrap each block in `<Reveal>` so it rises into view

### Mobile

Design the phone layout first; the wide one is the variation. What that means
here, and what the second pass fixed:

- **One left edge.** Label, heading, body, buttons and lists all start on the
  same margin at every width. Nothing centres on mobile and left-aligns on
  desktop
- **Buttons stack full width** below `sm` (`w-full sm:w-auto`) — two pills of
  different widths on one row is the ragged look this page is trying to avoid
- **No hard line breaks below `sm`.** The hero's `<br>` is `hidden sm:block`;
  the heading wraps on its own, with `text-balance` keeping the lines even
- **Rows become stacks.** The Practice fact row is stacked with a hairline
  *above* each item on a phone, two columns at `sm`, four with a hairline to the
  *left* at `lg`. The Gallery is one column below `sm` — two columns of 155px
  photos is not showing anyone the work
- **Viewport units are `svh`, not `vh`,** anywhere a section is sized to the
  screen. `100vh` on a phone is taller than the screen until the address bar
  collapses, which pushes the call-to-action out of reach
- Check 320px as well as 390px, and check that
  `document.documentElement.scrollWidth` still equals `clientWidth` — one
  overflowing element gives the whole page a horizontal scroll

## Design tokens (tailwind.config.js)

Two backgrounds, one surface, and a small set of type and accent colours.
Everything is cool except terracotta and ochre, which are the only warm things
on the site and all the louder for it.

**The two backgrounds**

| Token | Value | Used for |
|---|---|---|
| `fern` | `#3C4F49` | the dark band — Hero, About, Services, Reviews, Footer |
| `mist` | `#C4D0D5` | the light band — everything else |

They sit 5.5:1 apart, so the alternation is unmistakable. Adding a third
background is the one change this design does not survive; if a section needs
to feel different, move it to the other colour.

**Everything else**

| Token | Value | Used for |
|---|---|---|
| `cream` | `#E1E8EA` | the surface tone: `.soft-card`, the navbar pill, ghost buttons, `.btn-primary-light`, light photo placeholders. Also the text colour on `fern`. **Never a background** |
| `fern-light` | `#485C55` | dark photo placeholders only |
| `sage` | `#9FB3AC` | quiet accent, selection colour |
| `sage-deep` | `#6B8279` | list bullets on light |
| `terracotta` | `#94512F` | primary buttons **on `mist` only** — carries `cream` text at AA, but sits at 1.4:1 on `fern` |
| `terracotta-light` | `#C08262` | small dots and marks, never text |
| `terracotta-deep` | `#7A4023` | label text on light, and the button hover |
| `ochre` | `#E6B98C` | labels, dots and emphasis on `fern` |
| `ink` | `#2C3A38` | body text on `mist` |
| `ink-soft` | `#475654` | secondary text on `mist` |
| `line` | `#A3B5BA` | hairlines, ghost-button borders |

Every text/ground pair clears WCAG AA (4.5:1) at these values. On `mist`: `ink`
7.5, `ink-soft` 4.9, `terracotta-deep` 5.2, `cream` on the terracotta pill 4.9.
On `fern`: `cream` 7.0, `cream/80` 5.2, `ochre` 4.9, and `fern` text on a
`.btn-primary-light` pill 7.0. Light-on-dark text needs **`/75` or higher** on
`fern` — below that it fails, which is why the footer's opacities are what they
are.

Contrast note: `terracotta-light` and `ochre` are too light for text on a light
ground — that is what `terracotta-deep` (on light) and `ochre` (on `fern` only)
are for. Don't set small text in `terracotta` or `terracotta-light`.

### Shadow

Three tokens, each two layers: a close contact shadow so the edge of a surface
reads, and a wide soft one so it lifts off the page. Cool-black
(`rgba(31,44,43,…)`), matching the ground — a warm or neutral-grey shadow on
these blues reads as dirt.

| Token | Used for |
|---|---|
| `shadow-soft` | buttons, the small resting state |
| `shadow-lift` | `.soft-card`, `.photo-frame`, the navbar pill, hover states |
| `shadow-deep` | the portrait, the map, the dark card on `fern` |

### Type

- **Fraunces** — headings, wordmark, prices, pull-quotes. Used at weight 400, never bold. Its `SOFT` axis is turned up (`SOFT 100`) and the optical size is kept *low* (`opsz` 24–34): high `opsz` makes Fraunces a high-contrast Didone, which reads editorial rather than calm. `WONK 1` on display headings turns on the organic alternates (the italic swashes in the hero).
- **DM Sans** — body and UI, weights 300–500.

Both are **self-hosted** from `public/fonts/` (latin subset, variable woff2) with `@font-face` at the top of `src/index.css`, and the two upright faces are preloaded in `index.html`. No Google Fonts request at runtime. To add a subset or axis, refetch from the Google Fonts CSS API and drop the woff2 alongside the others.

**The shipped font files have had their axes trimmed** by
`scripts/trim-fonts.py`: Google ships Fraunces and DM Sans with `wght 100..900`
and, on Fraunces, `opsz 9..144`, and this page uses none of that range. They are
cut to `wght 300..500` and `opsz 9..40`, which took the three files from 326 KB
to 234 KB — fonts were half the page's bytes.

Two consequences, and they are load-bearing:

- **Do not reach for a weight outside 300–500.** No `font-bold`, no
  `font-light`; the browser will clamp to the range rather than honour it, so
  the failure is silent and looks like the utility class did nothing. The
  design only ever used `font-normal` and `font-medium`, which is what made the
  trim safe
- **`opsz` above 40 is gone too.** Every serif element sets `opsz` explicitly
  (the `.font-serif` rule, then 24/26/30 on the heading classes), which is why
  automatic optical sizing never floats past the ceiling. Keep it that way, or
  widen the limit in the script first

**Replacing a font file re-inflates it** — a fresh Google Fonts download carries
the full designspace — so re-run the script after any refetch. It is not
byte-identical to the untrimmed rendering: instancing recomputes deltas, which
moved 0.25% of pixels (antialiasing) and the navbar wordmark by 1px of advance
width. Nothing rewraps. If you change the limits, redo that diff.

## Reusable CSS classes (src/index.css)

- `.label` / `.label-light` — spaced-caps section label (terracotta on light, ochre on fern)
- `.section-heading` / `.section-heading-light` — Fraunces h2 with the soft/wonk variation settings
- `.section-sub` / `.section-sub-light` — the quiet second line under a heading (see "Heading pairs" above)
- `.amp-plain` — switches Fraunces' `WONK` alternate off for a single glyph. Only the ampersand in "Cancellation & No-Show Policy" uses it: the swash `&` reads as an ornament in a heading
- `.lede` / `.lede-light` — the relaxed 1.85 line-height intro paragraph
- `.btn-primary` — terracotta pill, **on `mist` only**; `.btn-primary-light` — its cream inversion, the primary on `fern`; `.btn-ghost` — outlined pill on light; `.btn-ghost-light` — outlined pill on fern
- `.soft-card` / `.soft-card-dark` — borderless rounded surface with a soft shadow. `.soft-card` is solid `cream`, **not** white or a white overlay
- `.photo-frame` — the clip-and-lift wrapper every photo sits in (`overflow-hidden` + `shadow-lift`)
- `.hero-height` — the hero's minimum height, in `svh` where supported so mobile browser chrome can't push the buttons off screen
- `.reveal` — hidden-then-risen state, scoped to `.reveal-ready` so prerendered HTML stays visible without JS

`section[id]` and `footer[id]` carry a `scroll-margin-top` in the base layer,
so an anchor jump stops short of the floating navbar instead of under it.

Motion: `animate-breathe` (11s) on the hero's scroll-hint hairline, and the reveal transition. (`animate-drift` went with the hero's blurred washes — if you reintroduce a slow drift, define the keyframes again.) All of it is switched off under `prefers-reduced-motion`. There is no pulsing or bouncing anywhere — the whole point is that nothing on this page demands attention.

Texture: a fine SVG grain sits on `body::after` as one fixed, page-wide layer. It was originally per-section, which left a visible seam wherever two bands met — keep it at the page level.

## Section IDs (for anchor links)

`#home` · `#glance` · `#about` · `#approach` · `#services` · `#practice` · `#reviews` · `#faq` · `#rates` · `#cancellation` · `#book` · `#contact` (footer)

The Navbar links to `#practice`, `#about`, `#approach`, `#services`, `#reviews` (the `navLinks` array), plus the wordmark (`#home`) and the Book button (`#book`). The pill is 64px tall with 15px links — sized up at the client's request — and `scroll-margin-top` (`6.5rem`) clears it; grow both together. Services is the one entry with `children` — `#rates` then `#faq` — which open on hover and on focus-within, so the submenu is reachable by keyboard. Below `md` the links are hidden entirely and the pill keeps the wordmark, the call icon and Book. `#contact` exists for the footer and deep linking.

**`#practice` is Gallery.jsx — the section actually headed "The Practice".**
The hairline fact row under the hero is `#glance`, and the photo section is the
`#practice` anchor, because that is the only heading on the page reading "The
Practice" and the client asked for the menu link to land on it. (Gallery.jsx
therefore has no `#gallery` id any more; the footer's separate "Photos" link
went with it, since it now names the same section as "The Practice".) The
anchor moved once before for the same reason: it used to cover the fact row
*and* the rates, so clicking "Practice" landed a visitor on a price list, which
is why Rates.jsx exists. Whatever section carries that heading owns the id —
re-point the navbar and the footer together if it moves again.

## Where the content lives

- **Practice name, doctor, credentials, contact details** — `src/siteInfo.js`, imported everywhere. `index.html` keeps its own copy for `<meta>` tags and JSON-LD — **update both.**
- **Rates** — `src/sections/Rates.jsx` — the `rates` array
- **Cancellation policy** — `src/sections/Cancellation.jsx` — verbatim, with the
  three `reasons` items; summarised by the FAQ answer and the `FAQPage` JSON-LD
- **Session info** — `src/sections/Practice.jsx` — the `infoCards` array
- **Care settings** — `src/sections/Services.jsx` — the `settings` array (verbatim)
- **Specialties and treatments** — `src/sections/Services.jsx` — the `experience` and `provided` arrays
- **Bio** — `src/sections/About.jsx` — the `paragraphs` array (verbatim)
- **Approach** — `src/sections/Approach.jsx` — the `paragraphs` array (verbatim)
- **FAQ** — `src/sections/FAQ.jsx` — the `faqs` array (mirrored in the `FAQPage` JSON-LD in `index.html`)
- **Testimonials** — `src/sections/Reviews.jsx` — `featured`, `reviews`, and
  `moreReviews` (Chelsea, Andrija R, Mario, Scar S. — multi-paragraph; only Scar gave an age)
- **Social links** — `src/siteInfo.js` (`instagram`, `yelp`, `linkedin`), rendered
  in the footer only when set, and mirrored in the JSON-LD `sameAs`
- **The Care Hero award** — `src/sections/Reviews.jsx` — the `award` object
- **Logo** — `brand/healing-path-logo.jpg`, rebuilt by `scripts/build-logo-mark.py`
- **Contact form** — `src/components/ContactForm.jsx`; the Web3Forms key is
  `web3formsKey` in `src/siteInfo.js`
- **Map** — `src/sections/BookingCTA.jsx` — an embed query on the street address, without the suite number (`#` is a URL fragment delimiter, and the suite does not move the pin)

## The contact form

The booking section's second button used to be "Email instead", a `mailto:`
link. On a computer with no desktop mail app — the client's own laptop, which
uses Gmail in the browser — it does nothing, so he asked for a form instead.
His fields, in his words: **Full name**, **Email or phone #**, **Brief
description of the primary area of concern**, and **How did you hear about
us?** with the tick boxes Friend/Relative, Google, Social Media and Yelp.
The combined "Email or phone #" was later split, at the developer's request,
into a required **Email**, a **Phone #**, and a required **Preferred method
of contact** (Email / Phone). Phone # is optional unless they choose Phone,
in which case the browser won't submit without it. The
lines around them ("Leave your details…", the hint under the concern box, the
thank-you) are ours.

The site has no server, so `ContactForm.jsx` posts JSON to
`https://api.web3forms.com/submit`, which forwards each message to the inbox
the access key was registered with. The key is **public by design** — it can
only send to that one inbox — so it sits in `siteInfo.js` as
`web3formsKey`. The button beside "Call" reads "Send a message" and jumps to
the form (`#message`). The `mailto:` fallback was dropped at the client's
request, so **the key must stay set** — without it every message fails with
the "call instead" error. The email address itself is still in the footer. The patient's email is
always sent as `replyto`, so Reply in Gmail goes straight to them. A hidden
`botcheck` box is the honeypot for spam bots.

**This is a contact form, not a medical intake — keep it that way.** Neither
Web3Forms nor a personal Gmail signs a HIPAA business associate agreement, and
California's medical-privacy law applies to him regardless. The client chose
this option knowing that, on the condition that the concern box asks for "a
sentence or two" and no more. **Don't add fields for medical history,
medications, date of birth or insurance** without first moving to a HIPAA-
compliant form service and a Workspace inbox under a Google BAA.

## Adding photos

Photos ship at **several widths** and the browser picks one that matches the
slot, so a 306px column does not pull down an 1800px file. That means a source
photo becomes a small ladder of files, not one file.

1. Resize and re-encode the source into its ladder. Widths in use:
   - Gallery slots — `400, 700, 1100` (a slot is ~306px wide at three columns,
     and full width on a phone)
   - The Approach feature — `500, 900, 1400` (it sits in a 704px measure)
   - The About portrait — `400, 800, 1200` (~381px wide at `lg`, capped by the
     source width where that is smaller)
   - The hero logo mark — `200, 340, 680` (68px on a phone, 248–288px at `lg`);
     built by `scripts/build-logo-mark.py`, not by the snippet below
   Requires Pillow (`pip install Pillow`); WebP at `quality=80, method=6` is
   what the current set was encoded at, and lands each variant well under
   400 KB:
   ```python
   from PIL import Image
   im = Image.open(src).convert('RGB')
   for w in widths:
       h = round(im.height * w / im.width)
       im.resize((w, h), Image.LANCZOS).save(
           f'public/images/{name}-{w}.webp', 'WEBP', quality=80, method=6)
   ```
2. Drop the variants into `public/images/` as `name-<width>.webp`
3. Point the slot at them. **Never write the URL by hand** — build it with
   `responsivePhoto(name, widths)` (or `asset(path)` for a one-off file) from
   `src/images.js`, which keeps the path relative. See Deployment below for why
   an absolute `/images/…` breaks:
   - **Not the hero.** It takes no photo — the client asked for none, and a photo behind it would break the flat-band pattern the rest of the page keeps. There is no image slot there to fill
   - Portrait — the `<Photo>` in `src/sections/About.jsx`
   - Approach feature — the `<Photo>` in `src/sections/Approach.jsx` (that band is light, so the default `tone` is right)
   - Practice grid — the `photos` array in `src/sections/Gallery.jsx`. Slots render at the photo's own aspect ratio (`natural` on `<Photo>`), so the masonry staggers by itself — a fixed ratio cropped faces and hands out of frame. One column below `sm`, three at `md`
4. Set `width`/`height` on the `<Photo>` to the **largest variant's** own pixel
   dimensions, and pass a `sizes` string describing how wide the slot actually
   is. Without `sizes` the browser assumes the photo is full-viewport-width and
   downloads the largest file every time
5. Any slot with a falsy `src` renders the labelled "photo coming soon" placeholder via `src/components/Photo.jsx`, so partial photography is fine
6. Push to `main` — Actions builds and deploys automatically

## Deployment

- **GitHub Pages**: push to `main` triggers `.github/workflows/deploy.yml`
  - Actions pinned to exact versions: `checkout@v6.0.3`, `setup-node@v6.4.0`, `configure-pages@v6.0.0`, `upload-pages-artifact@v5.0.0`, `deploy-pages@v5.0.0`
  - Node 26, `npm ci`, `npm run build`, artifact from `dist/`
  - Enable at: Settings → Pages → Source → GitHub Actions
  - **`base` is `./`** — a relative base, so the same build works both at a custom-domain root (`guycatz.com/`) and under project pages (`xarlos89.github.io/guy-catz-dot-com/`). This is why the `@font-face` `url()`s are `../fonts/…` (the CSS lands in `/assets/`) and the `index.html` preloads are `./fonts/…`. **Absolute `/…` asset paths silently 404 under the sub-path** — keep new references relative. The photography did exactly this and 404'd on the `github.io` URL; everything in `public/` now goes through `asset()` / `responsivePhoto()` in `src/images.js`, which emit `./images/…`. Note `import.meta.env.BASE_URL` is **not** the fix — Vite resolves it to `/` for a relative base
  - `configure-pages` runs with `enablement: true`, so the first successful run switches Pages on itself. If it lacks permission, enable it by hand: Settings → Pages → Source → GitHub Actions
  - `public/CNAME` contains `guycatz.com` and is what tells Pages to serve the
    custom domain. **DNS has to be in place for it to resolve** — see below
- **Self-hosted**: see `Caddyfile` — drop `dist/` at `/var/www/guycatz/`, Caddy handles HTTPS

### The domain

`guycatz.com` — the apex, with no `www`. That is the canonical everywhere:
`index.html` (the `<link rel="canonical">`, `og:url`, every `@id` in the
JSON-LD), `public/sitemap.xml`, `public/robots.txt`, `public/404.html` and the
`Caddyfile`. **If it ever changes, all six change together** — the JSON-LD
`@id`s are the easy ones to miss, and a canonical pointing at a domain that
does not resolve de-indexes the site.

Apex over `www` because that is what the practice bought and what a patient
will type. GitHub Pages redirects `www` to the apex on its own once the `www`
record exists, so adding it costs nothing and catches people who type it.

**DNS records** (verified against what `xarlos89.github.io` resolves to):

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `xarlos89.github.io.` |

Then Settings → Pages → Custom domain → `guycatz.com`, and tick **Enforce
HTTPS** once the certificate is issued (it can take an hour, and the tickbox is
greyed out until then).

**Order matters.** `public/CNAME` now ships, so from the next deploy Pages
serves the site as `guycatz.com` and **redirects `xarlos89.github.io/guy-catz-dot-com/`
to it**. Until the DNS records above resolve, that redirect leads nowhere and
the site is unreachable at both URLs. Point the DNS first, or accept a gap.
Deleting `public/CNAME` reverts to the `github.io` URL if you need it back.

`base` is still `./`, so the build works at either URL and nothing about the
relative-asset rule changes.

## SEO

The page is prerendered by `vite-react-ssg`, so everything below is in the HTML
a crawler receives — there is no client-side rendering to wait for. Check that
first if a change ever seems invisible to a validator: view source, not devtools.

### What the `<head>` carries

- **`<title>`** — `Physical Therapy in Los Angeles | Healing Path Rehabilitation`,
  61 characters. Service and city first because the practice has no brand
  recognition to trade on yet; the doctor's name is not in the title and does
  not need to be — it is the `<h1>` block, the `og:title`, the `author` meta and
  the `Person` node, which is what a branded search and a knowledge panel read.
  **Keep it under ~60 characters** or Google truncates the practice name off the end
- **`<meta name="description">`** — 140 characters, ending on the phone number.
  Google shows roughly 155; anything longer is cut mid-sentence. This is not a
  ranking factor, it is the click-through pitch, so it gets the same voice rules
  as the rest of the page — plain, no catch lines
- **Canonical, Open Graph and Twitter** — all absolute to `https://guycatz.com/`.
  Absolute is correct here and is *not* a violation of the relative-asset rule:
  that rule is about files the browser fetches, and these are identity claims a
  crawler resolves against the canonical host
- **Icons and manifest** — see the layout above

### Structured data

One `@graph` in `index.html` with seven linked nodes: `WebSite` → `WebPage`
(also a `MedicalWebPage`) → `ImageObject`, and the `PhysicalTherapy` /
`LocalBusiness` practice with its `Person`, `Service` and `FAQPage`. They refer
to each other by `@id`, so a parser reads them as one description of one
business rather than seven unrelated blobs.

**Everything in it is on the page and confirmed.** Three things are deliberately
absent, and each is a trap rather than an oversight:

- **`aggregateRating` / `Review`** — the testimonials are real, but reviews a
  business publishes about itself are "self-serving" under Google's
  review-snippet policy: ignored at best, a manual action at worst. Patient
  reviews earn stars from the Google Business Profile, not from here
- **`geo`** — nobody has verified coordinates for the office, and a wrong pin is
  worse than none. The Business Profile sets the real one
- **`paymentAccepted`** — unconfirmed, and the same invented-billing-detail
  problem that removed the superbill/HSA wording
`sameAs` on the `#practice` node now carries the business Instagram
(`@HealingPathRehab`) and the Yelp page, matching `siteInfo.js`. **When the
LinkedIn lands, add it in both places.**

`availableService` carries the three care settings **and the eight specialties
from the `experience` array in `Services.jsx`** — Neurological, Orthopedic,
Cardiopulmonary, Geriatric, Sports, Vestibular, Oncological and Complex
medical, written out in full ("Vestibular rehabilitation" rather than the
one-word label the page prints) — plus what his care-settings copy adds:
home health / post-hospital discharge, return-to-sport, tension headaches,
motor vehicle accident recovery and TMJ pain. Those are the long-tail local queries a new
practice can realistically win — "vestibular rehab west los angeles" is winnable
in a way that "physical therapy los angeles" is not — so if he adds or drops a
specialty on the page, change it here in the same commit.

Keep in sync, or the markup starts lying: contact details with `siteInfo.js`,
the four per-session `Offer` prices with the `rates` array in `Rates.jsx`, the questions
with the `faqs` array in `FAQ.jsx`, the specialties with `experience` in
`Services.jsx`, and the hours with `openingHoursSpecification`. After editing,
paste the page source into the Rich Results Test and Schema.org's validator —
both, they catch different things.

### The 404 page

`public/404.html` is what GitHub Pages serves for an unknown path. It is
deliberately **self-contained** — its own inline styles, every URL absolute to
`guycatz.com` — because Pages serves it at whatever depth was requested
(`/a/b/c`), where a relative path would resolve somewhere that does not exist.
It is `noindex, follow`, and it **does not redirect**: a redirect to the home
page turns a 404 into a soft 404, which is worse than the 404 was. It borrows
the palette but not the build, so a token change here will not reach it.

### Not code, and worth more than any of the above

**A Google Business Profile is the single biggest lever for a local practice**
and none of this substitutes for it. Verify the office address, set the service
area, choose "Physical therapist" as the primary category, load the same
photography, and point the website field at `https://guycatz.com/`. Patient
reviews there are what produce stars in local results. After launch, add the
property in Search Console (the DNS-record method verifies the whole domain at
once) and submit `https://guycatz.com/sitemap.xml`.

`sitemap.xml` lists one URL because the site is one page — the anchors are
fragments of it, not separate URLs, and listing them would be spam. Its
`lastmod` is hand-maintained: update it when the copy meaningfully changes,
not on every deploy.

## What's placeholder / not yet real

Real, supplied by the practice: the practice name and doctor, his bio and credentials, the approach copy, the specialty and treatment lists, all seven testimonials, the Care Hero award, its certificate photograph and the two patient comments quoted on it, the logo, and the photography — five treatment-room frames in the gallery, the feature photo in Approach, and two portraits. `public/og-image.jpg` is cut from the same set.

The two portraits are `meet-the-doctor` (seated at the treatment table) and
`dr-guy-catz-headshot` (the tighter frame). There is only one portrait slot on
the page, so the seated one fills it — it is the warmer of the two and the page
has no other environmental shot of him. The headshot is the `image` on the
`Person` in the `index.html` JSON-LD, which is what a knowledge panel picks up.
Both are cropped by `object-cover` into a `4/5` slot, and both survive it.

The hours are the client's too: `Mon – Thu · 8am – 6pm`, with weekend
availability that varies. `siteInfo.js` and the `openingHoursSpecification` in
`index.html` both carry them — change one and change the other.

Still invented and needing replacement before launch:

- **FAQ answers** — written from the client's copy and plausible. The insurance and cancellation answers are now the client's own words (the superbill sentence and the 24-hour policy); the **direct-access** answer is still ours and needs confirming
- **The contact form's first live message** — the Web3Forms key is set, so the
  form is on the page, but no message has gone through the live site yet. Send
  one test message once it deploys and confirm it lands in his inbox before
  telling him it works
- **LinkedIn** — not yet supplied. Instagram and Yelp are live in the footer; put the LinkedIn URL in `siteInfo.js` and the `sameAs` array. The personal Instagram is deliberately not linked
- **Who gave the Care Hero award, and when** — `Reviews.jsx`, the `award`
  object: `issuer` and `period` are empty and render nothing until they are
  filled in. He said only "at the hospital last year", so neither a hospital
  name nor a year was guessed. Now that the hospital's own certificate is on
  the page as artwork, their sign-off matters more than it did

### Rates — one figure still open

Confirmed by the practice: **$250** initial evaluation, **$200** treatment,
**$200** telehealth initial evaluation, **+$50** outside the local area, **$750**
for four sessions, **$1,500** for eight and **$2,200** for twelve (eight was
$1,400 until his October edits raised it — deliberately). The packages are their own rows now that they carry numbers — they were
a single "contact for details" line while he was still doing the math. Still
open, and shown on the site anyway:

- **Telehealth session $150** — he said "either 100 to 150 depending… if it's a treatment then definitely 150", and then "I gotta think about it". The last unsettled figure on the page. If a cheaper guidance-only tier is wanted, it needs its own row. The telehealth *initial evaluation* above it is settled at $200 — he gave that figure directly — so the two telehealth rows are separate lines and only the lower one is still open
- **The mileage radius** — still undefined; at his instruction the travel row keeps the +$50 and adds "contact for details" instead of naming a boundary

HSA / FSA wording stays off the page — still unconfirmed. The **superbill**
sentence came back at the client's instruction and in his words; it is the only
out-of-network billing detail he has committed to, and it sits at the end of
the insurance paragraph in both places (see "Insurance wording" above).

One thing to raise with the client rather than fix in code: **patient testimonials in healthcare marketing usually need written, signed permission** — all seven of them now, and Mario's also describes his girlfriend's condition, so hers is the consent that matters there. Two of the first three describe care given at a rehab hospital. Worth confirming the release before launch. The Care Hero award is the same conversation twice over — the two comments on it are patients', and the award itself is the hospital's to publish, so their sign-off belongs alongside the patients'.

The certificate as supplied is a rainbow-gradient graphic carrying the
hospital's own lettering and a photo of him. It was kept off the page for a
design reason — it puts a third, fourth and fifth colour on a site that has two,
and reads as somebody else's artwork — but **the client asked for it directly,
at the end of the testimonials, in place of the typeset version**, so that
reasoning is overruled and the photograph is what closes Reviews. It ships as
`care-hero-award-{400,642}.webp`; the ladder stops at 642 because that is the
width of the file he supplied, and upscaling would only make a bigger blurry
file. It sits in a `max-w-xl` `.photo-frame` — near its own size, so the small
print stays as legible as the source allows.

**That photo is the exception, not a precedent.** One framed image on the dark
band is contained; a rainbow anywhere else on the page is not. Don't pull its
colours into a heading, a border or a badge, and don't add a second copy of it.

**The certificate is made of text, so `Reviews.jsx` carries a transcript** of it
in an `sr-only` block under the image — the label, the citation, the two patient
comments and his own closing quote. Without it a screen reader gets a picture
and nothing else. Note this is the one place his long "My favorite thing about
being a physical therapist…" quote appears: it is printed on the certificate,
so publishing the photograph publishes it, and the transcript only makes the
same words reachable. That is an equivalent for an image, not the editorial
placement the verbatim-copy rule is about — if he wants it gone, the whole
transcript goes with it. His own
long quote from the certificate ("My favourite thing about being a physical
therapist…") is not on the page either: it is his voice, and Reviews is the
patients' section. It is good writing and would sit well at the end of the
Approach if he wants it there — but that is his verbatim block, so it is his
call, not an edit to make for him.
