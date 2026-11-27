import { useEffect, useRef, useState } from 'react'
import GlassCard from '../components/GlassCard'
import { domiciles, portals, studyLevels } from '../data/scholarships'
import { Guidance, Playback, RequestInput } from '../components/DemoControls'
import { postJson } from '../data/api'

const steps = ['Your profile', 'Scholarship results', 'Document checklist']
const emptyProfile = { state: '', level: '', income: '', percentile: '', category: '', other: '' }
const sampleProfile = { state: 'Karnataka', level: 'Undergraduate', income: '200000', percentile: '86', category: 'obc', other: 'no' }
const resultLabels = { pass: 'Matches checked criteria', needs_information: 'Potential match · missing information', manual_review: 'Potential match · needs confirmation', fail: 'Criteria not met' }
const criterionLabels = { pass: 'Meets rule', unknown: 'Missing information', manual_review: 'Needs manual review', fail: 'Does not meet rule' }
const statusColors = {
  pass: 'bg-[#e5f5eb] text-[#20533c]',
  unknown: 'bg-[#fff1d8] text-[#76500f]',
  needs_information: 'bg-[#fff1d8] text-[#76500f]',
  manual_review: 'bg-[#fff1d8] text-[#76500f]',
  fail: 'bg-[#f2e9e8] text-[#783d36]',
}

function ProfileForm({ profile, setProfile, onMatch, busy, loading, children }) {
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
          Class XII board and stream percentile
          <input type="number" min="0" max="100" step="any" value={profile.percentile} onChange={event => update('percentile', event)} />
        </label>
        <label className="form-field">Category code
          <input value={profile.category} placeholder="e.g. obc" onChange={event => update('category', event)} />
        </label>
        <label className="form-field">Receiving another scholarship or fee reimbursement?
          <select value={profile.other} onChange={event => update('other', event)}>
            <option value="">Unknown</option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </label>
      </div>
      <details className="mt-4">
        <summary>Additional profile details</summary>
        <div className="grid gap-4 mt-3 sm:grid-cols-2">
          <label className="form-field">Nationality
            <input value={profile.nationality || ''} placeholder="e.g. Indian" onChange={event => update('nationality', event)} />
          </label>
          {[
            ['disabilityPercent', 'Certified disability percentage', 100],
            ['ageAtPgAdmission', 'Age at postgraduate admission', undefined],
            ['annualParentalIncomeInr', 'Annual parental income (₹)', undefined],
          ].map(([field, label, max]) => <label className="form-field" key={field}>{label}
            <input type="number" min="0" max={max} step={field === 'disabilityPercent' ? 'any' : '1'}
              value={profile[field] || ''} onChange={event => update(field, event)} />
          </label>)}
        </div>
      </details>
      {children}
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">Use fictional details. Leave any field blank to see which rules need more information.</p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button className="button-primary" type="submit" disabled={busy}>{loading ? 'Finding scholarships…' : 'Find scholarships'}</button>
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
        {!filtered.length && <li>No schemes found for this request and source.</li>}
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
            <details className="my-4 rounded-xl border border-outline-variant/50 px-4 py-3">
              <summary>Eligibility criteria ({scheme.evaluations.length})</summary>
              <ul className="mt-3 divide-y divide-outline-variant/40 border-y border-outline-variant/40">
              {scheme.evaluations.map(rule => (
                <li key={rule.label} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
                  <span>{rule.label}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[rule.status]}`}>{criterionLabels[rule.status]}</span>
                </li>
              ))}
              </ul>
            </details>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-on-surface-variant">Catalog deadline <strong>{scheme.deadline}</strong></p>
              <a href={scheme.officialUrl} target="_blank" rel="noreferrer">Official source</a>
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
        <div><dt className="text-sm text-on-surface-variant">Catalog deadline</dt><dd>{scheme.deadline}</dd></div>
        <div><dt className="text-sm text-on-surface-variant">Last verified</dt><dd>{scheme.lastCheckedDate || 'Unknown'}</dd></div>
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
      <p className="mt-2 text-sm font-semibold text-secondary" role="status">{scheme.requiredDocuments === null ? 'Checklist unavailable. Verify with the official source.' : checked.length + ' of ' + scheme.documents.length + ' documents ready'}</p>
      <a href={scheme.officialUrl} target="_blank" rel="noreferrer" className="button-primary mt-6">Open official source</a>
      {['nsp-pm-usp-csss', 'nsp-pm-yasasvi-top-class-college'].includes(scheme.id) && <Guidance key={scheme.id} id={scheme.id} />}
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
  const [exchange, setExchange] = useState(null)
  const [language, setLanguage] = useState('kn')
  const [query, setQuery] = useState(() => new URLSearchParams(initialQuery).get('scheme') || 'ವಿದ್ಯಾರ್ಥಿವೇತನಗಳನ್ನು ಹುಡುಕಿ.')
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [checkedByScheme, setCheckedByScheme] = useState({})
  const heading = useRef(null)
  const results = (exchange?.results || []).map(({ scholarship, status, criteria }) => ({
    ...scholarship, status, title: scholarship.name, portal: scholarship.portal === 'nsp' ? 'NSP' : 'SSP',
    deadline: scholarship.deadline || 'Unknown',
    description: [scholarship.isHistorical && 'Historical cycle', scholarship.applicationCycle,
      scholarship.deadline && scholarship.deadline < new Date().toLocaleDateString('sv-SE') && 'Deadline passed'].filter(Boolean).join(' · '),
    documents: (scholarship.requiredDocuments || []).map(d => d.condition ? d.name + ' — ' + d.condition : d.name),
    evaluations: criteria.map(rule => ({ ...rule, label: rule.sourceText })),
  }))
  const scheme = results.find(result => result.id === selectedId)

  useEffect(() => {
    heading.current?.focus()
    window.scrollTo(0, 0)
  }, [step])

  async function findMatches() {
    if (loading || recording) return
    setLoading(true)
    setError('')
    const fields = {}
    if (profile.income !== '') fields.annualFamilyIncomeInr = Number(profile.income)
    if (profile.percentile !== '') fields.class12BoardStreamPercentile = Number(profile.percentile)
    if (profile.category.trim()) fields.category = profile.category.trim()
    if (profile.other) fields.receivesOtherScholarshipOrFeeReimbursement = profile.other === 'yes'
    if (profile.state) fields.domicileState = profile.state.toLowerCase()
    if (profile.level) fields.studyLevel = profile.level.toLowerCase()
    if (profile.nationality?.trim()) fields.nationality = profile.nationality.trim()
    for (const key of ['disabilityPercent', 'ageAtPgAdmission', 'annualParentalIncomeInr']) {
      if (profile[key]) fields[key] = Number(profile[key])
    }
    try {
      const response = await postJson('discover', { profile: fields, language, query: query.trim() })
      setExchange({ ...await response.json(), language })
      setSelectedId(null)
      setStep(1)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
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
      <header className="border-b border-white/80 bg-white">
        <div className="page-width flex min-h-16 items-center justify-between gap-4 py-3">
          <a className="font-headline-md text-headline-md text-primary" href="#home">ScholarSaarthi</a>
          <a className="text-sm font-semibold text-secondary hover:underline" href="#home">Back to home</a>
        </div>
      </header>
      <main className="page-width grid gap-7 py-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12 lg:py-12">
        <nav aria-label="Dashboard steps" className="dashboard-steps self-start rounded-2xl p-2 lg:sticky lg:top-6">
          <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {steps.map((label, index) => (
              <li key={label}>
                <button type="button" className="step-button" aria-current={step === index ? 'step' : undefined} disabled={loading || recording || (index === 1 && !exchange) || (index === 2 && !scheme)} onClick={() => setStep(index)}>
                  <span className="inline-grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current text-xs" aria-hidden="true">{index + 1}</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="min-w-0">
          <div className="dashboard-intro">
            <p className="mb-2 text-sm font-semibold text-emerald-100">Student dashboard · Step {step + 1} of {steps.length}</p>
          <h1 ref={heading} tabIndex={-1} className="font-display-lg text-display-lg-mobile text-white outline-none sm:text-display-lg">{steps[step]}</h1>
          {step === 0 && <p className="mt-2 max-w-xl leading-relaxed text-emerald-50">Enter a few details to see how scholarship criteria apply to your profile.</p>}
          </div>
          {step === 0 && <ProfileForm profile={profile} setProfile={setProfile} onMatch={findMatches} busy={loading || recording} loading={loading}>
            <RequestInput {...{ query, setQuery, language, setLanguage }} onBusy={setRecording} />
            {error && <p role="alert">{error}</p>}
          </ProfileForm>}
          {step === 1 && (
            <>
              <p className="mt-2 max-w-xl leading-relaxed text-on-surface-variant">{exchange.interpretation === 'catalog' ? 'Catalog search. General requests show the full catalog.' : 'Request interpreted by Gemini.'} Verify manual conditions with the official source.</p>
              <Playback explanation={exchange.explanation} language={exchange.language} />
              <ScholarshipResults results={results} onOpenChecklist={id => { setSelectedId(id); setStep(2) }} />
            </>
          )}
          {step === 2 && scheme && <DocumentChecklist scheme={scheme} checked={checkedByScheme[selectedId] ?? []} onCheck={updateChecklist} />}
        </div>
      </main>
    </div>
  )
}
