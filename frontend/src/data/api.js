export async function api(path, options = {}) {
  const response = await fetch((import.meta.env.VITE_API_BASE || '') + '/api/' + path, options)
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(typeof payload.detail === 'string' ? payload.detail : 'Request failed. Check the local API and try again.')
  }
  return response
}

export function postJson(path, body) {
  return api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}
