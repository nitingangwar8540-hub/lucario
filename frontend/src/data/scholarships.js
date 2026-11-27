export const portals = {
  NSP: { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/' },
  SSP: { name: 'Karnataka State Scholarship Portal', url: 'https://ssp.postmatric.karnataka.gov.in/' },
}

export const studyLevels = ['Undergraduate', 'Postgraduate', 'Diploma']
export const domiciles = ['Karnataka', 'Other state or union territory']

export const sampleProfile = {
  state: 'Karnataka',
  level: 'Undergraduate',
  income: '180000',
  score: '78',
}

const standardDocuments = [
  'Current admission or enrollment letter',
  'Most recent marksheet',
  'Family income certificate',
]

// Fictional schemes and criteria for the frontend flow. The catalog team supplies verified records.
export const scholarships = [
  {
    id: 'demo-nsp-undergraduate', portal: 'NSP', title: 'Undergraduate Merit Grant',
    description: 'A sample award for students entering undergraduate study.',
    deadline: '15 December 2026',
    criteria: [
      { field: 'level', operator: 'equals', value: 'Undergraduate', label: 'Undergraduate enrollment' },
      { field: 'score', operator: 'minimum', value: 75, label: 'Previous score of at least 75%' },
    ],
    documents: standardDocuments,
  },
  {
    id: 'demo-ssp-karnataka', portal: 'SSP', title: 'Karnataka Study Support Grant',
    description: 'A sample post-matric award for Karnataka students with financial need.',
    deadline: '20 December 2026',
    criteria: [
      { field: 'state', operator: 'equals', value: 'Karnataka', label: 'Karnataka domicile' },
      { field: 'income', operator: 'maximum', value: 250000, label: 'Annual family income up to ₹2,50,000' },
    ],
    documents: [...standardDocuments, 'Domicile certificate'],
  },
  {
    id: 'demo-nsp-postgraduate', portal: 'NSP', title: 'Postgraduate Excellence Award',
    description: 'A sample award to explore eligibility for postgraduate study.',
    deadline: '8 January 2027',
    criteria: [
      { field: 'level', operator: 'equals', value: 'Postgraduate', label: 'Postgraduate enrollment' },
      { field: 'score', operator: 'minimum', value: 80, label: 'Previous score of at least 80%' },
    ],
    documents: ['Postgraduate admission letter', 'Undergraduate transcript'],
  },
]

const criteriaChecks = {
  equals: (actual, expected) => actual === expected,
  minimum: (actual, expected) => Number(actual) >= expected,
  maximum: (actual, expected) => Number(actual) <= expected,
}

export function matchScholarships(profile) {
  const results = scholarships.map(scheme => {
    const evaluations = scheme.criteria.map(criterion => {
      const answer = profile[criterion.field]
      let status = 'missing'

      if (answer !== '' && answer != null) {
        status = criteriaChecks[criterion.operator](answer, criterion.value) ? 'pass' : 'fail'
      }

      return { ...criterion, status }
    })

    const status = evaluations.some(rule => rule.status === 'fail')
      ? 'fail'
      : evaluations.some(rule => rule.status === 'missing') ? 'missing' : 'pass'

    return { ...scheme, evaluations, status }
  })

  const ranking = { pass: 0, missing: 1, fail: 2 }
  return results.sort((first, second) => ranking[first.status] - ranking[second.status])
}
