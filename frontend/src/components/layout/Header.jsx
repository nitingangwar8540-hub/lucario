import { useState } from 'react'

const navLinks = [
  { label: 'How It Works',           path: 'how-it-works' },
  { label: 'Scholarship Directory',  path: 'scholarship-directory' },
  { label: 'Multilingual AI Matching', path: 'multilingual-ai-matching' },
  { label: 'Document Vault',         path: 'document-vault' },
  { label: 'Success Stories',        path: 'success-stories' },
]

const languages = [
  { label: 'English',         code: 'en', active: true },
  { label: 'हिन्दी (Hindi)',  code: 'hi' },
  { label: 'தமிழ் (Tamil)',  code: 'ta' },
  { label: 'বাংলা (Bengali)', code: 'bn' },
]

export default function Header() {
  const [langOpen, setLangOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(30,43,55,0.04)]">
      <div className="h-20 max-w-[1320px] mx-auto px-gutter flex items-center justify-between gap-space-md">

        {/* ── Logo ── */}
        <div className="flex items-center gap-space-lg">
          <a className="flex items-center gap-space-sm group text-left" href="#" data-path="home">
            <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(30,43,55,0.06)]">
              <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">auto_stories</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none group-hover:text-secondary transition-colors">
                ScholarSaarthi
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">
                National Fellowship Gateway
              </span>
            </div>
          </a>
        </div>

        {/* ── Desktop Nav ── */}
        <nav className="hidden xl:flex items-center gap-space-lg">
          {navLinks.map(({ label, path }) => (
            <a
              key={path}
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-1"
              data-path={path}
              href="#"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-space-sm">

          {/* Language switcher */}
          <div className="relative">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all shadow-[0_1px_4px_rgba(30,43,55,0.02)]"
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              aria-expanded={langOpen}
            >
              <span className="material-symbols-outlined text-secondary text-[16px]">translate</span>
              <span>English / हिन्दी</span>
              <span className="material-symbols-outlined text-outline text-[14px]">expand_more</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-surface-container-lowest p-1.5 shadow-[0_12px_32px_-8px_rgba(30,43,55,0.12)] z-50">
                {languages.map(({ label, code, active }) => (
                  <a
                    key={code}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-label-md text-label-md transition-colors ${
                      active
                        ? 'text-primary bg-surface-container-low'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                    href="#"
                    onClick={() => setLangOpen(false)}
                  >
                    <span className={active ? 'font-semibold' : ''}>{label}</span>
                    {active && (
                      <span className="text-secondary font-label-sm text-label-sm">Active</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <a
              className="px-4 py-2 rounded-lg font-label-md text-label-md bg-surface-container-lowest text-primary hover:bg-surface-container hover:text-primary transition-all shadow-[0_1px_6px_rgba(30,43,55,0.04)]"
              data-path="scholarship-directory"
              href="#"
            >
              Explore Scholarships
            </a>
            <a
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-label-md text-label-md bg-primary-container text-surface hover:bg-primary transition-all shadow-[0_2px_8px_-2px_rgba(30,43,55,0.08)]"
              data-path="launch-saarthi-ai"
              href="#"
            >
              <span className="material-symbols-outlined text-secondary-fixed text-[16px]">spark</span>
              <span>Launch Saarthi AI</span>
            </a>
          </div>

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  )
}
