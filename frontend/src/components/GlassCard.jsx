export default function GlassCard({ as: Element = 'div', className = '', children }) {
  return (
    <Element className="card-wrap">
      <div className={`glass-panel hover-card ${className}`}>{children}</div>
    </Element>
  )
}
