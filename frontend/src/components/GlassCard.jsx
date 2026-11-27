function moveHighlight(event) {
  if (event.pointerType === 'touch') return

  const card = event.currentTarget
  const bounds = card.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
  const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))

  card.style.setProperty('--light-x', `${x * 100}%`)
  card.style.setProperty('--light-y', `${y * 100}%`)
  card.style.setProperty('--tilt-x', `${(0.5 - y) * 9}deg`)
  card.style.setProperty('--tilt-y', `${(x - 0.5) * 9}deg`)
}

function resetHighlight(event) {
  const card = event.currentTarget
  card.style.removeProperty('--light-x')
  card.style.removeProperty('--light-y')
  card.style.removeProperty('--tilt-x')
  card.style.removeProperty('--tilt-y')
}

export default function GlassCard({ as: Element = 'div', className = '', children }) {
  return (
    <Element className="glass-tilt" onPointerMove={moveHighlight} onPointerLeave={resetHighlight} onPointerCancel={resetHighlight}>
      <div className={`glass-panel glass-tilt-face ${className}`}>{children}</div>
    </Element>
  )
}
