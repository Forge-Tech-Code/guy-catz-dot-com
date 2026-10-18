import { useState } from 'react'
import Reveal from '../components/Reveal'

const faqs = [
  {
    q: 'Where do sessions take place?',
    a: 'At your home, at the West Los Angeles office, or by telehealth.',
  },
  {
    q: 'How long is a session?',
    a: 'Approximately 1 hour.',
  },
  {
    // The client's own sentence, verbatim.
    q: 'Is your care trauma-informed?',
    a: 'We provide trauma-informed care – ensuring that you feel safe, secure, at ease, and truly cared for throughout your recovery.',
  },
  {
    q: 'Do you take insurance?',
    a: 'We currently do not accept insurance, and payment is due at the time of the visit. This ensures significantly less wait time for appointments, and you will receive direct one-on-one care guided by your goals rather than what your plan covers. We can provide superbills that you may submit to your PPO for out-of-network coverage and possible reimbursement.',
  },
  {
    q: 'Do I need a referral from a doctor?',
    a: 'No. California is a direct-access state, so you can be seen without a physician referral. If something in the evaluation needs a medical opinion, you will be told and pointed in the right direction.',
  },
  {
    q: 'How many sessions will I need?',
    a: 'Most people are seen weekly at first and taper as things settle. You will get an honest estimate after the evaluation, and it is revisited as you go.',
  },
  {
    q: 'I was just discharged from hospital. Is it too soon?',
    a: 'It is often the right time to begin. Rebuilding strength and confidence after a hospital stay is a large part of this practice, and in-home visits mean you do not have to travel to start.',
  },
  {
    q: 'What should I wear?',
    a: 'Whatever you can move in — shorts or leggings and a t-shirt work well. For an in-home visit, clear a little floor space and have any equipment you already own to hand.',
  },
  {
    q: 'What is the cancellation policy?',
    a: 'We require at least 24 hours’ notice for any cancellations or rescheduling requests. Cancellations with less than 24 hours’ notice, or missed appointments (no-shows), will be charged the full session value fee. Exceptions are considered on a case-by-case basis for true emergencies — the full policy is further down this page.',
  },
]

function FAQItem({ q, a, id }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`faq-answer-${id}`}
        className="w-full flex items-center justify-between gap-6 py-6 text-left group"
      >
        <span className="font-serif text-lg sm:text-xl text-ink leading-snug group-hover:text-fern transition-colors duration-300">
          {q}
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 w-8 h-8 rounded-full border border-line flex items-center justify-center transition-transform duration-500 ease-out ${
            open ? 'rotate-45 bg-sage/25 border-sage' : ''
          }`}
        >
          <svg className="w-3.5 h-3.5 text-ink-soft" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      {/* The answer is always in the HTML and only hidden while closed, so the
          prerendered page carries every answer — crawlers read them, and the
          FAQPage structured data in index.html describes text that is really
          on the page. */}
      <p
        id={`faq-answer-${id}`}
        hidden={!open}
        className="font-sans text-[15px] text-ink-soft leading-[1.85] pb-7 pr-12 -mt-1 max-w-2xl"
      >
        {a}
      </p>
    </div>
  )
}

export default function FAQ() {
  return (
    <section id="faq" className="bg-mist py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 items-start">
          <Reveal>
            <h2 className="section-heading mb-3">FAQ</h2>
            <p className="section-sub">Good to know</p>
          </Reveal>

          <Reveal delay={110}>
            <div>
              {faqs.map(({ q, a }, i) => (
                <FAQItem key={q} q={q} a={a} id={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
