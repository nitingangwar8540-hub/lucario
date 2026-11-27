import { useEffect, useRef, useState } from 'react'
import { api, postJson } from '../data/api'

export function RequestInput({ query, setQuery, language, setLanguage, onBusy }) {
  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState('')
  const recorder = useRef(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      recorder.current?.stream.getTracks().forEach(track => track.stop())
    }
  }, [])

  async function record() {
    if (phase === 'recording') {
      recorder.current.stop()
      setPhase('transcribing')
      return
    }
    setPhase('starting')
    onBusy(true)
    setMessage('')
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mounted.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      const capture = new MediaRecorder(stream)
      recorder.current = capture
      const chunks = []
      capture.ondataavailable = event => chunks.push(event.data)
      capture.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        if (!mounted.current) return
        try {
          const response = await api('transcribe?language=' + language, {
            method: 'POST', body: new Blob(chunks, { type: capture.mimeType }),
          })
          const { text } = await response.json()
          if (mounted.current) setQuery(text)
        } catch (error) {
          if (mounted.current) setMessage(error.message)
        } finally {
          if (mounted.current) { setPhase('idle'); onBusy(false) }
        }
      }
      capture.start()
      setPhase('recording')
    } catch {
      stream?.getTracks().forEach(track => track.stop())
      setMessage('Microphone unavailable. Type your request below.')
      setPhase('idle')
      onBusy(false)
    }
  }
  return <div className="grid gap-3 mt-4">
    <label className="form-field">Explanation language
      <select disabled={phase !== 'idle'} value={language} onChange={e => setLanguage(e.target.value)}>
        <option value="kn">ಕನ್ನಡ</option><option value="hi">हिन्दी</option><option value="en">English</option>
      </select>
    </label>
    <button className="button-secondary" type="button" disabled={['starting', 'transcribing'].includes(phase)} onClick={record}>
      {phase === 'recording' ? 'Stop recording' : phase === 'transcribing' ? 'Transcribing…' : 'Record request'}
    </button>
    <label className="form-field">Request or editable transcript
      <textarea required maxLength={500} value={query} onChange={e => setQuery(e.target.value)} />
    </label>
    {message && <p role="status">{message}</p>}
  </div>
}

export function Playback({ explanation, language }) {
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  async function speak() {
    setBusy(true)
    setMessage('')
    try {
      const response = await postJson('speech', { language, text: explanation })
      setUrl(URL.createObjectURL(await response.blob()))
    } catch (error) { setMessage(error.message) }
    finally { setBusy(false) }
  }
  return <div className="my-4 grid gap-2">
    <p lang={language}>{explanation}</p>
    <button className="button-secondary" disabled={busy} onClick={speak}>Listen to explanation</button>
    {url && <audio controls autoPlay src={url} />}
    {message && <p role="status">{message}</p>}
  </div>
}

export function Guidance({ id }) {
  const [report, setReport] = useState(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function guide() {
    setBusy(true)
    setMessage('')
    try {
      const response = await api('guidance/' + encodeURIComponent(id), { method: 'POST' })
      setReport(await response.json())
    } catch (error) { setMessage(error.message) }
    finally { setBusy(false) }
  }
  return <div className="mt-4">
    <button className="button-secondary" disabled={busy} onClick={guide}>{busy ? 'Opening walkthrough…' : 'Run fictional walkthrough'}</button>
    {message && <p role="status">{message}</p>}
    {report && <section aria-label="Walkthrough review" className="mt-4">
      <h3>Review fictional application</h3>
      <p>{report.sourceStatus === 'opened' ? 'Official source opened' : 'Portal unavailable. Showing the catalog checklist.'}</p>
      <p>{report.review.scholarship}</p>
      <p>{report.review.applicant} · ₹{report.review.annualFamilyIncomeInr}</p>
      <pre className="whitespace-pre-wrap">{report.review.documentChecklist}</pre>
      <p>Walkthrough stopped at review.</p>
    </section>}
  </div>
}
