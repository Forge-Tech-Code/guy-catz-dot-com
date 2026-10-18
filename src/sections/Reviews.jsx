import Photo from '../components/Photo'
import Reveal from '../components/Reveal'
import { responsivePhoto } from '../images'
import { site } from '../siteInfo'

// Real patient testimonials, supplied by the practice.
// Keep them verbatim — edit only with the patient's permission.
const featured = {
  name: 'Deana',
  age: 53,
  text: `Dr. Guy Catz gets a 20 out of 5. He is such an amazing physical therapist and person — I don't even know where to begin. He pushes me, he's attentive. He knows his job and every part of the body so well. He's patient and he listens. Just wonderful. I arrived at the rehab hospital unable to walk or get out of bed, stiff as a board. I was scared. He was the one who got me moving and gave me hope. I said, “Guy, I want to walk out of the hospital”, he looked at me and said “I'm going to get you there”. I told him all of my goals and he actually got me to achieve each and every one of them. I can't be more thankful.`,
}

const reviews = [
  {
    name: 'Lina',
    age: 67,
    text: `Dr. Guy is realms above any PT I have experienced. His expertise, compassion and natural healing ability made such a life-changing impact on me during my treatments. The healing experience I had through him was so profound I shared it with my meditation group. I came into the clinic for my right shoulder, and simply mentioned to him that I had a severe headache. Instead of ignoring it and only focusing on my shoulder, what is covered by insurance, like most PTs would — he told me to close my eyes, he placed his hands on my neck and head, and I could feel he was channeling healing energy. My pain was fading away. I opened my eyes to see that his eyes were closed. This is the intention Guy brings to his patients. Many others will be blessed and so grateful to have experienced his loving, healing energy, and I have no doubt he will make such a difference in so many people's lives on their road to recovery.`,
  },
  {
    name: 'Miriam',
    age: 74,
    text: `I was a patient of Guy's in his early days, before he graduated from his DPT program, and he was even the best then. He is a light for all those who have the privilege of working with him.`,
  },
]

// The second set, added from the client's website-edits document. Verbatim,
// paragraph breaks included (each string is one of the patient's paragraphs).
// Only Scar gave an age; the others show none.
const moreReviews = [
  {
    name: 'Chelsea',
    paragraphs: [
      `I can't recommend Dr. Catz enough! He truly goes above and beyond, paying attention to even the smallest details and making sure I always felt heard and understood.`,
      `His empathy, patience, and genuine care made such a difference in my experience. I never felt rushed or like just another patient. It's clear Dr. Catz truly cares about helping his patients feel their physically best.`,
    ],
  },
  {
    name: 'Andrija R',
    paragraphs: [
      `I highly recommend Dr Catz!`,
      `I had a few sessions with healing path for sport related hip/back injury as well as a lower back injury I've carried for a longer period of time.`,
      `The sessions incorporated not only reworking the way I move but future movement in connection with mind, body, spirit. He emphasizes being present and aware of how to move, tailored exercises for home, and motivation for improvement. I was very impressed with his experience and patience and sincere care for diagnosis of the injury and moving toward full recovery.`,
      `He gave me the tools and guidance to heal on my own, and the peace of mind knowing there was light at the end of the tunnel which is especially important.`,
    ],
  },
  {
    name: 'Mario',
    paragraphs: [
      `We had a great experience here helping my girlfriend with her plantar fasciitis. The therapist was extremely informative and took the time to explain everything clearly, including what we should be doing, what we should avoid, and why certain things were important for her recovery.`,
      `He was incredibly patient with us and made sure we understood everything before we left. The guidance and treatment made a significant difference, and we are very grateful for all the help.`,
      `We would definitely come back and highly recommend this place to anyone looking for knowledgeable, patient, and caring physical therapy!`,
    ],
  },
  {
    name: 'Scar S.',
    age: 29,
    paragraphs: [
      `I highly recommend Dr. Catz! After ACL surgery, I was dealing with a persistent issue that wasn't improving as much as I had hoped. He took the time to understand my concerns, thoroughly assessed the problem, and developed a comprehensive treatment plan that made a real difference. Thanks to his expertise, guidance, and attention to detail, I saw significant improvement in an issue in a short amount of time.`,
      `What really sets him apart is how much he genuinely cares about his patients. He even took the time to check up on me outside of our sessions, which speaks volumes about his dedication and commitment to my recovery. That level of personal attention and care truly differentiated him and made me feel supported throughout the process. He is knowledgeable, professional, and genuinely invested in helping his patients get better. I'm very grateful for his help, and he will absolutely be my go-to physical therapist if I ever experience any other issues in the future. If you're looking for someone who is skilled, attentive, and willing to go above and beyond for his patients, I cannot recommend him highly enough!`,
    ],
  },
]

/**
 * The Care Hero award.
 *
 * The certificate photograph is now what closes the testimonials — the client
 * asked for it directly, in place of the typeset version that stood here while
 * the file was missing. It is somebody else's artwork on a rainbow ground, so
 * it breaks the page's two-colour rule; that was his call, and it is contained
 * inside one framed photo rather than allowed to spread into the band.
 *
 * The certificate is made of text, so the whole of it is transcribed into an
 * `sr-only` block below the image: without that a screen reader gets a picture
 * and nothing else. The transcript is the certificate verbatim, his own closing
 * quote included, because that quote is on the page the moment the photograph
 * is — this is an equivalent for the image, not an editorial placement of his
 * writing.
 *
 * TODO — needs the practice to fill in: `issuer` is the hospital that gave the
 * award and `period` is when (he said "last year"). Both render only once they
 * are set; nothing is guessed. An employer award is the hospital's to publish,
 * so their sign-off is worth having alongside the patients' before this goes
 * live — more so now that the hospital's own certificate is the artwork.
 */
// The source is 642px wide, so the ladder caps there rather than upscaling.
const AWARD_WIDTHS = [400, 642]
const awardPhoto = responsivePhoto('care-hero-award', AWARD_WIDTHS)

const award = {
  label: `Patient's Choice`,
  title: 'Care Hero of the Month',
  issuer: '',
  period: '',
  citation: `Guy received the most Care Hero shout outs on the daily Patient Care Report and discharge satisfaction surveys last month. Patients always compliment his kindness and his ability to connect with them.`,
  quotes: [
    `I love Guy — he's very kind.`,
    `Really good work outs and he explains everything. He's very uplifting.`,
  ],
  // His own words, printed on the certificate. Rendered only in the
  // transcript — it is in the photograph, so it is on the page either way.
  closing: `My favorite thing about being a physical therapist is having the ability to not just be of service, but to be a bringer of hope and a source of light for patients enduring very dark times. The best advice I can give is to meet the patients where they're at, and treat them how you would treat your own family member. Meet them with kindness, compassion and a listening ear. Connect. Make sure they feel seen, heard and understood. When you are with them, be WITH them. They should feel safe, comfortable and cared for throughout their plan of care, and know that you are in their corner throughout their healing process.`,
}

function Attribution({ name, age }) {
  return (
    <figcaption className="font-sans text-[13px] text-cream/75">
      <span className="font-medium text-cream">{name}</span>{age != null && <>, {age}</>}
    </figcaption>
  )
}

export default function Reviews() {
  const provenance = [award.issuer, award.period].filter(Boolean).join(' · ')

  return (
    <section id="reviews" className="bg-fern py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <Reveal>
          <div className="max-w-2xl mb-14">
            <h2 className="section-heading-light mb-3">Testimonials</h2>
            <p className="section-sub-light">In their words</p>
          </div>
        </Reveal>

        {/* The long one, given room */}
        <Reveal>
          <figure className="max-w-3xl mb-16">
            <span aria-hidden="true" className="block font-serif text-6xl text-ochre/60 leading-none mb-4">&rdquo;</span>
            <blockquote className="font-serif text-xl sm:text-2xl text-cream leading-[1.55] mb-6">
              {featured.text}
            </blockquote>
            <Attribution name={featured.name} age={featured.age} />
          </figure>
        </Reveal>

        <div className="grid md:grid-cols-[1.35fr_1fr] gap-x-12 gap-y-12 items-start">
          <Reveal>
            <figure>
              <span aria-hidden="true" className="block font-serif text-5xl text-ochre/60 leading-none mb-3">&rdquo;</span>
              <blockquote className="font-sans text-[15px] text-cream/80 leading-[1.85] mb-5">
                {reviews[0].text}
              </blockquote>
              <Attribution name={reviews[0].name} age={reviews[0].age} />
            </figure>
          </Reveal>

          <Reveal delay={110}>
            <figure className="soft-card-dark sm:p-9 md:mt-10">
              <blockquote className="font-serif text-lg sm:text-xl text-cream leading-[1.6] mb-5">
                {reviews[1].text}
              </blockquote>
              <Attribution name={reviews[1].name} age={reviews[1].age} />
            </figure>
          </Reveal>
        </div>

        {/* The second set — two by two from `md`, stacked below it (four
            quotes, so three across left one orphaned). Same quiet treatment
            as Lina's: ochre mark, cream/80 body. */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-12 mt-16 sm:mt-20 items-start">
          {moreReviews.map(({ name, age, paragraphs }, i) => (
            <Reveal key={name} delay={i * 110}>
              <figure>
                <span aria-hidden="true" className="block font-serif text-5xl text-ochre/60 leading-none mb-3">&rdquo;</span>
                <blockquote className="font-sans text-[15px] text-cream/80 leading-[1.85] mb-5 space-y-4">
                  {paragraphs.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </blockquote>
                <Attribution name={name} age={age} />
              </figure>
            </Reveal>
          ))}
        </div>

        {/* The award. A different kind of thing from a testimonial, so it
            sits apart at the end rather than in the run of quotes — but the two
            patient comments on it are testimonials, and they read as such.
            The certificate is the whole of it now; the transcript underneath
            is what a screen reader gets in place of the picture. */}
        <Reveal>
          <figure className="mt-16 sm:mt-20 max-w-xl">
            <div className="photo-frame rounded-[2rem] sm:rounded-[2.5rem] shadow-deep">
              <Photo
                {...awardPhoto}
                sizes="(min-width: 640px) 576px, calc(100vw - 48px)"
                alt={`${award.label} — ${award.title}, awarded to ${site.doctor}, ${site.credentials}`}
                natural
                width={642}
                height={617}
                tone="dark"
              />
            </div>

            {provenance && (
              <figcaption className="font-sans text-[13px] text-cream/75 mt-4">
                {provenance}
              </figcaption>
            )}

            {/* The certificate is made of text — this is that text. */}
            <div className="sr-only">
              <p>{award.label} — {award.title}. {site.doctor}, {site.credentials}.</p>
              <p>{award.citation}</p>
              {award.quotes.map((quote) => (
                <blockquote key={quote}>{quote}</blockquote>
              ))}
              <blockquote>{award.closing}</blockquote>
            </div>
          </figure>
        </Reveal>

      </div>
    </section>
  )
}
