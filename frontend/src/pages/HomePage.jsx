import { useState } from 'react'
import GlassCard from '../components/GlassCard'
import Header from '../components/layout/Header'
import { domiciles, portals, scholarships, studyLevels } from '../data/scholarships'

const process = [
  { icon: 'person', title: 'Add your profile', description: 'Enter your study level, domicile, previous score and annual family income.' },
  { icon: 'fact_check', title: 'Review your matches', description: 'See which eligibility rules you meet and which details still need confirmation.' },
  { icon: 'checklist', title: 'Prepare to apply', description: 'Review your document checklist and open the official portal when you are ready.' },
]

function HeroSection() {
  function startProfile(event) {
    event.preventDefault()
    const selections = new URLSearchParams(new FormData(event.currentTarget))
    window.location.hash = `dashboard?${selections}`
  }

  return (
    <section id="home" className="hero-background">
      <div className="page-width relative py-14 text-center sm:py-20">
        <h1 className="mx-auto max-w-[19ch] font-display-lg text-[2.7rem] font-medium leading-[1.02] tracking-tight text-primary sm:text-[4rem]">Democratizing education funding through <em className="text-secondary">intelligent guidance.</em></h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">Discover opportunities, understand the eligibility rules, and get the documents you need for your next step.</p>
        <form onSubmit={startProfile} className="glass-panel glass-panel-bright mx-auto mt-8 grid max-w-3xl items-end gap-4 p-5 text-left sm:grid-cols-[1fr_1fr_auto]">
          <label className="form-field">
            Level of study
            <select name="level">
              <option value="">Select your level</option>
              {studyLevels.map(level => <option key={level}>{level}</option>)}
            </select>
          </label>
          <label className="form-field">
            Domicile state
            <select name="state">
              <option value="">Select your domicile</option>
              {domiciles.map(state => <option key={state}>{state}</option>)}
            </select>
          </label>
          <button className="button-primary h-12" type="submit">Find my scholarships</button>
        </form>
        <a className="mt-6 inline-block text-sm font-semibold text-secondary underline underline-offset-4" href="#scholarship-directory">Explore the sample directory</a>
      </div>
    </section>
  )
}

function ScholarshipDirectory() {
  const [filter, setFilter] = useState('all')
  const visibleSchemes = scholarships.filter(scheme => filter === 'all' || scheme.portal === filter)

  return (
    <section id="scholarship-directory" className="glass-directory">
      <div className="page-width py-14 sm:py-20">
        <h2 className="section-title">Scholarship directory</h2>
        <p className="mt-2 max-w-2xl text-on-surface-variant">Browse fictional examples from the demo. Use the official portals for current schemes and deadlines.</p>
        <fieldset className="mt-5 flex flex-wrap gap-2">
          <legend className="sr-only">Filter directory by source</legend>
          {['all', ...Object.keys(portals)].map(portal => (
            <button key={portal} type="button" className="filter-chip" aria-pressed={filter === portal} onClick={() => setFilter(portal)}>
              {portal === 'all' ? 'All sources' : portal}
            </button>
          ))}
        </fieldset>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSchemes.map(scheme => (
            <GlassCard as="article" key={scheme.id} className="flex flex-col p-6">
              <p className="text-sm font-semibold text-secondary">{portals[scheme.portal].name}</p>
              <h3 className="mt-3 font-headline-md text-headline-md text-primary">{scheme.title}</h3>
              <p className="mb-5 mt-2 grow leading-relaxed text-on-surface-variant">{scheme.description}</p>
              <a href="#dashboard" className="self-start text-sm font-semibold text-secondary underline underline-offset-4">Check your profile <span className="sr-only">for {scheme.title}</span></a>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <section id="multilingual-ai-matching" className="border-y border-outline-variant/40 bg-white/70">
          <div className="page-width grid gap-6 py-12 sm:py-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="section-title">See why a scholarship fits</h2>
              <p className="mt-2 max-w-xl leading-relaxed text-on-surface-variant">Compare the rules against your profile and see what to confirm before applying.</p>
            </div>
            <GlassCard className="p-5 sm:p-6">
              <p className="font-semibold text-primary">Example eligibility check</p>
              <p className="mt-2 text-on-surface-variant">Karnataka domicile meets the sample rule. A blank income field still needs confirmation.</p>
              <a className="mt-3 inline-block text-sm font-semibold text-secondary underline underline-offset-4" href="#dashboard">Check a profile</a>
            </GlassCard>
          </div>
        </section>
        <ScholarshipDirectory />
        <section id="how-it-works" className="glass-process border-y border-outline-variant/40">
          <div className="page-width py-14 sm:py-20">
            <h2 className="section-title">How it works</h2>
            <ol className="mt-6 grid gap-6 sm:grid-cols-3">
              {process.map(item => (
                <GlassCard as="li" key={item.title} className="p-5 sm:p-6">
                  <span className="material-symbols-outlined inline-grid h-10 w-10 place-items-center rounded-xl bg-secondary-container/70 text-secondary" aria-hidden="true">{item.icon}</span>
                  <h3 className="mt-3 font-headline-sm text-headline-sm">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-on-surface-variant">{item.description}</p>
                </GlassCard>
              ))}
            </ol>
          </div>
        </section>
        <section id="success-stories" className="page-width py-14 sm:py-20">
          <h2 className="section-title">A sample student journey</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-on-surface-variant">A fictional Karnataka undergraduate can load the sample profile, compare example results, and build a document checklist for a selected scheme.</p>
        </section>
        <section className="glass-banner text-surface">
          <div className="page-width flex flex-wrap items-center justify-between gap-5 py-12 sm:py-16">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg">Find your next opportunity</h2>
            <a className="button-mint" href="#dashboard">Open dashboard</a>
          </div>
        </section>
      </main>
      <footer className="page-width flex flex-wrap items-center justify-between gap-4 py-7 text-sm">
        <a href="#home" className="font-headline-sm text-headline-sm text-primary">ScholarSaarthi</a>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Official scholarship websites">
          {Object.values(portals).map(portal => <a key={portal.url} className="text-secondary underline underline-offset-4" href={portal.url}>{portal.name}</a>)}
        </nav>
      </footer>
    </>
  )
}
