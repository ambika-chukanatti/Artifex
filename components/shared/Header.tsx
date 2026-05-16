"use client"

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/image/actions/create', label: 'Generate' },
  { href: '/credits', label: 'Buy Credits' },
  { href: '/profile', label: 'Profile' },
]

const Logo = () => (
  <Link href="/" className="header-logo">
    {/* Hex icon mark */}
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M14 2L25 8.5V19.5L14 26L3 19.5V8.5L14 2Z"
        stroke="#38bdf8"
        strokeWidth="1.4"
        fill="rgba(56,189,248,0.07)"
      />
      <path
        d="M14 7L21 11V17L14 21L7 17V11L14 7Z"
        fill="rgba(56,189,248,0.15)"
        stroke="#38bdf8"
        strokeWidth="1"
      />
      <circle cx="14" cy="14" r="2.5" fill="#38bdf8" opacity="0.9" />
    </svg>

    {/* Wordmark */}
    <span className="header-logo-text">
      ARTIF<span className="header-logo-accent">EX</span>
    </span>
  </Link>
)

const Header = () => {
  const pathname = usePathname()

  return (
    <header className="header">
      <Logo />

      <ul className="header-nav">
        {navItems.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={`nav-link${pathname === href ? ' active' : ''}`}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="header-actions">
        <SignedIn>
          <UserButton showName afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="login-btn">Login</Link>
        </SignedOut>

        <Sheet>
          <SheetTrigger className="mobile-trigger">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </SheetTrigger>
          <SheetContent side="right" className="mobile-sheet">
            <div className="mobile-sheet-logo">
              <Logo />
            </div>
            <nav className="mobile-sheet-nav">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`mobile-nav-link${pathname === href ? ' active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mobile-sheet-footer">
              <SignedIn>
                <UserButton showName afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in" className="login-btn">Login</Link>
              </SignedOut>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export default Header