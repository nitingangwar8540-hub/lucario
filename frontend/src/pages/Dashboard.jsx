import { useEffect, useRef, useState } from 'react'
import GlassCard from '../components/GlassCard'
import { domiciles, matchScholarships, portals, sampleProfile, studyLevels } from '../data/scholarships'

const steps = ['Your profile', 'Scholarship results', 'Document checklist']
const emptyProfile = { state: '', level: '', income: '', score: '' }
const resultLabels = { pass: 'Potential match', missing: 'More information needed', fail: 'Criteria not met' }
const criterionLabels = { pass: 'Meets rule', missing: 'Missing information', fail: 'Does not meet rule' }
const statusColors = {
  pass: 'bg-[#e5f5eb] text-[#20533c]',
  missing: 'bg-[#fff1d8] text-[#76500f]',
  fail: 'bg-[#f2e9e8] text-[#783d36]',
}

function ProfileForm({ profile, setProfile, onMatch }) {
  function update(field, event) {
    setProfile(current => ({ ...current, [field]: event.target.value }))
  }

  return (
    <form className="glass-panel glass-panel-bright mt-7 p-5 sm:p-7" onSubmit={event => { event.preventDefault(); onMatch() }}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="form-field">
          Domicile state
          <select value={profile.state} onChange={event => update('state', event)}>
            <option value="">Select your domicile</option>
            {domiciles.map(state => <option key={state}>{state}</option>)}
          </select>
        </label>
        <label className="form-field">
          Level of study
          <select value={profile.level} onChange={event => update('level', event)}>
            <option value="">Select your level</option>
            {studyLevels.map(level => <option key={level}>{level}</option>)}
          </select>
        </label>
        <label className="form-field">
          Annual family income (₹)
          <input type="number" min="0" step="1" inputMode="numeric" placeholder="e.g. 180000" value={profile.income} onChange={event => update('income', event)} />
        </label>
        <label className="form-field">
          Previous exam score (%)
          <input type="number" min="0" max="100" step="0.01" inputMode="decimal" placeholder="e.g. 78" value={profile.score} onChange={event => update('score', event)} />
        </label>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">Use fictional details. Leave any field blank to see which rules need more information.</p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button className="button-primary" type="submit">Find scholarships</button>
        <button className="button-secondary" type="button" onClick={() => setProfile({ ...sampleProfile })}>Use a sample profile</button>
      </div>
    </form>
  )
}

function ScholarshipResults({ results, onOpenChecklist }) {
  const [portalFilter, setPortalFilter] = useState('all')
  const filtered = results.filter(scheme => portalFilter === 'all' || scheme.portal === portalFilter)

  return (
    <>
      <fieldset className="mt-6 flex flex-wrap gap-2">
        <legend className="mb-2 text-sm font-semibold">Filter by source</legend>
        {['all', ...Object.keys(portals)].map(portal => (
          <button key={portal} type="button" className="filter-chip" aria-pressed={portalFilter === portal} onClick={() => setPortalFilter(portal)}>
            {portal === 'all' ? 'All sources' : portal}
          </button>
        ))}
      </fieldset>
      <ul className="mt-5 grid gap-6">
        {filtered.map(scheme => (
          <GlassCard as="li" key={scheme.id} className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-secondary">{portals[scheme.portal].name}</p>
                <h2 className="mt-1 font-headline-md text-headline-md text-primary">{scheme.title}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[scheme.status]}`}>{resultLabels[scheme.status]}</span>
            </div>
            <p className="mt-2 leading-relaxed text-on-surface-variant">{scheme.description}</p>
            <ul className="my-4 divide-y divide-outline-variant/40 border-y border-outline-variant/40">
              {scheme.evaluations.map(rule => (
                <li key={rule.field} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
                  <span>{rule.label}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[rule.status]}`}>{criterionLabels[rule.status]}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-on-surface-variant">Sample deadline <strong>{scheme.deadline}</strong></p>
              <button type="button" className="button-secondary" aria-label={`View document checklist for ${scheme.title}`} onClick={() => onOpenChecklist(scheme.id)}>View document checklist</button>
            </div>
          </GlassCard>
        ))}
      </ul>
    </>
  )
}

function DocumentChecklist({ scheme, checked, onCheck }) {
  const portal = portals[scheme.portal]

  return (
    <div className="glass-panel glass-panel-bright mt-6 p-5 sm:p-7">
      <p className="text-sm font-semibold text-secondary">{portal.name}</p>
      <h2 className="mt-1 font-headline-md text-headline-md text-primary">{scheme.title}</h2>
      <dl className="mt-4 grid gap-3 rounded-xl bg-surface px-4 py-3 sm:grid-cols-2">
        <div><dt className="text-sm text-on-surface-variant">Sample deadline</dt><dd className="font-semibold">{scheme.deadline}</dd></div>
        <div><dt className="text-sm text-on-surface-variant">Last verified</dt><dd className="font-semibold">Awaiting catalog verification</dd></div>
      </dl>
      <fieldset className="mt-5">
        <legend className="font-semibold text-primary">Required documents</legend>
        <ul className="mt-2 divide-y divide-outline-variant/40">
          {scheme.documents.map(documentName => (
            <li key={documentName}>
              <label className="flex cursor-pointer items-center gap-3 py-3">
                <input type="checkbox" className="h-5 w-5 shrink-0 rounded text-secondary focus:ring-secondary" checked={checked.includes(documentName)} onChange={event => onCheck(documentName, event.target.checked)} />
                {documentName}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <p className="mt-2 text-sm font-semibold text-secondary" role="status">{checked.length} of {scheme.documents.length} documents ready</p>
      <a href={portal.url} target="_blank" rel="noreferrer" className="button-primary mt-6">Open official portal <span className="sr-only">(new tab)</span></a>
    </div>
  )
}

export default function Dashboard({ initialQuery }) {
  const [profile, setProfile] = useState(() => {
    const selections = new URLSearchParams(initialQuery)
    const state = selections.get('state')
    const level = selections.get('level')
    return {
      ...emptyProfile,
      state: domiciles.includes(state) ? state : '',
      level: studyLevels.includes(level) ? level : '',
    }
  })
  const [submittedProfile, setSubmittedProfile] = useState(null)
  const [step, setStep] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [checkedByScheme, setCheckedByScheme] = useState({})
  const heading = useRef(null)
  const results = submittedProfile ? matchScholarships(submittedProfile) : []
  const scheme = results.find(result => result.id === selectedId)

  useEffect(() => {
    heading.current?.focus()
    window.scrollTo(0, 0)
  }, [step])

  function findMatches() {
    setSubmittedProfile(profile)
    setSelectedId(null)
    setStep(1)
  }

  function updateChecklist(documentName, isChecked) {
    setCheckedByScheme(current => {
      const checked = current[selectedId] ?? []
      return {
        ...current,
        [selectedId]: isChecked ? [...checked, documentName] : checked.filter(name => name !== documentName),
      }
    })
  }

  return (
    <div className="dashboard-background min-h-screen">
      <header className="border-b border-white/80 bg-white/65 backdrop-blur-md">
        <div className="page-width flex min-h-16 items-center justify-between gap-4 py-3">
          <a className="font-headline-md text-headline-md text-primary" href="#home">ScholarSaarthi</a>
          <a className="text-sm font-semibold text-secondary hover:underline" href="#home">Back to home</a>
        </div>
      </header>
      <main className="page-width grid gap-7 py-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12 lg:py-12">
        <nav aria-label="Dashboard steps" className="self-start lg:sticky lg:top-6">
          <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {steps.map((label, index) => (
              <li key={label}>
                <button type="button" className="step-button" aria-current={step === index ? 'step' : undefined} disabled={(index === 1 && !submittedProfile) || (index === 2 && !scheme)} onClick={() => setStep(index)}>
                  <span className="inline-grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current text-xs" aria-hidden="true">{index + 1}</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="min-w-0">
          <p className="mb-2 text-sm font-semibold text-secondary">Student dashboard</p>
          <h1 ref={heading} tabIndex={-1} className="font-display-lg text-display-lg-mobile text-primary outline-none sm:text-display-lg">{steps[step]}</h1>
          {step === 0 && <p className="mt-2 max-w-xl leading-relaxed text-on-surface-variant">Enter a few details to see how scholarship criteria apply to your profile.</p>}
          {step === 0 && <ProfileForm profile={profile} setProfile={setProfile} onMatch={findMatches} />}
          {step === 1 && (
            <>
              <p className="mt-2 max-w-xl leading-relaxed text-on-surface-variant">These fictional schemes show how matching works. Verify current requirements on the official portals.</p>
              <ScholarshipResults results={results} onOpenChecklist={id => { setSelectedId(id); setStep(2) }} />
            </>
          )}
          {step === 2 && scheme && <DocumentChecklist scheme={scheme} checked={checkedByScheme[selectedId] ?? []} onCheck={updateChecklist} />}
        </div>
      </main>
    </div>
  )
}
