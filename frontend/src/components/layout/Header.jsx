const links = [
  ['How it works', '#how-it-works'],
  ['Scholarship directory', '#scholarship-directory'],
  ['Matching', '#multilingual-ai-matching'],
]

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/80 bg-surface/80 shadow-[0_8px_28px_-22px_#24495a] backdrop-blur-xl">
      <div className="page-width flex min-h-[72px] items-center justify-between gap-3 py-3">
        <a className="flex min-w-0 items-center gap-2.5 text-primary" href="#home">
          <span className="material-symbols-outlined grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-[21px] text-secondary-fixed" aria-hidden="true">auto_stories</span>
          <span className="font-headline-sm text-headline-sm">ScholarSaarthi</span>
        </a>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {links.map(([label, path]) => (
            <a key={path} className="text-sm font-semibold text-on-surface-variant hover:text-secondary hover:underline" href={path}>{label}</a>
          ))}
        </nav>
        <a className="button-primary shrink-0" href="#dashboard"><span className="sr-only sm:not-sr-only">Open&nbsp;</span>Dashboard</a>
      </div>
    </header>
  )
}
